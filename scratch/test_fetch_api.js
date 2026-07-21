const http = require("http");

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "localhost", port: 3000, path: path }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  try {
    const r1 = await httpGet("/api/client-billing-profiles");
    console.log("=== /api/client-billing-profiles ===");
    console.log(JSON.stringify(r1, null, 2));

    const r2 = await httpGet("/api/payment-config");
    console.log("=== /api/payment-config ===");
    console.log(JSON.stringify(r2, null, 2));
  } catch (err) {
    console.error("HTTP error:", err.message);
  }
}

run();
