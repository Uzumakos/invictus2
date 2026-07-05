import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import { RecommendationRule } from "@/lib/types";

export async function GET() {
  try {
    const rules = await getCollection<RecommendationRule>("recommendationRules");
    return NextResponse.json(rules);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

