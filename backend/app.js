import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Router from "./routes/ecom.route.js";
import AWS from "aws-sdk"; // Import AWS SDK for Cognito configuration
import cors from "cors";
// Initialize Express app
const app = express();

// Load environment variables
dotenv.config();

// Configure AWS SDK with credentials and region
AWS.config.update({
  region: process.env.AWS_REGION, // Default to Stockholm region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Mount routes at /api/ecommerce
app.use("/api/ecommerce", Router);

// Initialize the app with database connection
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Database connected successfully");

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    return app;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit process on failure
  }
};

// Call initializeApp to start the server
initializeApp();

// Export app and initializeApp for testing or other modules
export { app, initializeApp };