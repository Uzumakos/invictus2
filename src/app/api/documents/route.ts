import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const dbClient = getSupabaseAdmin();
    const url = new URL(req.url);
    const docType = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    let query = dbClient
      .from("commercial_documents")
      .select(`
        *,
        client:client_billing_profiles(*)
      `);

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
      transactionReference,
      discountTotal = 0,
      taxTotal = 0,
      subtotal = 0,
      totalAmount = 0,
      notes,
      termsConditions,
      items = []
    } = body;

    // 1. Insert master commercial document
    const docId = crypto.randomUUID();
    const docRow = {
      id: docId,
      document_type: documentType,
      document_number: documentNumber,
      client_id: clientId,
      project_id: projectId || null,
      consultation_id: consultationId || null,
      issue_date: issueDate,
      due_date: dueDate,
      currency,
      language,
      template_style: templateStyle,
      status,
      payment_link: paymentLink || null,
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

    // 2. Insert detail rows (items)
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

    return NextResponse.json({ id: docId, ...body }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
