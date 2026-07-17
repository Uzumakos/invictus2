import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

// PDF Stylesheet (Modern layout guidelines matching brand colors)
export const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9, color: "#1F2937", backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingBottom: 20 },
  companyLogo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#FF7A00" },
  companySub: { fontSize: 8, color: "#9CA3AF", marginTop: 2 },
  docTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#111827", textTransform: "uppercase", textAlign: "right" },
  docNumber: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#4B5563", marginTop: 4, textAlign: "right" },
  section: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  textMuted: { color: "#6B7280" },
  col: { flex: 1 },
  billTo: { marginRight: 20 },
  label: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 },
  text: { fontSize: 9, color: "#1F2937", marginBottom: 2 },
  table: { marginTop: 15, marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 6, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6", paddingVertical: 6, paddingHorizontal: 4 },
  colDesc: { flex: 3, fontSize: 9, color: "#374151" },
  colQty: { flex: 1, textAlign: "center", color: "#4B5563" },
  colPrice: { flex: 1, textAlign: "right", color: "#4B5563" },
  colTotal: { flex: 1, textAlign: "right", color: "#111827", fontFamily: "Helvetica-Bold" },
  totalsArea: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  totalsTable: { width: 160 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#FF7A00", marginTop: 4 },
  grandTotalText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#FF7A00" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 0.5, borderTopColor: "#E5E7EB", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" }
});

