import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyPortalSession } from "@/lib/portalAuth";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const dbClient = getSupabaseAdmin();
    const url = new URL(req.url);
    const docType = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const targetClientId = url.searchParams.get("clientId");

    // 1. Verify Authentication & Role
    let isClient = false;
    let clientProfileId = "";
    
    // Check Client Portal session
    try {
      const portalSession = await verifyPortalSession(req);
      if (portalSession && portalSession.user) {
        isClient = true;
        clientProfileId = portalSession.user.id;
      }
    } catch {}

    // Check Admin session
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const payload = await verifyToken(adminToken);
        if (payload) isAdmin = true;
      } catch {}
    }

    if (!isAdmin && !isClient) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Build Query
    let query = dbClient
      .from("commercial_documents")
      .select(`
        *,
        client:client_billing_profiles(*)
      `);

    // Enforce client scoping
    if (isClient) {
      query = query.eq("client_id", clientProfileId);
    } else if (targetClientId) {
      // Admin can filter by client
      query = query.eq("client_id", targetClientId);
    }

    if (docType) {
      query = query.eq("document_type", docType);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Convert keys to camelCase for the frontend
    const camelCased = (data || []).map((doc: any) => {
      const camelDoc: any = {};
      for (const k in doc) {
        const camelK = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        if (k === "client" && doc[k]) {
          const camelCli: any = {};
          for (const ck in doc[k]) {
            const camelCk = ck.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            camelCli[camelCk] = doc[k][ck];
          }
          camelDoc[camelK] = camelCli;
        } else {
          camelDoc[camelK] = doc[k];
        }
      }
      return camelDoc;
    });

    return NextResponse.json(camelCased);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbClient = getSupabaseAdmin();
    
    // Enforce Admin/Consultant session for creation
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const payload = await verifyToken(adminToken);
        if (payload) isAdmin = true;
      } catch {}
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      documentType,
      documentNumber,
      clientId,
      projectId,
      consultationId,
      issueDate,
      dueDate,
      currency = "USD",
      language = "fr",
      templateStyle = "modern",
      status = "draft",
      paymentLink,
      paymentMethod,
      transactionReference,
      discountTotal = 0,
      taxTotal = 0,
      subtotal = 0,
      totalAmount = 0,
      notes,
      termsConditions,
      items = []
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Client billing profile ID is required" }, { status: 400 });
    }

    // 1. Auto-generate document number sequence if not specified or placeholder
    let finalDocNumber = documentNumber;
    const prefix = documentType === "quote" ? "Q" : "INV";
    const currentYear = new Date().getFullYear();

    if (!finalDocNumber || finalDocNumber.includes("placeholder") || finalDocNumber.startsWith("QT-") || finalDocNumber.startsWith("INV-")) {
      const { count, error: countError } = await dbClient
        .from("commercial_documents")
        .select("*", { count: "exact", head: true })
        .eq("document_type", documentType)
        .like("document_number", `${prefix}-${currentYear}-%`);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 400 });
      }

      const nextSeq = (count || 0) + 1;
      finalDocNumber = `${prefix}-${currentYear}-${String(nextSeq).padStart(4, "0")}`;
    }

    // 2. Insert master commercial document
    const docId = crypto.randomUUID();
    const docRow = {
      id: docId,
      document_type: documentType,
      document_number: finalDocNumber,
      client_id: clientId,
      project_id: projectId || null,
      consultation_id: consultationId || null,
      issue_date: issueDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currency,
      language,
      template_style: templateStyle,
      status,
      payment_link: paymentLink || null,
      payment_method: paymentMethod || null,
      transaction_reference: transactionReference || null,
      discount_total: discountTotal,
      tax_total: taxTotal,
      subtotal: subtotal,
      total_amount: totalAmount,
      notes: notes || null,
      terms_conditions: termsConditions || null
    };

    const { error: docError } = await dbClient
      .from("commercial_documents")
      .insert(docRow);

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 400 });
    }

    // 3. Insert detail rows (items)
    if (items && items.length > 0) {
      const itemRows = items.map((item: any, idx: number) => ({
        id: crypto.randomUUID(),
        document_id: docId,
        description: item.description, // JSONB structure
        quantity: item.quantity || 1,
        unit_price: item.unitPrice,
        discount_percentage: item.discountPercentage || 0,
        tax_percentage: item.taxPercentage || 0,
        subtotal: item.subtotal,
        total: item.total,
        display_order: item.displayOrder || idx
      }));

      const { error: itemsError } = await dbClient
        .from("commercial_document_items")
        .insert(itemRows);

      if (itemsError) {
        // Safe cleanup master document on items insert failure
        await dbClient.from("commercial_documents").delete().eq("id", docId);
        return NextResponse.json({ error: itemsError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ id: docId, ...body, documentNumber: finalDocNumber }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
