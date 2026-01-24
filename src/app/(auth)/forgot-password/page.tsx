import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
	return (
		<>
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-semibold text-neutral-900">Reset password</h1>
				<p className="mt-2 text-neutral-600">We&apos;ll send you a reset link</p>
			</div>
			<ForgotPasswordForm />
		</>
	);
}
