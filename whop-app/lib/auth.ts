import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export interface AuthResult {
  userId: string | null;
  user: any | null;
  isCreator: boolean;
  isAuthenticated: boolean;
}

/**
 * Get authentication status for the current user
 * Checks if user is authenticated and if they're a creator (admin of the company)
 */
export async function getUserAuth(): Promise<AuthResult> {
  const headersList = await headers();
  
  try {
    const verified = await whopSdk.verifyUserToken(headersList);
    const user = await whopSdk.users.getUser({ userId: verified.userId });
    
    // Check if user is creator (admin of the company)
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    let isCreator = false;
    if (companyId) {
      const accessCheck = await whopSdk.access.checkIfUserHasAccessToCompany({
        userId: verified.userId,
        companyId,
      });
      // 'admin' means they're an owner/moderator of the company
      isCreator = accessCheck.accessLevel === 'admin';
    }
    
    return {
      userId: verified.userId,
      user,
      isCreator,
      isAuthenticated: true,
    };
  } catch (error) {
    // User is not authenticated (public visitor)
    if (process.env.NODE_ENV === "development") {
      // In development, check if we should use the agent user
      const agentUserId = process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID;
      if (agentUserId) {
        console.log("⚠️ No authenticated user, treating agent user as creator for local testing");
        try {
          const user = await whopSdk.users.getUser({ userId: agentUserId });
          return {
            userId: agentUserId,
            user,
            isCreator: true, // Agent user is creator in dev mode
            isAuthenticated: true,
          };
        } catch {
          // Ignore if agent user doesn't exist
        }
      }
    }
    
    return {
      userId: null,
      user: null,
      isCreator: false,
      isAuthenticated: false,
    };
  }
}

/**
 * Require creator access - throws error if user is not a creator
 * Use this for protecting creator-only pages (dashboard, analytics, settings)
 */
export async function requireCreator(): Promise<AuthResult> {
  const auth = await getUserAuth();
  
  if (!auth.isCreator) {
    throw new Error('Unauthorized: Creator access required');
  }
  
  return auth;
}

