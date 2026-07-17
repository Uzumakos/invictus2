async function testLogin() {
  try {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@invictus.com", password: "some-password" })
    });
    console.log("Response status:", res.status);
    const body = await res.json();
    console.log("Response body:", body);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

// Wait 2 seconds for server to start, then test
setTimeout(testLogin, 2000);
