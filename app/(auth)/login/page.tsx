import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

function LoginFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="h-8 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="space-y-2 mt-6">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="h-10 bg-muted rounded mt-4" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
