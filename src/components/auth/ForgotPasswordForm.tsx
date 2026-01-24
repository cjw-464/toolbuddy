"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const supabase = createClient();

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
			return;
		}

		setSuccess(true);
		setIsLoading(false);
	};

	if (success) {
		return (
			<div className="text-center">
				<div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
					<p className="font-medium">Check your email</p>
					<p className="mt-1 text-sm">
						We&apos;ve sent password reset instructions to {email}
					</p>
				</div>
				<Link
					href="/login"
					className="text-sm font-medium text-[#333333] hover:underline"
				>
					Back to sign in
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
					{error}
				</div>
			)}

			<p className="text-sm text-neutral-600">
				Enter your email address and we&apos;ll send you a link to reset your
				password.
			</p>

			<Input
				label="Email"
				type="email"
				name="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="you@example.com"
				required
				autoComplete="email"
			/>

			<Button
				type="submit"
				isLoading={isLoading}
				className="w-full"
			>
				Send reset link
			</Button>

			<p className="text-center text-sm text-neutral-600">
				Remember your password?{" "}
				<Link
					href="/login"
					className="font-medium text-[#333333] hover:underline"
				>
					Sign in
				</Link>
			</p>
		</form>
	);
}
