"use client";

import Link from "next/link";
import { ToolCard } from "./ToolCard";
import { Button } from "@/components/ui/Button";
import type { Tool, ToolImage } from "@/types";

interface ToolGridProps {
	tools: (Tool & { images: ToolImage[] })[];
	loading?: boolean;
}

export function ToolGrid({ tools, loading }: ToolGridProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
					>
						<div className="aspect-[4/3] rounded-xl bg-neutral-200" />
						<div className="mt-3 space-y-2">
							<div className="h-3 w-16 rounded bg-neutral-200" />
							<div className="h-5 w-32 rounded bg-neutral-200" />
							<div className="h-4 w-24 rounded bg-neutral-200" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (tools.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
				<div className="mb-4 rounded-full bg-neutral-100 p-4">
					<svg
						className="h-12 w-12 text-neutral-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-neutral-900">No tools yet</h3>
				<p className="mt-1 text-neutral-600">
					Add your first tool to get started.
				</p>
				<Link href="/tools/new" className="mt-4">
					<Button>Add your first tool</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{tools.map((tool) => (
				<ToolCard key={tool.id} tool={tool} />
			))}
		</div>
	);
}
