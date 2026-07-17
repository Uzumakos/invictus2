import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbClient = getSupabaseAdmin();

    // Fetch master document
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
    const body = await req.json();

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
      transactionReference,
      discountTotal,
      taxTotal,
      subtotal,
      totalAmount,
      notes,
      termsConditions,
      items = []
    } = body;

    // 1. Update the master record
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
    if (transactionReference !== undefined) updates.transaction_reference = transactionReference || null;
    if (discountTotal !== undefined) updates.discount_total = discountTotal;
    if (taxTotal !== undefined) updates.tax_total = taxTotal;
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (totalAmount !== undefined) updates.total_amount = totalAmount;
    if (notes !== undefined) updates.notes = notes || null;
    if (termsConditions !== undefined) updates.terms_conditions = termsConditions || null;
    const { error: updateError } = await dbClient
      .from("commercial_documents")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 2. Safely apply the "Delete-then-Insert" strategy for items
    if (items !== undefined) {
      // Delete old items
      const { error: deleteError } = await dbClient
        .from("commercial_document_items")
        .delete()
        .eq("document_id", id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 });
      }

      // Insert new items
      if (items.length > 0) {
        const itemRows = items.map((item: any, idx: number) => ({
          id: crypto.randomUUID(),
          document_id: id,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unitPrice,
          discount_percentage: item.discountPercentage || 0,
          tax_percentage: item.taxPercentage || 0,
          subtotal: item.subtotal,
          total: item.total,
          display_order: item.displayOrder || idx
        }));

        const { error: insertError } = await dbClient
          .from("commercial_document_items")
          .insert(itemRows);

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 400 });
        }
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
