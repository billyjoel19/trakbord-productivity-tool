"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/actions/password.action";
import { Button } from "@/components/ui/button";
import InputWithLabel from "@/components/input/InputWithLabel";
import { Loader, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const isDisabled =
    isLoading || !formData.newPassword || !formData.confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({ token, ...formData });
      if (response.error) return toast.error(response.error);
      toast.success("Password reset successfully. Please sign in.");
      router.push("/");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-180 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="font-medium text-red-500">Invalid reset link.</p>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:underline"
          >
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold">Set new password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputWithLabel
              id="newPassword"
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={formData.newPassword}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: value as string,
                }))
              }
            />
            <InputWithLabel
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              placeholder="Repeat new password"
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: value as string,
                }))
              }
            />
            <Button type="submit" disabled={isDisabled} className="w-full">
              {isLoading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
