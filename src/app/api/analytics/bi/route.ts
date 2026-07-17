import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const dbClient = getSupabaseAdmin();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-indexed (July = 7)

    // 1. Fetch Paid Invoices for MTD/YTD revenue
    const { data: invoices, error: invoicesError } = await dbClient
      .from("commercial_documents")
      .select("*")
      .eq("document_type", "invoice")
      .eq("status", "paid");

    let mtdRevenue = 0;
    let ytdRevenue = 0;
    const monthlyAmounts: Record<string, number> = {};

    if (invoices) {
      invoices.forEach((inv: any) => {
        const amt = Number(inv.total_amount) || 0;
        // Fallback to issue_date if paid_at is not populated yet
        const dateStr = inv.paid_at || inv.issue_date || "";
        if (dateStr) {
          const date = new Date(dateStr);
          const y = date.getFullYear();
          const m = date.getMonth() + 1;

          if (y === currentYear) {
            ytdRevenue += amt;
            if (m === currentMonth) {
              mtdRevenue += amt;
            }

            // Group by abbreviated month name
            const monthName = date.toLocaleString("en-US", { month: "short" });
            monthlyAmounts[monthName] = (monthlyAmounts[monthName] || 0) + amt;
          }
        }
      });
    }

    // 2. Fetch CRM Leads for active pipeline value estimation
    const { data: leads, error: leadsError } = await dbClient
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
          // split ranges e.g. "$10,000 - $25,000" and strip non-numeric
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

    // 3. Fetch Telemetry Consulting Hours
    const { data: hoursData, error: hoursError } = await dbClient
      .from("consulting_hours")
      .select("hours_logged");

    let consultingHours = 0;
    if (hoursData) {
      consultingHours = hoursData.reduce((acc, curr) => acc + (Number(curr.hours_logged) || 0), 0);
    }

    // 4. Fetch Training metrics (Registrations counts)
    const { count: trainingRegistrations, error: regError } = await dbClient
      .from("portal_payments")
      .select("*", { count: "exact", head: true })
      .ilike("service", "%training%");

    // Format monthly trend array sorted chronologically
    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const revenueByMonth = monthsOrder
      .map(m => ({ month: m, amount: monthlyAmounts[m] || 0 }))
      .filter((_, idx) => idx <= currentMonthIdx);

    return NextResponse.json({
      mtdRevenue,
      ytdRevenue,
      pipelineValue,
      consultingHours,
      trainingRegistrations: trainingRegistrations || 0,
      revenueByMonth,
      leadsPipeline: Object.entries(leadsPipeline).map(([status, details]) => ({
        status,
        ...details
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
