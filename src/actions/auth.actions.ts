"use server";

import { redirect } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { revalidatePath } from "next/cache";

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  if (!name?.trim() || !email?.trim() || !password) {
    return { error: "All fields are required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    await AuthService.signUp({ name: name.trim(), email: email.trim().toLowerCase(), password });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Registration failed" };
  }

  revalidatePath("/", "layout");
  redirect(callbackUrl);
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  if (!email?.trim() || !password) {
    return { error: "Email and password are required" };
  }

  try {
    await AuthService.signIn({ email: email.trim().toLowerCase(), password });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid credentials" };
  }

  revalidatePath("/", "layout");
  redirect(callbackUrl);
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction() {
  try {
    await AuthService.signOut();
  } catch {
    // Ignore sign out errors
  }
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email?.trim()) return { error: "Email is required" };

  try {
    await AuthService.resetPassword(email.trim().toLowerCase());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send reset email" };
  }

  return { success: "Password reset email sent. Check your inbox." };
}

// ─── Update Password ──────────────────────────────────────────────────────────

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  try {
    await AuthService.updatePassword(password);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update password" };
  }

  redirect("/login?message=Password updated successfully");
}
