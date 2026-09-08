import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { requireAdmin } from "@/lib/apiAuth";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 8, color: "#1F2937", backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingBottom: 15 },
  companyTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#FF7A00" },
  companySub: { fontSize: 7, color: "#9CA3AF", marginTop: 2 },
  reportTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#111827", textTransform: "uppercase", textAlign: "right" },
  reportMeta: { fontSize: 8, color: "#6B7280", marginTop: 4, textAlign: "right" },
  table: { marginTop: 15, marginBottom: 15 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 5, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6", paddingVertical: 5, paddingHorizontal: 4 },
  tableCell: { flex: 1, color: "#374151" },
  tableHeaderCell: { flex: 1, color: "#111827", fontFamily: "Helvetica-Bold" },
  summaryArea: { marginTop: 15, padding: 10, backgroundColor: "#F9FAFB", borderRadius: 4, borderLeftWidth: 2, borderLeftColor: "#FF7A00" },
  summaryText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 0.5, borderTopColor: "#E5E7EB", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 6, color: "#9CA3AF" }
});

// Reusable PDF Template
function BIReportPDF({ title, headers, rows, summary }: { title: string; headers: string[]; rows: string[][]; summary?: string[] }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.companyTitle}>INVICTUS</Text>
            <Text style={pdfStyles.companySub}>Business Intelligence & Financial Planning Hub</Text>
          </View>
          <View>
            <Text style={pdfStyles.reportTitle}>{title}</Text>
            <Text style={pdfStyles.reportMeta}>Generated on: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={pdfStyles.table}>
          {/* Header Row */}
          <View style={pdfStyles.tableHeader}>
            {headers.map((h, i) => (
              <Text key={i} style={pdfStyles.tableHeaderCell}>{h}</Text>
            ))}
          </View>
          {/* Content Rows */}
          {rows.map((row, rIdx) => (
            <View key={rIdx} style={pdfStyles.tableRow}>
              {row.map((cell, cIdx) => (
                <Text key={cIdx} style={pdfStyles.tableCell}>{cell}</Text>
              ))}
            </View>
          ))}
        </View>

        {/* Summary */}
        {summary && summary.length > 0 && (
          <View style={pdfStyles.summaryArea}>
            {summary.map((line, idx) => (
              <Text key={idx} style={pdfStyles.summaryText}>{line}</Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>CONFIDENTIAL - FOR INTERNAL BUSINESS PLANNING ONLY</Text>
          <Text style={pdfStyles.footerText}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const reportType = url.searchParams.get("reportType") || "monthly_financial";
    const format = url.searchParams.get("format") || "csv"; // csv, excel, pdf

    const dbClient = getSupabaseAdmin();

    // 1. Fetch tables required
    const [
      { data: revenues },
      { data: expenses },
      { data: subscriptions },
      { data: budgets },
      { data: fundingGoals },
      { data: fundingContributions },
      { data: assets }
    ] = await Promise.all([
      dbClient.from("revenues").select("*"),
      dbClient.from("expenses").select("*"),
      dbClient.from("subscriptions").select("*"),
      dbClient.from("budgets").select("*"),
      dbClient.from("funding_goals").select("*"),
      dbClient.from("funding_contributions").select("*"),
      dbClient.from("asset_registry").select("*")
    ]);

    const revList = revenues || [];
    const expList = expenses || [];
    const subList = subscriptions || [];
    const budList = budgets || [];
    const goalList = fundingGoals || [];
    const contribList = fundingContributions || [];
    const assetList = assets || [];

    let title = "BI Report";
    let headers: string[] = [];
    let rows: string[][] = [];
    let summary: string[] = [];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 2. Build report data based on type
    switch (reportType) {
      case "monthly_financial":
        title = `Monthly Financial Summary - M${currentMonth} ${currentYear}`;
        headers = ["Indicator", "MTD Value", "YTD Value"];
        const mtdRev = revList.filter((r: any) => new Date(r.date).getMonth() + 1 === currentMonth && r.status === "paid").reduce((a, c) => a + Number(c.amount), 0);
        const ytdRev = revList.filter((r: any) => new Date(r.date).getFullYear() === currentYear && r.status === "paid").reduce((a, c) => a + Number(c.amount), 0);
        const mtdExp = expList.filter((e: any) => new Date(e.date).getMonth() + 1 === currentMonth).reduce((a, c) => a + Number(c.amount), 0);
        const ytdExp = expList.filter((e: any) => new Date(e.date).getFullYear() === currentYear).reduce((a, c) => a + Number(c.amount), 0);
        
        rows = [
          ["Total Revenue", `$${mtdRev.toLocaleString()}`, `$${ytdRev.toLocaleString()}`],
          ["Total Expenses", `$${mtdExp.toLocaleString()}`, `$${ytdExp.toLocaleString()}`],
          ["Net Profit", `$${(mtdRev - mtdExp).toLocaleString()}`, `$${(ytdRev - ytdExp).toLocaleString()}`],
          ["Estimated Tax (15%)", `$${((mtdRev - mtdExp) > 0 ? (mtdRev - mtdExp) * 0.15 : 0).toLocaleString()}`, `$${((ytdRev - ytdExp) > 0 ? (ytdRev - ytdExp) * 0.15 : 0).toLocaleString()}`]
        ];
        summary = [
          `Current Month Net cash: $${(mtdRev - mtdExp).toLocaleString()}`,
          `YTD Margin: ${ytdRev > 0 ? ((ytdRev - ytdExp) / ytdRev * 100).toFixed(1) : 0}%`
        ];
        break;

      case "annual_financial":
        title = `Annual Financial Summary - Y${currentYear}`;
        headers = ["Month", "Revenue", "Expenses", "Net Profit"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let totalAnnRev = 0;
        let totalAnnExp = 0;
        months.forEach((m, idx) => {
          const revMonth = revList.filter((r: any) => {
            const d = new Date(r.date);
            return d.getFullYear() === currentYear && d.getMonth() === idx && r.status === "paid";
          }).reduce((a, c) => a + Number(c.amount), 0);

          const expMonth = expList.filter((e: any) => {
            const d = new Date(e.date);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          }).reduce((a, c) => a + Number(c.amount), 0);

          rows.push([m, `$${revMonth.toLocaleString()}`, `$${expMonth.toLocaleString()}`, `$${(revMonth - expMonth).toLocaleString()}`]);
          totalAnnRev += revMonth;
          totalAnnExp += expMonth;
        });
        summary = [
          `Annual Total Revenue: $${totalAnnRev.toLocaleString()}`,
          `Annual Total Expenses: $${totalAnnExp.toLocaleString()}`,
          `Annual Net Profit: $${(totalAnnRev - totalAnnExp).toLocaleString()}`
        ];
        break;

      case "revenue":
        title = "Revenue Report";
        headers = ["Date", "Client", "Category", "Payment Method", "Amount", "Currency", "Status"];
        revList.forEach((r: any) => {
          rows.push([
            r.date || "",
            r.client_name || "N/A",
            r.category || "N/A",
            r.payment_method || "N/A",
            `$${(Number(r.amount) || 0).toLocaleString()}`,
            r.currency || "USD",
            r.status || "N/A"
          ]);
        });
        summary = [`Total Revenues Logged: $${revList.filter(r => r.status === "paid").reduce((a, c) => a + Number(c.amount), 0).toLocaleString()}`];
        break;

      case "expense":
        title = "Expense Report";
        headers = ["Date", "Expense Name", "Category", "Vendor", "Amount", "Currency", "Recurring"];
        expList.forEach((e: any) => {
          rows.push([
            e.date || "",
            e.expense_name || "",
            e.category || "",
            e.vendor || "",
            `$${(Number(e.amount) || 0).toLocaleString()}`,
            e.currency || "USD",
            e.recurring ? "Yes" : "No"
          ]);
        });
        summary = [`Total Expenses Logged: $${expList.reduce((a, c) => a + Number(c.amount), 0).toLocaleString()}`];
        break;

      case "subscription":
        title = "SaaS Subscriptions Report";
        headers = ["Service Name", "Category", "Vendor", "Monthly Cost", "Yearly Cost", "Renewal Date", "Status"];
        let totalMonthlyCost = 0;
        subList.forEach((s: any) => {
          rows.push([
            s.service_name || "",
            s.category || "",
            s.vendor || "",
            `$${(Number(s.monthly_cost) || 0).toLocaleString()}`,
            `$${(Number(s.yearly_cost) || 0).toLocaleString()}`,
            s.renewal_date || "",
            s.status || ""
          ]);
          if (s.status === "active") totalMonthlyCost += Number(s.monthly_cost) || 0;
        });
        summary = [`Active Monthly Cost: $${totalMonthlyCost.toLocaleString()}`, `Active Yearly Cost: $${(totalMonthlyCost * 12).toLocaleString()}`];
        break;

      case "budget":
        title = `Monthly Budget Report - M${currentMonth} ${currentYear}`;
        headers = ["Category", "Allocated", "Spent", "Remaining", "Usage %"];
        const currentMonthBudgets = budList.filter((b: any) => b.year === currentYear && b.month === currentMonth);
        const categories = ["Marketing", "AI", "Cloud", "Travel", "Office", "Software", "Equipment", "Training"];
        categories.forEach(cat => {
          const budgetRow = currentMonthBudgets.find((b: any) => b.category === cat);
          const allocated = budgetRow ? Number(budgetRow.allocated_budget) : 0;
          const spent = expList
            .filter((e: any) => e.category === cat && new Date(e.date).getMonth() + 1 === currentMonth && new Date(e.date).getFullYear() === currentYear)
            .reduce((a, c) => a + Number(c.amount), 0);
          rows.push([
            cat,
            `$${allocated.toLocaleString()}`,
            `$${spent.toLocaleString()}`,
            `$${(allocated - spent).toLocaleString()}`,
            allocated > 0 ? `${((spent / allocated) * 100).toFixed(1)}%` : "0%"
          ]);
        });
        break;

      case "cash_flow":
        title = "Cash Flow Statement";
        headers = ["Date", "Category", "Type", "Details", "Amount", "Currency"];
        revList.forEach((r: any) => {
          if (r.status === "paid") {
            rows.push([r.date || "", r.category || "", "Income", r.notes || "", `+$${Number(r.amount).toLocaleString()}`, r.currency || "USD"]);
          }
        });
        expList.forEach((e: any) => {
          rows.push([e.date || "", e.category || "", "Expense", e.expense_name || "", `-$${Number(e.amount).toLocaleString()}`, e.currency || "USD"]);
        });
        // Sort by date descending
        rows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
        break;

      case "funding_goal":
        title = "Funding Goals Progress Report";
        headers = ["Goal Name", "Category", "Target Cost", "Current Savings", "Remaining", "Strategy", "Status"];
        goalList.forEach((g: any) => {
          rows.push([
            g.goal_name || "",
            g.category || "",
            `$${(Number(g.target_cost) || 0).toLocaleString()}`,
            `$${(Number(g.current_savings) || 0).toLocaleString()}`,
            `$${(Math.max(0, Number(g.target_cost) - Number(g.current_savings))).toLocaleString()}`,
            g.funding_strategy || "",
            g.status || ""
          ]);
        });
        break;

      case "savings":
        title = "Funding Goal Savings Ledger";
        headers = ["Date", "Goal ID / Name", "Contribution Amount", "Source Details"];
        contribList.forEach((c: any) => {
          const goal = goalList.find((g: any) => g.id === c.goal_id);
          rows.push([
            c.date || "",
            goal ? goal.goal_name : c.goal_id,
            `$${(Number(c.amount) || 0).toLocaleString()}`,
            c.source || ""
          ]);
        });
        break;

      case "asset_register":
      case "asset_registry":
        title = "Business Asset Register";
        headers = ["Asset Name", "Category", "Purchase Date", "Cost", "Serial Number", "Condition", "Status"];
        assetList.forEach((a: any) => {
          rows.push([
            a.asset_name || "",
            a.category || "",
            a.purchase_date || "",
            `$${(Number(a.purchase_cost) || 0).toLocaleString()}`,
            a.serial_number || "N/A",
            a.condition || "New",
            a.status || "Active"
          ]);
        });
        summary = [
          `Total Assets Value: $${assetList.reduce((acc, curr) => acc + Number(curr.purchase_cost), 0).toLocaleString()}`
        ];
        break;

      default:
        // Generic fallback showing general statistics
        title = "General Financial Report";
        headers = ["Indicator", "Value"];
        rows = [
          ["Total Revenue Recorded", `$${revList.filter(r => r.status === "paid").reduce((a, c) => a + Number(c.amount), 0).toLocaleString()}`],
          ["Total Expenses Recorded", `$${expList.reduce((a, c) => a + Number(c.amount), 0).toLocaleString()}`],
          ["Active Subscriptions", `${subList.filter(s => s.status === "active").length}`],
          ["Active Funding Goals", `${goalList.filter(g => g.status === "Saving").length}`]
        ];
        break;
    }

    // 3. Format response
    if (format === "pdf") {
      const docBlob = React.createElement(BIReportPDF, { title, headers, rows, summary }) as any;
      const pdfStream = (await pdf(docBlob).toBuffer()) as any;
      return new Response(pdfStream, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${reportType}_report.pdf"`
        }
      });
    }

    // Excel and CSV output
    // CSV output
    let fileContent = "";
    if (format === "excel") {
      // TSV format with Excel mime type
      fileContent = [
        title,
        `Generated: ${new Date().toLocaleDateString()}`,
        "",
        headers.join("\t"),
        ...rows.map(r => r.join("\t")),
        "",
        ...(summary.length > 0 ? ["Summary:", ...summary] : [])
      ].join("\r\n");

      return new Response(fileContent, {
        headers: {
          "Content-Type": "application/vnd.ms-excel",
          "Content-Disposition": `attachment; filename="${reportType}_report.xls"`
        }
      });
    } else {
      // Standard CSV format
      fileContent = [
        `"${title.replace(/"/g, '""')}"`,
        `"Generated: ${new Date().toLocaleDateString()}"`,
        "",
        headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
        ...rows.map(r => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")),
        "",
        ...(summary.length > 0 ? summary.map(s => `"${s.replace(/"/g, '""')}"`) : [])
      ].join("\n");

      return new Response(fileContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}_report.csv"`
        }
      });
    }

  } catch (err: any) {
    console.error("BI Export Route Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
