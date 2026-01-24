"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const supabase = createClient();

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
			return;
		}

		router.push(redirectTo);
		router.refresh();
	};

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
				placeholder="Your password"
				required
				autoComplete="current-password"
			/>

			<div className="flex justify-end">
				<Link
					href="/forgot-password"
					className="text-sm text-neutral-600 hover:text-neutral-900"
				>
					Forgot password?
				</Link>
			</div>

			<Button
				type="submit"
				isLoading={isLoading}
				className="w-full"
			>
				Sign in
			</Button>

			<p className="text-center text-sm text-neutral-600">
				Don&apos;t have an account?{" "}
				<Link
					href="/signup"
					className="font-medium text-[#333333] hover:underline"
				>
					Sign up
				</Link>
			</p>
		</form>
	);
}
