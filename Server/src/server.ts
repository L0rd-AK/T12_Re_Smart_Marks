import app from "./app";
import { Server } from "http";
import connectDB from "./config/database";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

async function main() {
  try {
    // Connect to database
    await connectDB();
    console.log('✓ Database connected successfully');

    const server: Server = app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
