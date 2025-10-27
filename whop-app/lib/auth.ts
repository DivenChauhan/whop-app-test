import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export interface AuthResult {
  userId: string | null;
  user: any | null;
  companyId: string | null;
  isCreator: boolean;
  isAuthenticated: boolean;
  hasCompanyAccess: boolean;
}

/**
 * Get authentication status for the current user
 * Checks if user is authenticated and if they're a creator (admin of the company)
 * Also verifies they have access to the company this app instance is for
 */
export async function getUserAuth(): Promise<AuthResult> {
  const headersList = await headers();
  const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  try {
    const verified = await whopSdk.verifyUserToken(headersList);
    const user = await whopSdk.users.getUser({ userId: verified.userId });
    
    let isCreator = false;
    let hasCompanyAccess = false;
    
    if (companyId) {
      try {
        const accessCheck = await whopSdk.access.checkIfUserHasAccessToCompany({
          userId: verified.userId,
          companyId,
        });
        
        // User has access if they're a member or admin of this company
        hasCompanyAccess = accessCheck.hasAccess;
        
        // 'admin' means they're an owner/moderator of the company
        isCreator = accessCheck.accessLevel === 'admin';
      } catch (error) {
        console.error('Error checking company access:', error);
        // User doesn't have access to this company
        hasCompanyAccess = false;
        isCreator = false;
      }
    }
    
    return {
      userId: verified.userId,
      user,
      companyId: companyId || null,
      isCreator,
      isAuthenticated: true,
      hasCompanyAccess,
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
            companyId: companyId || null,
            isCreator: true, // Agent user is creator in dev mode
            isAuthenticated: true,
            hasCompanyAccess: true, // Agent user has access in dev mode
          };
        } catch {
          // Ignore if agent user doesn't exist
        }
      }
    }
    
    return {
      userId: null,
      user: null,
      companyId: null,
      isCreator: false,
      isAuthenticated: false,
      hasCompanyAccess: false,
    };
  }
}

/**
 * Require creator access - throws error if user is not a creator
 * Use this for protecting creator-only pages (dashboard, analytics, settings)
 */
export async function requireCreator(): Promise<AuthResult> {
  const auth = await getUserAuth();
  
  if (!auth.isCreator || !auth.hasCompanyAccess) {
    throw new Error('Unauthorized: Creator access required');
  }
  
  return auth;
}

/**
 * Require company access (member or admin) - throws error if user doesn't have access
 * Use this for protecting pages that require company membership
 */
export async function requireCompanyAccess(): Promise<AuthResult> {
  const auth = await getUserAuth();
  
  if (!auth.hasCompanyAccess || !auth.isAuthenticated) {
    throw new Error('Unauthorized: Company access required');
  }
  
  return auth;
}

