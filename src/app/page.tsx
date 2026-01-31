"use client";

import { Card } from "@/components/ui/Card";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
	return (
		<AppShell>
			<header className="mb-6">
				<h1 className="text-3xl font-semibold text-neutral-900">Toolbuddy</h1>
				<p className="mt-2 text-neutral-600">
					Your toolbox, organized. Friendly sharing with people you trust.
				</p>
			</header>

			<section className="grid gap-4">
				<Card
					label="Inventory"
					title="Toolbox"
					description="Your tools and what buddies are lending."
					href="/tools"
				/>
				<Card
					label="Social"
					title="Buddies"
					description="See what buddies are willing to lend."
					href="/friends"
				/>
				<Card
					label="Lending"
					title="Handshakes"
					description="Manage your borrows and loans."
					href="/requests"
				/>
				<Card
					label="Account"
					title="Profile"
					description="Avatar, location, and settings."
					href="/profile"
				/>
			</section>
		</AppShell>
	);
}
