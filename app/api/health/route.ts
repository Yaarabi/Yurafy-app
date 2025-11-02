import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import mongoose from "mongoose";
import { logger } from "@/lib/utils/logging";

/**
 * Health check endpoint
 * Returns API and database status
 */
export async function GET() {
    const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        services: {
            database: "unknown",
            api: "healthy",
        },
    };

    try {
        // Check database connection
        if (mongoose.connection.readyState === 1) {
            health.services.database = "connected";
            
            // Test database query
            try {
                await mongoose.connection.db.admin().ping();
                health.services.database = "healthy";
            } catch (error) {
                health.services.database = "degraded";
                health.status = "degraded";
                logger.warn("Database ping failed", error);
            }
        } else {
            // Try to connect if not connected
            try {
                await connectDB();
                if (mongoose.connection.readyState === 1) {
                    health.services.database = "connected";
                } else {
                    health.services.database = "disconnected";
                    health.status = "unhealthy";
                }
            } catch (error) {
                health.services.database = "error";
                health.status = "unhealthy";
                logger.error("Database connection failed", error);
            }
        }

        const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

        return NextResponse.json(health, { status: statusCode });
    } catch (error) {
        logger.error("Health check failed", error);
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: "Health check failed",
            },
            { status: 503 }
        );
    }
}

