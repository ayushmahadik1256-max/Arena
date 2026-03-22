import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          {"We've sent you a confirmation link. Please check your email to verify your account."}
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:underline"
        >
          <CheckCircle className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
