import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "../export/route";
import nodemailer from "nodemailer";
import React from "react";

// Transporter instance (Uses SMTP environment parameters, falls back to a mock simulation in development)
function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Simulated Mail Transport
    return {
      sendMail: async (options: any) => {
        console.log("Simulating secure SMTP dispatch:");
        console.log(`- TO: ${options.to}`);
        console.log(`- FROM: ${options.from}`);
        console.log(`- SUBJECT: ${options.subject}`);
        console.log(`- ATTACHMENT: ${options.attachments?.[0]?.filename} (${options.attachments?.[0]?.content?.length} bytes)`);
        return { messageId: "simulated_" + Math.random().toString(36).substr(2, 9) };
      }
    };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const langParam = body.lang || "en";
    const lang = (langParam === "fr" ? "fr" : "en") as "en" | "fr";

    const dbClient = getSupabaseAdmin();

    // 1. Fetch document
    const { data: document, error: docError } = await dbClient
      .from("commercial_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 2. Fetch client
    const { data: client } = await dbClient
      .from("client_billing_profiles")
      .select("*")
      .eq("id", document.client_id)
      .maybeSingle();

    if (!client || !client.email) {
      return NextResponse.json({ error: "Client billing email is missing" }, { status: 400 });
    }

    // 3. Fetch Items
    const { data: items } = await dbClient
      .from("commercial_document_items")
      .select("*")
      .eq("document_id", id);

    // 4. Fetch business profile
    const { data: business } = await dbClient
      .from("business_profile")
      .select("*")
      .maybeSingle();

    // Render PDF into Buffer
    const docBlob = React.createElement(InvoicePDF, {
      doc: document,
      items: items || [],
      client,
      business,
      lang
    }) as any;
    
    const pdfBuffer = (await pdf(docBlob).toBuffer()) as any;

    // Setup email metadata
    const isInvoice = document.document_type === "invoice";
    const docNum = document.document_number;
    const currency = document.currency;
    const amountStr = document.total_amount?.toLocaleString("en-US", { style: "currency", currency });

    // Localized templates
    const subject = isInvoice
      ? (lang === "fr" ? `[INVICTUS] Facture ${docNum} émise` : `[INVICTUS] Invoice ${docNum} Issued`)
      : (lang === "fr" ? `[INVICTUS] Devis ${docNum} proposition` : `[INVICTUS] Quote proposal ${docNum}`);

    const welcomeMsg = lang === "fr"
      ? `Bonjour ${client.companyName || "Client"},<br/><br/>Veuillez trouver ci-joint votre document commercial.`
      : `Dear ${client.companyName || "Valued Client"},<br/><br/>Please find attached your commercial document.`;

    const summaryLabel = lang === "fr" ? "Détails du document :" : "Document summary:";
    const docTypeLabel = lang === "fr" ? "Type" : "Type";
    const numberLabel = lang === "fr" ? "Numéro" : "Number";
    const amountLabel = lang === "fr" ? "Montant total" : "Total Amount";
    const termsLabel = lang === "fr" ? "Conditions" : "Terms";
    const closingMsg = lang === "fr"
      ? "Merci de votre collaboration.<br/>L'équipe Invictus."
      : "Thank you for your business.<br/>The Invictus Team.";

    const htmlBody = `
      <div style="font-family: sans-serif; font-size: 14px; color: #1F2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px;">
        <h2 style="color: #FF7A00; margin-top: 0;">${business?.company_name || "INVICTUS"}</h2>
        <p>${welcomeMsg}</p>
        
        <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">${summaryLabel}</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #6B7280;">${docTypeLabel}:</td>
              <td style="padding: 4px 0; font-weight: bold; text-transform: capitalize;">${document.document_type}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6B7280;">${numberLabel}:</td>
              <td style="padding: 4px 0; font-weight: bold;">${docNum}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6B7280;">${amountLabel}:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #FF7A00;">${amountStr}</td>
            </tr>
            ${client.paymentTerms ? `
            <tr>
              <td style="padding: 4px 0; color: #6B7280;">${termsLabel}:</td>
              <td style="padding: 4px 0;">${client.paymentTerms}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <p>${closingMsg}</p>
      </div>
    `;

    // Dispatch email
    const transporter = createTransporter() as any;
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Invictus Billing" <billing@invictus.center>`,
      to: client.email,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename: `${document.document_type}_${docNum}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    console.error("Failed to send billing email:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch email" }, { status: 500 });
  }
}
