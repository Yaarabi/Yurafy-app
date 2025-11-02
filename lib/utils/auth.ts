import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { createErrorResponse, ApiException } from "./errors";

/**
 * Get authenticated session or throw error
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        throw new ApiException("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
    }

    return session;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
    const session = await requireAuth();
    
    if (session.user.role !== "admin") {
        throw new ApiException("Forbidden - Admin access required", 403, "FORBIDDEN");
    }

    return session;
}

/**
 * Verify ownership of resource
 */
export function verifyOwnership(resourceOwnerId: string, userId: string): void {
    if (resourceOwnerId.toString() !== userId) {
        throw new ApiException("Forbidden - You don't own this resource", 403, "FORBIDDEN");
    }
}

