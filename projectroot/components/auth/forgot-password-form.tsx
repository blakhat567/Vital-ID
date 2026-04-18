"use client";

import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!hasSupabaseEnv()) {
        throw new Error("Password recovery is not available in demo mode. Please use the demo credentials on the login page.");
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client could not be created.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Password reset link has been sent to your email. Please check your inbox and follow the instructions."
      );
      setEmail("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send password reset email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle className="font-serif text-3xl">Reset password</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your.email@hospital.org"
              required
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
                Sending reset link
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <Link href="/login">
            <Button className="w-full" variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
