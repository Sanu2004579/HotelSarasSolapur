require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${email}`);
      console.log(
        "If you forgot the password, delete the admin from MongoDB and run this again.",
      );
      process.exit(0);
    }

    await Admin.create({ email, password });
    console.log(`✅ Admin created successfully!`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\nYou can now log in at admin.html");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

module.exports = createAdmin;