// React PDF Document structure
export function InvoicePDF({ doc, items, client, business, lang }: { doc: any; items: any[]; client: any; business: any; lang: "en" | "fr" }) {
  const isInvoice = doc.document_type === "invoice";
  
  // Translation Dictionaries
  const labels = {
    title: isInvoice ? (lang === "fr" ? "FACTURE" : "INVOICE") : (lang === "fr" ? "DEVIS" : "QUOTE"),
    invoiceNo: lang === "fr" ? "Facture N°" : "Invoice No",
    quoteNo: lang === "fr" ? "Devis N°" : "Quote No",
    date: lang === "fr" ? "Date d'émission" : "Issue Date",
    dueDate: lang === "fr" ? "Date d'échéance" : "Due Date",
    billTo: lang === "fr" ? "Facturé à" : "Bill To",
    from: lang === "fr" ? "Émis par" : "Issued By",
    desc: lang === "fr" ? "Description" : "Description",
    qty: lang === "fr" ? "Qté" : "Qty",
    price: lang === "fr" ? "Prix Unitaire" : "Unit Price",
    amount: lang === "fr" ? "Montant" : "Amount",
    subtotal: lang === "fr" ? "Sous-total" : "Subtotal",
    discount: lang === "fr" ? "Remise" : "Discount",
    tax: lang === "fr" ? "Taxe" : "Tax",
    total: lang === "fr" ? "Total Général" : "Grand Total",
    notes: lang === "fr" ? "Termes & Conditions" : "Terms & Conditions"
  };

  const formattedNum = doc.document_number;
  const numLabel = isInvoice ? `${labels.invoiceNo}: ${formattedNum}` : `${labels.quoteNo}: ${formattedNum}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyLogo}>{business?.company_name || "INVICTUS"}</Text>
            <Text style={styles.companySub}>{business?.tagline || "Digital Transformation Center"}</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>{labels.title}</Text>
            <Text style={styles.docNumber}>{numLabel}</Text>
          </View>
        </View>

        {/* Addresses / Billing Info Section */}
        <View style={[styles.section, styles.row]}>
          <View style={[styles.col, styles.billTo]}>
            <Text style={styles.label}>{labels.billTo}</Text>
            <Text style={styles.text}>{client?.companyName || client?.email || "Valued Client"}</Text>
            {client?.email && <Text style={[styles.text, styles.textMuted]}>{client.email}</Text>}
            {client?.paymentTerms && <Text style={[styles.text, styles.textMuted]}>Terms: {client.paymentTerms}</Text>}
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>{labels.from}</Text>
            <Text style={styles.text}>{business?.company_name || "Invictus Ops"}</Text>
            {business?.email && <Text style={[styles.text, styles.textMuted]}>{business.email}</Text>}
            {business?.phone && <Text style={[styles.text, styles.textMuted]}>{business.phone}</Text>}
            {business?.website && <Text style={[styles.text, styles.textMuted]}>{business.website}</Text>}
          </View>

          <View style={{ width: 120 }}>
            <Text style={styles.label}>{labels.date}</Text>
            <Text style={[styles.text, { marginBottom: 6 }]}>{doc.issue_date}</Text>
            <Text style={styles.label}>{labels.dueDate}</Text>
            <Text style={styles.text}>{doc.due_date || "Upon Receipt"}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>{labels.desc}</Text>
            <Text style={styles.colQty}>{labels.qty}</Text>
            <Text style={styles.colPrice}>{labels.price}</Text>
            <Text style={styles.colTotal}>{labels.amount}</Text>
          </View>

          {items.map((item, idx) => {
            // Localized item description fallback
            const itemDesc = item.description?.[lang] || item.description?.["en"] || "Consulting Service";
            return (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={styles.colDesc}>{itemDesc}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>
                  {item.unit_price?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
                </Text>
                <Text style={styles.colTotal}>
                  {item.total_price?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals Summary */}
        <View style={styles.totalsArea}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.textMuted}>{labels.subtotal}</Text>
              <Text style={styles.text}>
                {doc.subtotal?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
              </Text>
            </View>

            {Number(doc.discount_amount) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.textMuted}>{labels.discount} ({doc.discount_rate}%)</Text>
                <Text style={{ color: "red" }}>
                  -{doc.discount_amount?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
                </Text>
              </View>
            )}

            {Number(doc.tax_amount) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.textMuted}>{labels.tax} ({doc.tax_rate}%)</Text>
                <Text style={styles.text}>
                  {doc.tax_amount?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>{labels.total}</Text>
              <Text style={styles.grandTotalText}>
                {doc.total_amount?.toLocaleString("en-US", { style: "currency", currency: doc.currency })}
              </Text>
            </View>
          </View>
        </View>

        {/* Document Notes */}
        {doc.notes && (
          <View style={[styles.section, { marginTop: 30 }]}>
            <Text style={styles.label}>{labels.notes}</Text>
            <Text style={[styles.text, styles.textMuted, { fontSize: 8 }]}>{doc.notes}</Text>
          </View>
        )}

        {/* Legal Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>
              {business?.legal_name || business?.company_name} &middot; Tax: {business?.tax_number || "N/A"}
            </Text>
          </View>
          <View>
            <Text style={styles.footerText}>
              Bank: {business?.bank_info?.bankName || "Swift Brokerage"} &middot; Account: {business?.bank_info?.accountNumber || "N/A"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const langParam = url.searchParams.get("lang") || "en";
    const lang = (langParam === "fr" ? "fr" : "en") as "en" | "fr";

    const dbClient = getSupabaseAdmin();

    // 1. Fetch Invoice/Quote record
    const { data: document, error: docError } = await dbClient
      .from("commercial_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 2. Fetch Client Info
    const { data: client } = await dbClient
      .from("client_billing_profiles")
      .select("*")
      .eq("id", document.client_id)
      .maybeSingle();

    // 3. Fetch Items
    const { data: items } = await dbClient
      .from("commercial_document_items")
      .select("*")
      .eq("document_id", id);

    // 4. Fetch Business legal info
    const { data: business } = await dbClient
      .from("business_profile")
      .select("*")
      .maybeSingle();

    // Generate PDF stream using react-pdf server engine
    const docBlob = React.createElement(InvoicePDF, {
      doc: document,
      items: items || [],
      client,
      business,
      lang
    }) as any;

    const pdfStream = (await pdf(docBlob).toBuffer()) as any;

    // Stream download attachment headers
    const filename = `${document.document_type}_${document.document_number}.pdf`;
    return new Response(pdfStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate PDF" }, { status: 500 });
  }
}
