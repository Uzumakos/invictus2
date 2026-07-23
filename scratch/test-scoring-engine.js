/**
 * Test Runner for Lead Scoring Engine
 * REDESIGN — Client Acquisition System & Lead Qualification Engine
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "temp_build");

try {
  console.log("=========================================");
  console.log("Compiling leadScoring.ts temporarily...");
  console.log("=========================================");
  
  // Create temp dir if not exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Compile using tsc
  execSync("npx tsc lib/leadScoring.ts --outDir scratch/temp_build --module commonjs --target es2020 --skipLibCheck", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  });

  // Load the compiled module
  const { calculateLeadScoreAndMetrics } = require("./temp_build/leadScoring");

  // Define test cases
  const testCases = [
    {
      name: "Urgent Strategic Enterprise Lead (Top Priority)",
      lead: {
        budget: "Above $15,000",
        timeline: "Urgent",
        notes: "We need a complete digital transformation for our banking systems including AI integration. This is an urgent project for our enterprise banking division. Our expected timeline is very tight and we need high-end architecture audits and custom training programs for our engineering staff.", // > 150 chars
        companyType: "Enterprise",
        projectType: "Digital Transformation",
        previousRelationship: "Returning Client",
      },
      expectedScore: 100, // Capped at 100
      expectedPriority: "Strategic Opportunity",
      expectedStars: 5,
      expectedProb: 95, // 100 * 0.9 + 5 = 95
    },
    {
      name: "Qualified Referral Startup Lead",
      lead: {
        budget: "$5,000–15,000", // +25
        timeline: "Within 3 months", // +10
        notes: "We are building an AI chatbot for e-commerce. Need custom AI model training.", // 76 chars (+5)
        companyType: "Startup", // +10
        projectType: "AI Consulting", // +25
        previousRelationship: "Referral", // +20
      },
      expectedScore: 95, // 25+10+5+10+25+20 = 95
      expectedPriority: "Strategic Opportunity",
      expectedStars: 5,
      expectedProb: 91, // 95 * 0.9 + 5 = 90.5 => 91
    },
    {
      name: "Warm Individual Lead",
      lead: {
        budget: "Under $1,000", // +5
        timeline: "Flexible", // +5
        notes: "Short notes here.", // < 50 chars (+0)
        companyType: "Individual", // +5
        projectType: "Training", // +15
        previousRelationship: "None", // +0
      },
      expectedScore: 30, // 5+5+0+5+15+0 = 30
      expectedPriority: "Low Priority",
      expectedStars: 1,
      expectedProb: 32, // 30 * 0.9 + 5 = 32
    },
    {
      name: "Hot Small Business Lead",
      lead: {
        budget: "$5,000–15,000", // +25
        timeline: "Within 1 month", // +20
        notes: "We need a complete audit of our backend architecture to identify scalability bottlenecks and secure our customer database before the busy season begins next month.", // > 150 chars (+15)
        companyType: "Small Business", // +15
        projectType: "Architecture Audit", // +20
        previousRelationship: "None", // +0
      },
      expectedScore: 95, // 25+20+15+15+20+0 = 95 (Strategic Opportunity, stars 5, prob 91)
      expectedPriority: "Strategic Opportunity",
      expectedStars: 5,
    }
  ];

  console.log("\n=========================================");
  console.log("Running Scorer Core Tests...");
  console.log("=========================================");
  
  let passed = 0;
  testCases.forEach((tc, idx) => {
    console.log(`\nTest Case #${idx + 1}: ${tc.name}`);
    const res = calculateLeadScoreAndMetrics(tc.lead);
    
    let tcPassed = true;
    console.log(`- Calculated Score: ${res.leadScore} (Expected: ${tc.expectedScore ?? "Any"})`);
    console.log(`- Priority Classification: ${res.priority} (Expected: ${tc.expectedPriority})`);
    console.log(`- Star Rating: ${res.stars} (Expected: ${tc.expectedStars})`);
    console.log(`- Probability of Closing: ${res.probabilityOfClosing}% (Expected: ${tc.expectedProb ?? "Any"}%)`);
    console.log(`- Estimated Value: $${res.estimatedValue} (Expected: 0)`);

    if (tc.expectedScore !== undefined && res.leadScore !== tc.expectedScore) {
      console.error(`  FAIL: Score mismatch!`);
      tcPassed = false;
    }
    if (res.priority !== tc.expectedPriority) {
      console.error(`  FAIL: Priority mismatch!`);
      tcPassed = false;
    }
    if (res.stars !== tc.expectedStars) {
      console.error(`  FAIL: Stars mismatch!`);
      tcPassed = false;
    }
    if (tc.expectedProb !== undefined && res.probabilityOfClosing !== tc.expectedProb) {
      console.error(`  FAIL: Probability mismatch!`);
      tcPassed = false;
    }
    if (res.estimatedValue !== 0) {
      console.error(`  FAIL: Estimated value should be 0!`);
      tcPassed = false;
    }

    if (tcPassed) {
      console.log(`  SUCCESS: Test Case Passed!`);
      passed++;
    }
  });

  console.log("\n=========================================");
  console.log(`Summary: ${passed} / ${testCases.length} Tests Passed.`);
  console.log("=========================================");

  if (passed !== testCases.length) {
    throw new Error("One or more scoring tests failed.");
  }

} catch (err) {
  console.error("Test execution failed:", err);
  process.exit(1);
} finally {
  // Cleanup temp files
  console.log("\nCleaning up temporary build files...");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log("Done.");
}
