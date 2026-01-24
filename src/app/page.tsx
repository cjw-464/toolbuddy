import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/layout/BottomNav";

export default function Home() {
	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-semibold text-neutral-900">Toolbuddy</h1>
				<p className="mt-2 text-neutral-600">
					Your toolbox, organized. Friendly sharing with people you trust.
				</p>
			</header>

			<section className="grid gap-4">
				<Card
					label="Inventory"
					title="My Tools"
					description="Add, browse, and search your tools."
					href="/tools"
				/>
				<Card
					label="Social"
					title="Friends"
					description="See what friends are willing to lend."
					href="/friends"
				/>
				<Card
					label="Account"
					title="Profile"
					description="Avatar, location, and settings."
					href="/profile"
				/>
			</section>

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
