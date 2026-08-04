import { getSupabaseAdmin } from "./supabaseClient";
import crypto from "crypto";

export async function triggerSavingsAllocations(
  paymentAmount: number,
  sourceLabel: string,
  revenueId?: string
) {
  try {
    const dbClient = getSupabaseAdmin();
    const currentDateStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Fetch active funding goals (status = 'Saving' or status = 'Planned')
    const { data: goals, error: fetchErr } = await dbClient
      .from("funding_goals")
      .select("*")
      .in("status", ["Saving", "Planned"]);

    if (fetchErr) {
      console.error("SavingsEngine: Error fetching active goals:", fetchErr.message);
      return;
    }

    if (!goals || goals.length === 0) {
      return;
    }

    console.log(`SavingsEngine: Evaluating ${goals.length} active goals for payment of $${paymentAmount}...`);

    for (const goal of goals) {
      const targetCost = Number(goal.target_cost) || 0;
      const currentSavings = Number(goal.current_savings) || 0;
      const remaining = targetCost - currentSavings;

      if (remaining <= 0) {
        // Goal is already fully funded
        if (goal.status !== "Ready to Purchase") {
          await dbClient
            .from("funding_goals")
            .update({ status: "Ready to Purchase", updated_at: new Date().toISOString() })
            .eq("id", goal.id);
        }
        continue;
      }

      let contribution = 0;
      let contributionSource = "";

      const strategy = goal.funding_strategy;
      const strategyValue = Number(goal.strategy_value) || 0;

      if (strategy === "percentage_revenue") {
        // Strategy 1: Percentage of every payment
        contribution = (strategyValue / 100) * paymentAmount;
        contributionSource = `${strategyValue}% allocation from payment: ${sourceLabel}`;
      } else if (strategy === "fixed_revenue") {
        // Strategy 2: Fixed amount per revenue/completed project
        contribution = strategyValue;
        contributionSource = `$${strategyValue} fixed allocation from payment: ${sourceLabel}`;
      } else {
        // Strategy 3 (monthly_fixed), 4 (manual), 5 (one_time) do not trigger on standard payments.
        // Handled separately or manually.
        continue;
      }

      // Cap contribution at the remaining goal amount
      contribution = Math.min(contribution, remaining);

      if (contribution <= 0) continue;

      const newSavings = currentSavings + contribution;
      const updatedStatus = newSavings >= targetCost ? "Ready to Purchase" : "Saving";

      // A. Update the Goal in database
      const { error: updateGoalErr } = await dbClient
        .from("funding_goals")
        .update({
          current_savings: newSavings,
          status: updatedStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      if (updateGoalErr) {
        console.error(`SavingsEngine: Error updating goal ${goal.goal_name}:`, updateGoalErr.message);
        continue;
      }

      // B. Create a contribution record
      const contributionId = crypto.randomUUID();
      const { error: contribErr } = await dbClient
        .from("funding_contributions")
        .insert({
          id: contributionId,
          goal_id: goal.id,
          amount: contribution,
          date: currentDateStr,
          source: contributionSource,
          revenue_id: revenueId || null
        });

      if (contribErr) {
        console.error("SavingsEngine: Error writing contribution log:", contribErr.message);
      }

      // C. Send notifications on milestones
      const oldPct = (currentSavings / targetCost) * 100;
      const newPct = (newSavings / targetCost) * 100;

      let milestoneText = "";
      if (oldPct < 50 && newPct >= 50) {
        milestoneText = `Goal "${goal.goal_name}" has reached 50% of its target cost! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      } else if (oldPct < 75 && newPct >= 75) {
        milestoneText = `Goal "${goal.goal_name}" has reached 75% of its target cost! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      } else if (oldPct < 100 && newPct >= 100) {
        milestoneText = `Goal "${goal.goal_name}" is now fully funded (100%) and ready to purchase! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      }

      if (milestoneText) {
        await dbClient.from("portal_notifications").insert({
          id: `notif_${crypto.randomBytes(6).toString("hex")}`,
          client_email: "admin@invictus.com", // Admin notification
          text: milestoneText,
          type: "alert",
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Perform monthly fixed allocations check (Strategy 3)
    await evaluateMonthlyFixedAllocations(dbClient, currentMonth, currentYear);

  } catch (err: any) {
    console.error("SavingsEngine: Critical crash:", err.message);
  }
}

// Automatically processes Strategy 3 (monthly fixed allocation) once per goal per month
export async function evaluateMonthlyFixedAllocations(
  dbClient: any,
  currentMonth: number,
  currentYear: number
) {
  try {
    const monthsNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthsNames[currentMonth - 1];
    const currentDateStr = new Date().toISOString().split("T")[0];

    // Fetch active monthly fixed goals
    const { data: goals, error } = await dbClient
      .from("funding_goals")
      .select("*")
      .eq("funding_strategy", "monthly_fixed")
      .in("status", ["Saving", "Planned"]);

    if (error || !goals) return;

    for (const goal of goals) {
      const strategyValue = Number(goal.strategy_value) || 0;
      const targetCost = Number(goal.target_cost) || 0;
      const currentSavings = Number(goal.current_savings) || 0;
      const remaining = targetCost - currentSavings;

      if (remaining <= 0 || strategyValue <= 0) continue;

      // Check if this month already has a monthly contribution logged for this goal
      const startOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const endOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`;

      const { data: existingContrib, error: checkErr } = await dbClient
        .from("funding_contributions")
        .select("id")
        .eq("goal_id", goal.id)
        .ilike("source", "Monthly Fixed Allocation%")
        .gte("date", startOfMonthStr)
        .lte("date", endOfMonthStr)
        .limit(1);

      if (checkErr || (existingContrib && existingContrib.length > 0)) {
        // Already contributed for this month
        continue;
      }

      // Compute allocation
      let contribution = Math.min(strategyValue, remaining);
      const newSavings = currentSavings + contribution;
      const updatedStatus = newSavings >= targetCost ? "Ready to Purchase" : "Saving";

      // Update goal
      await dbClient
        .from("funding_goals")
        .update({
          current_savings: newSavings,
          status: updatedStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      // Log contribution
      await dbClient
        .from("funding_contributions")
        .insert({
          id: crypto.randomUUID(),
          goal_id: goal.id,
          amount: contribution,
          date: currentDateStr,
          source: `Monthly Fixed Allocation - ${monthName} ${currentYear}`
        });

      // Notify
      const oldPct = (currentSavings / targetCost) * 100;
      const newPct = (newSavings / targetCost) * 100;

      let milestoneText = "";
      if (oldPct < 50 && newPct >= 50) {
        milestoneText = `Goal "${goal.goal_name}" has reached 50% via monthly contribution! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      } else if (oldPct < 75 && newPct >= 75) {
        milestoneText = `Goal "${goal.goal_name}" has reached 75% via monthly contribution! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      } else if (oldPct < 100 && newPct >= 100) {
        milestoneText = `Goal "${goal.goal_name}" is fully funded (100%) and ready to buy! Saved $${newSavings.toLocaleString()} of $${targetCost.toLocaleString()}.`;
      } else {
        milestoneText = `Monthly fixed contribution of $${contribution.toLocaleString()} allocated to goal "${goal.goal_name}". Total saved: $${newSavings.toLocaleString()}.`;
      }

      await dbClient.from("portal_notifications").insert({
        id: `notif_${crypto.randomBytes(6).toString("hex")}`,
        client_email: "admin@invictus.com",
        text: milestoneText,
        type: "alert",
        read: false,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err: any) {
    console.error("SavingsEngine: Monthly check error:", err.message);
  }
}
