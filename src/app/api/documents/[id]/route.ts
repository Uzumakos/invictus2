import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyPortalSession } from "@/lib/portalAuth";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbClient = getSupabaseAdmin();

    // 1. Fetch master document
    const { data: doc, error: docError } = await dbClient
      .from("commercial_documents")
      .select(`
        *,
        client:client_billing_profiles(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 400 });
    }
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 2. Verify Session Permissions
    let isClient = false;
    let clientProfileId = "";
    try {
      const portalSession = await verifyPortalSession(req);
      if (portalSession && portalSession.user) {
        isClient = true;
        clientProfileId = portalSession.user.id;
      }
    } catch {}

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

    // Client can only view their own documents
    if (isClient && doc.client_id !== clientProfileId) {
      return NextResponse.json({ error: "Unauthorized: Access denied" }, { status: 403 });
    }

    // Fetch line items
    const { data: items, error: itemsError } = await dbClient
      .from("commercial_document_items")
      .select("*")
      .eq("document_id", id)
      .order("display_order", { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    // Format output keys to camelCase
    const formatKeys = (obj: any): any => {
      if (!obj) return null;
      const formatted: any = {};
      for (const k in obj) {
        const camelK = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        formatted[camelK] = obj[k];
      }
      return formatted;
    };

    const formattedDoc = formatKeys(doc);
    if (doc.client) {
      formattedDoc.client = formatKeys(doc.client);
    }
    formattedDoc.items = (items || []).map((item: any) => formatKeys(item));

    return NextResponse.json(formattedDoc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbClient = getSupabaseAdmin();

    // 1. Verify Sessions
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const payload = await verifyToken(adminToken);
        if (payload) isAdmin = true;
      } catch {}
    }

    let isClient = false;
    let clientProfileId = "";
    try {
      const portalSession = await verifyPortalSession(req);
      if (portalSession && portalSession.user) {
        isClient = true;
        clientProfileId = portalSession.user.id;
      }
    } catch {}

    const body = await req.json();

    // Fetch existing document to check status transition and client ownership
    const { data: document, error: fetchErr } = await dbClient
      .from("commercial_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    let isClientQuoteAction = false;
    if (isClient && document.document_type === "quote" && document.client_id === clientProfileId) {
      // Client is allowed to update status to 'accepted' or 'declined'
      const bodyKeys = Object.keys(body);
      if (bodyKeys.length === 1 && bodyKeys[0] === "status" && (body.status === "accepted" || body.status === "declined")) {
        isClientQuoteAction = true;
      }
    }

    if (!isAdmin && !isClientQuoteAction) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const {
      documentType,
      documentNumber,
      clientId,
      projectId,
      consultationId,
      issueDate,
      dueDate,
      currency,
      language,
      templateStyle,
      status,
      paymentLink,
      paymentMethod,
      transactionReference,
      discountTotal,
      taxTotal,
      subtotal,
      totalAmount,
      notes,
      termsConditions,
      items = []
    } = body;

    // 2. Update the master record
    const updates: any = {};
    if (documentType !== undefined) updates.document_type = documentType;
    if (documentNumber !== undefined) updates.document_number = documentNumber;
    if (clientId !== undefined) updates.client_id = clientId;
    if (projectId !== undefined) updates.project_id = projectId || null;
    if (consultationId !== undefined) updates.consultation_id = consultationId || null;
    if (issueDate !== undefined) updates.issue_date = issueDate;
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (currency !== undefined) updates.currency = currency;
    if (language !== undefined) updates.language = language;
    if (templateStyle !== undefined) updates.template_style = templateStyle;
    if (status !== undefined) updates.status = status;
    if (paymentLink !== undefined) updates.payment_link = paymentLink || null;
    if (paymentMethod !== undefined) updates.payment_method = paymentMethod || null;
    if (transactionReference !== undefined) updates.transaction_reference = transactionReference || null;
    if (discountTotal !== undefined) updates.discount_total = discountTotal;
    if (taxTotal !== undefined) updates.tax_total = taxTotal;
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (totalAmount !== undefined) updates.total_amount = totalAmount;
    if (notes !== undefined) updates.notes = notes || null;
    if (termsConditions !== undefined) updates.terms_conditions = termsConditions || null;

    const isTransitioningToPaid = 
      document.document_type === "invoice" && 
      document.status !== "paid" && 
      status === "paid";

    if (isTransitioningToPaid) {
      updates.paid_at = new Date().toISOString();
      updates.payment_method = body.paymentMethod || document.payment_method || "manual";
      updates.transaction_reference = body.transactionReference || document.transaction_reference || "";
    }

    const { error: updateError } = await dbClient
      .from("commercial_documents")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 3. Safely apply the "Delete-then-Insert" strategy for items
    if (items !== undefined && items.length > 0) {
      // Delete old items
      const { error: deleteError } = await dbClient
        .from("commercial_document_items")
        .delete()
        .eq("document_id", id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 });
      }

      // Insert new items
      const itemRows = items.map((item: any, idx: number) => ({
        id: crypto.randomUUID(),
        document_id: id,
        description: typeof item.description === "object" ? item.description : { en: item.description, fr: item.description },
        quantity: item.quantity || 1,
        unit_price: item.unitPrice ?? item.unit_price,
        discount_percentage: item.discountPercentage ?? item.discount_percentage ?? 0,
        tax_percentage: item.taxPercentage ?? item.tax_percentage ?? 0,
        subtotal: item.subtotal,
        total: item.total,
        display_order: item.displayOrder ?? item.display_order ?? idx
      }));

      const { error: insertError } = await dbClient
        .from("commercial_document_items")
        .insert(itemRows);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    // 4. Trigger Auto Paid Billing Workflow
    if (isTransitioningToPaid) {
      try {
        const year = new Date().getFullYear();
        const payMethod = body.paymentMethod || document.payment_method || "manual";
        const transRef = body.transactionReference || document.transaction_reference || "";

        // A. Generate Receipt Number Sequence
        const { count: recCount } = await dbClient
          .from("commercial_documents")
          .select("*", { count: "exact", head: true })
          .eq("document_type", "receipt")
          .like("document_number", `REC-${year}-%`);
        const nextRecSeq = (recCount || 0) + 1;
        const receiptNumber = `REC-${year}-${String(nextRecSeq).padStart(4, "0")}`;

        // B. Insert Receipt Document
        const receiptId = crypto.randomUUID();
        const receiptRow = {
          id: receiptId,
          document_type: "receipt",
          document_number: receiptNumber,
          client_id: document.client_id,
          project_id: document.project_id || null,
          consultation_id: document.consultation_id || null,
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date().toISOString().split("T")[0],
          currency: document.currency,
          language: document.language || "fr",
          template_style: document.template_style || "modern",
          status: "paid",
          payment_method: payMethod,
          transaction_reference: transRef,
          discount_total: document.discount_total || 0,
          tax_total: document.tax_total || 0,
          subtotal: document.subtotal || 0,
          total_amount: document.total_amount || 0,
          notes: document.notes || "Receipt generated automatically on payment confirmation.",
          terms_conditions: document.terms_conditions,
          related_document_id: document.id,
          paid_at: new Date().toISOString()
        };

        const { error: recErr } = await dbClient
          .from("commercial_documents")
          .insert(receiptRow);

        if (!recErr) {
          // Clone items from Invoice to Receipt
          const { data: invItems } = await dbClient
            .from("commercial_document_items")
            .select("*")
            .eq("document_id", document.id);

          if (invItems && invItems.length > 0) {
            const receiptItems = invItems.map((item: any, idx: number) => ({
              id: crypto.randomUUID(),
              document_id: receiptId,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount_percentage: item.discount_percentage,
              tax_percentage: item.tax_percentage,
              subtotal: item.subtotal,
              total: item.total,
              display_order: item.display_order ?? idx
            }));
            await dbClient.from("commercial_document_items").insert(receiptItems);
          }

          // C. Generate Payment Number Sequence
          const { count: payCount } = await dbClient
            .from("portal_payments")
            .select("*", { count: "exact", head: true })
            .like("payment_number", `PAY-${year}-%`);
          const nextPaySeq = (payCount || 0) + 1;
          const paymentNumber = `PAY-${year}-${String(nextPaySeq).padStart(4, "0")}`;

          // Fetch Client Billing Profile details
          const { data: clientProfile } = await dbClient
            .from("client_billing_profiles")
            .select("*")
            .eq("id", document.client_id)
            .maybeSingle();

          // D. Create Portal Payment record (Transactions)
          const serviceTitleDesc = invItems?.[0]?.description?.en || invItems?.[0]?.description?.fr || "Consulting Services";
          const paymentRow = {
            id: crypto.randomUUID(),
            client_email: clientProfile?.email || "billing@invictus.com",
            client_name: clientProfile?.primary_contact_name || clientProfile?.company_name || "Client",
            amount: document.total_amount,
            currency: document.currency,
            service: serviceTitleDesc,
            date: new Date().toISOString().split("T")[0],
            status: "paid",
            invoice_url: document.payment_link || "",
            payment_method: payMethod,
            payment_reference: transRef,
            payment_number: paymentNumber,
            client_id: document.client_id,
            invoice_id: document.id,
            receipt_id: receiptId,
            gateway: payMethod,
            paid_at: new Date().toISOString()
          };
          await dbClient.from("portal_payments").insert(paymentRow);

          // E. CRM Activity & Lead status update
          if (clientProfile?.email) {
            const { data: lead } = await dbClient
              .from("leads")
              .select("*")
              .eq("email", clientProfile.email)
              .maybeSingle();

            if (lead) {
              await dbClient.from("leads").update({
                status: "won",
                last_activity: new Date().toISOString(),
                next_action: "Setup onboarding kickoff"
              }).eq("id", lead.id);
            }
          }

          // F. Client Portal Notification
          const notifId = `notif_${crypto.randomBytes(6).toString("hex")}`;
          await dbClient.from("portal_notifications").insert({
            id: notifId,
            client_email: clientProfile?.email || "billing@invictus.com",
            text: `Receipt generated for paid Invoice ${document.document_number}. Total: ${document.total_amount} ${document.currency}.`,
            type: "payment",
            read: false,
            timestamp: new Date().toISOString()
          });

          // G. Dispatch Email Receipt
          const origin = req.nextUrl.origin || "http://localhost:3000";
          fetch(`${origin}/api/documents/${receiptId}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang: document.language || "fr" })
          }).catch(e => console.error("Email receipt dispatch error:", e.message));
        }
      } catch (workflowErr: any) {
        console.error("Auto Paid Workflow Error:", workflowErr.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbClient = getSupabaseAdmin();

    const { error } = await dbClient
      .from("commercial_documents")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
