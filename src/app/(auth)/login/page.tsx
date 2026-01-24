import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
	return (
		<>
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
				<p className="mt-2 text-neutral-600">Sign in to your account</p>
			</div>
			<Suspense fallback={<div className="h-64" />}>
				<LoginForm />
			</Suspense>
		</>
	);
}
