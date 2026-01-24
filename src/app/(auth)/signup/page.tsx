import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
	return (
		<>
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-semibold text-neutral-900">Create account</h1>
				<p className="mt-2 text-neutral-600">Join Toolbuddy to share tools with friends</p>
			</div>
			<SignupForm />
		</>
	);
}
