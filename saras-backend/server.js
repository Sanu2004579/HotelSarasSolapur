require("dotenv").config(); // load .env first — must be at top!
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const reservationRoutes = require("./routes/reservations");
const userRoutes = require("./routes/user");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: true })); // enable CORS for cross-origin frontend requests
app.use(express.json()); // parse JSON request bodies
app.use(express.static(path.join(__dirname, ".."))); // serve frontend files from project root

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => res.send("Hotel Saras API running"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
