import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const AuthService = {

  /**
   * Sign up a new customer with email + password.
   * Creates a Supabase Auth user AND a profile row.
   */
  async signUp({ name, email, password, phone }: SignUpData) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone ?? null,
          role: "customer" satisfies UserRole,
        },
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Sign in with email + password.
   */
  async signIn({ email, password }: SignInData) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Sign in with Google OAuth.
   * Returns the redirect URL to navigate to.
   */
  async signInWithGoogle(redirectTo?: string) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${redirectTo ?? "/"}`,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Sign out the current user.
   */
  async signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Get the currently authenticated user (server-side).
   * Returns null if not authenticated.
   */
  async getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  /**
   * Get user role from metadata.
   */
  async getUserRole(): Promise<UserRole | null> {
    const user = await AuthService.getUser();
    if (!user) return null;
    return (user.user_metadata?.role as UserRole) ?? "customer";
  },

  /**
   * Send password reset email.
   */
  async resetPassword(email: string) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
    });

    if (error) throw new Error(error.message);
  },

  /**
   * Update password (user must be logged in).
   */
  async updatePassword(newPassword: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  /**
   * Admin: Update a user's role.
   * Uses the service-role client to bypass RLS.
   */
  async setUserRole(userId: string, role: UserRole) {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Admin: Delete a user.
   */
  async deleteUser(userId: string) {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  },

  /**
   * Admin: List all users.
   */
  async listUsers(page = 1, perPage = 50) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
