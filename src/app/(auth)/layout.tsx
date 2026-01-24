export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-5">
			<div className="w-full max-w-sm">
				{children}
			</div>
		</div>
	);
}
