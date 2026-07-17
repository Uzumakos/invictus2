import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const dbClient = getSupabaseAdmin();

    // 1. Fetch the quote document
    const { data: quote, error: quoteError } = await dbClient
      .from("commercial_documents")
      .select("*")
      .eq("id", quoteId)
      .maybeSingle();

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 400 });
    }
    if (!quote) {
      return NextResponse.json({ error: "Quotation document not found" }, { status: 404 });
    }
    if (quote.document_type !== "quote") {
      return NextResponse.json({ error: "Document is not a quotation" }, { status: 400 });
    }

    // 2. Auto-generate new Invoice number sequence
    const { count, error: countError } = await dbClient
      .from("commercial_documents")
      .select("*", { count: "exact", head: true })
      .eq("document_type", "invoice");

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    const nextSeq = (count || 0) + 1;
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${String(nextSeq).padStart(3, "0")}`;

    // 3. Create the cloned Invoice record
    const invoiceId = crypto.randomUUID();
    const invoiceRow = {
      id: invoiceId,
      document_type: "invoice",
      document_number: invoiceNumber,
      client_id: quote.client_id,
      project_id: quote.project_id,
      consultation_id: quote.consultation_id,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 30 days terms
      currency: quote.currency,
      language: quote.language,
      template_style: quote.template_style,
      status: "draft", // Starts as draft
      discount_total: quote.discount_total,
      tax_total: quote.tax_total,
      subtotal: quote.subtotal,
      total_amount: quote.total_amount,
      notes: quote.notes,
      terms_conditions: quote.terms_conditions
    };

    const { error: invoiceError } = await dbClient
      .from("commercial_documents")
      .insert(invoiceRow);

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    // 4. Fetch the quote line items
    const { data: quoteItems, error: itemsFetchError } = await dbClient
      .from("commercial_document_items")
      .select("*")
      .eq("document_id", quoteId);

    if (itemsFetchError) {
      // rollback invoice creation
      await dbClient.from("commercial_documents").delete().eq("id", invoiceId);
      return NextResponse.json({ error: itemsFetchError.message }, { status: 400 });
    }

    // 5. Clone and insert the line items for the invoice
    if (quoteItems && quoteItems.length > 0) {
      const invoiceItems = quoteItems.map((item: any) => ({
        id: crypto.randomUUID(),
        document_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        tax_percentage: item.tax_percentage,
        subtotal: item.subtotal,
        total: item.total,
        display_order: item.display_order
      }));

      const { error: itemsInsertError } = await dbClient
        .from("commercial_document_items")
        .insert(invoiceItems);

      if (itemsInsertError) {
        // rollback invoice creation
        await dbClient.from("commercial_documents").delete().eq("id", invoiceId);
        return NextResponse.json({ error: itemsInsertError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      id: invoiceId,
      documentType: "invoice",
      documentNumber: invoiceNumber,
      status: "draft",
      totalAmount: quote.total_amount
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
