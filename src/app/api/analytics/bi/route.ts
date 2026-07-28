import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const dbClient = getSupabaseAdmin();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-indexed (July = 7)

    // 1. Fetch Invoices and Receipts
    const { data: documents, error: docsError } = await dbClient
      .from("commercial_documents")
      .select(`
        *,
        client:client_billing_profiles(*)
      `)
      .in("document_type", ["invoice", "receipt"]);

    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 400 });
    }

    // 2. Fetch Recent Transactions
    const { data: recentTransactions } = await dbClient
      .from("portal_payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Initial Metric Accumulators
    let mtdRevenue = 0;
    let ytdRevenue = 0;

    let outstandingCount = 0;
    let outstandingAmount = 0;

    let paidCount = 0;
    let paidAmount = 0;

    let overdueCount = 0;
    let overdueAmount = 0;

    let pendingCount = 0;
    let pendingAmount = 0;

    let totalInvoiceSum = 0;
    let invoiceCountForAverage = 0;

    let totalPaymentDelayDays = 0;
    let delayCalculatedCount = 0;

    const clientRevenueMap: Record<string, { companyName: string; email: string; totalPaid: number }> = {};
    const monthlyAmounts: Record<string, number> = {};

    (documents || []).forEach((doc: any) => {
      const isInvoice = doc.document_type === "invoice";
      const amt = Number(doc.total_amount) || 0;
      const status = doc.status || "draft";
      
      // Calculate Revenue Metrics (MTD / YTD based on Paid Invoices or Receipts)
      const isPaid = status === "paid";
      if (isPaid && doc.paid_at) {
        const date = new Date(doc.paid_at);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;

        if (y === currentYear) {
          ytdRevenue += amt;
          if (m === currentMonth) {
            mtdRevenue += amt;
          }

          // Abbreviated Month cash flow
          const monthName = date.toLocaleString("en-US", { month: "short" });
          monthlyAmounts[monthName] = (monthlyAmounts[monthName] || 0) + amt;
        }

        // Top clients aggregation
        const clientKey = doc.client_id || doc.client?.id || "unknown";
        const clientName = doc.client?.company_name || doc.client?.companyName || doc.client?.primary_contact_name || doc.client?.primaryContactName || "Anonymous";
        const clientEmail = doc.client?.email || "";
        
        if (!clientRevenueMap[clientKey]) {
          clientRevenueMap[clientKey] = { companyName: clientName, email: clientEmail, totalPaid: 0 };
        }
        clientRevenueMap[clientKey].totalPaid += amt;
      }

      if (isInvoice) {
        // Average Invoice Value (exclude drafts and cancelled)
        if (status !== "draft" && status !== "cancelled") {
          totalInvoiceSum += amt;
          invoiceCountForAverage++;
        }

        // Status counts
        if (status === "paid") {
          paidCount++;
          paidAmount += amt;
        } else if (status === "pending") {
          pendingCount++;
          pendingAmount += amt;
          outstandingCount++;
          outstandingAmount += amt;
        } else if (status === "overdue") {
          overdueCount++;
          overdueAmount += amt;
          outstandingCount++;
          outstandingAmount += amt;
        }

        // Average payment delay calculation (days between issue_date and paid_at)
        if (status === "paid" && doc.issue_date && doc.paid_at) {
          const issueDate = new Date(doc.issue_date);
          const paidDate = new Date(doc.paid_at);
          const diffTime = Math.abs(paidDate.getTime() - issueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalPaymentDelayDays += diffDays;
          delayCalculatedCount++;
        }
      }
    });

    const averageInvoiceValue = invoiceCountForAverage > 0 ? Number((totalInvoiceSum / invoiceCountForAverage).toFixed(2)) : 0;
    const averagePaymentDelay = delayCalculatedCount > 0 ? Number((totalPaymentDelayDays / delayCalculatedCount).toFixed(1)) : 0;

    // Sort top clients by revenue
    const topClients = Object.values(clientRevenueMap)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // Format monthly cash flow chronologically
    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const cashFlowTrend = monthsOrder
      .map(m => ({ month: m, amount: monthlyAmounts[m] || 0 }))
      .filter((_, idx) => idx <= currentMonthIdx);

    // Financial Forecast (average of monthly cash flow extended to next 3 months)
    const activeMonthsCount = cashFlowTrend.length || 1;
    const monthlyAverage = ytdRevenue / activeMonthsCount;
    const financialForecast = [
      { month: monthsOrder[(currentMonthIdx + 1) % 12], projected: Number((monthlyAverage * 1.05).toFixed(2)) },
      { month: monthsOrder[(currentMonthIdx + 2) % 12], projected: Number((monthlyAverage * 1.1).toFixed(2)) },
      { month: monthsOrder[(currentMonthIdx + 3) % 12], projected: Number((monthlyAverage * 1.15).toFixed(2)) }
    ];

    // Fetch CRM Leads for active pipeline value estimation
    const { data: leads } = await dbClient
      .from("leads")
      .select("*")
      .not("status", "in", '("won","lost")');

    let pipelineValue = 0;
    const leadsPipeline: Record<string, { count: number; value: number }> = {
      lead: { count: 0, value: 0 },
      discovery: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 },
      negotiation: { count: 0, value: 0 }
    };

    if (leads) {
      leads.forEach((l: any) => {
        let val = 0;
        if (l.budget) {
          const firstPart = l.budget.split("-")[0];
          const digits = firstPart.replace(/[^\d]/g, "");
          val = parseFloat(digits) || 0;
        }
        pipelineValue += val;

        const statusKey = l.status || "lead";
        if (["lead", "discovery", "proposal", "negotiation"].includes(statusKey)) {
          leadsPipeline[statusKey].count += 1;
          leadsPipeline[statusKey].value += val;
        }
      });
    }

    // Fetch Consulting Hours
    const { data: hoursData } = await dbClient
      .from("consulting_hours")
      .select("hours_logged");

    let consultingHours = 0;
    if (hoursData) {
      consultingHours = hoursData.reduce((acc, curr) => acc + (Number(curr.hours_logged) || 0), 0);
    }

    return NextResponse.json({
      mtdRevenue,
      ytdRevenue,
      pipelineValue,
      consultingHours,
      revenueByMonth: cashFlowTrend,
      leadsPipeline: Object.entries(leadsPipeline).map(([status, details]) => ({
        status,
        ...details
      })),
      outstandingCount,
      outstandingAmount,
      paidCount,
      paidAmount,
      overdueCount,
      overdueAmount,
      pendingCount,
      pendingAmount,
      averageInvoiceValue,
      averagePaymentDelay,
      topClients,
      financialForecast,
      recentTransactions: recentTransactions || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
