"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		const supabase = createClient();

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
			},
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
						We&apos;ve sent you a confirmation link to {email}
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

			<Input
				label="Password"
				type="password"
				name="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="At least 6 characters"
				required
				autoComplete="new-password"
			/>

			<Input
				label="Confirm password"
				type="password"
				name="confirmPassword"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				placeholder="Confirm your password"
				required
				autoComplete="new-password"
			/>

			<Button
				type="submit"
				isLoading={isLoading}
				className="w-full"
			>
				Create account
			</Button>

			<p className="text-center text-sm text-neutral-600">
				Already have an account?{" "}
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
