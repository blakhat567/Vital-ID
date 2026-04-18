"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || type !== "recovery") {
        setErrorMessage("Invalid or missing reset token. Please request a new password reset.");
        return;
      }

      if (!hasSupabaseEnv()) {
        setErrorMessage("Password reset is not available in demo mode.");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        if (!supabase) {
          throw new Error("Supabase client could not be created.");
        }

        // Verify the recovery token
        const { error } = await supabase.auth.verifyOtp({
          email: "",
          token,
          type: "recovery"
        });

        if (error) {
          throw new Error("Token verification failed. Please request a new password reset.");
        }

        setIsValidToken(true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Token verification failed."
        );
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!hasSupabaseEnv()) {
        throw new Error("Password reset is not available in demo mode.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client could not be created.");
      }

      // Update the password for the authenticated user
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to reset password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken && errorMessage) {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-serif text-3xl">Invalid link</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-5">
            {errorMessage}
          </div>
          <Button className="w-full" onClick={() => router.push("/forgot-password")}>
            Request new reset link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-teal-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="data-pill">
            {hasSupabaseEnv() ? "Live auth enabled" : "Demo mode"}
          </span>
        </div>
        <div>
          <CardTitle className="font-serif text-3xl">Create new password</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            Enter a strong password to secure your account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your new password"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={6}
            />
          </div>

          {successMessage ? (
            <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Resetting password
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
