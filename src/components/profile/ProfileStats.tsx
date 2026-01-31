"use client";

import Link from "next/link";
import { useProfileStats } from "@/hooks/useProfileStats";

export function ProfileStats() {
	const { stats, loading } = useProfileStats();

	if (loading) {
		return (
			<div className="grid grid-cols-3 gap-3">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5"
					>
						<div className="mx-auto h-8 w-8 rounded bg-neutral-200" />
						<div className="mx-auto mt-2 h-4 w-16 rounded bg-neutral-200" />
					</div>
				))}
			</div>
		);
	}

	const statItems = [
		{ value: stats.totalTools, label: "Tools", href: "/tools" },
		{ value: stats.lendableTools, label: "Lendable", href: "/tools?lendable=true" },
		{ value: stats.friendsCount, label: "Buddies", href: "/friends" },
	];

	return (
		<div className="grid grid-cols-3 gap-3">
			{statItems.map((item) => (
				<Link
					key={item.label}
					href={item.href}
					className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
				>
					<p className="text-2xl font-semibold text-neutral-900">{item.value}</p>
					<p className="mt-1 text-sm text-neutral-500">{item.label}</p>
				</Link>
			))}
		</div>
	);
}
