require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection...");

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    console.log("Database:", mongoose.connection.name);
    return mongoose.disconnect();
  })
  .then(() => {
    console.log("✅ Connection test completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    process.exit(1);
  });