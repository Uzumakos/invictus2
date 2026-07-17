const dotenv = require("dotenv");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
const result = dotenv.config({ path: envPath });

console.log("Dotenv parsed:", result.parsed);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("ADMIN_PASSWORD_HASH:", process.env.ADMIN_PASSWORD_HASH);
