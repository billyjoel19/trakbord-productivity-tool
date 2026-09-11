"use client";

import { useState } from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/actions/password.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email);
      if (response.error) return toast.error(response.error);
      setIsSent(true);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="relative z-10">
        <nav className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon-16x16.png" alt="logo" />
            <h1 className="hidden md:block text-lg font-semibold">
              Trak<span className="text-indigo-500">bord</span>
            </h1>
          </div>
          <ModeToggle />
        </nav>
      </div>

      <div className="min-h-180 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
            <h1 className="text-2xl font-semibold">Forgot password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {isSent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="size-10 text-green-500" />
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>,
                you'll receive a reset link shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                The link expires in 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
