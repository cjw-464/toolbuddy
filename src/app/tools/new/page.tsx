"use client";

import Link from "next/link";
import { ToolForm } from "@/components/tools/ToolForm";
import { BottomNav } from "@/components/layout/BottomNav";

export default function NewToolPage() {
	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6">
				<Link
					href="/tools"
					className="mb-4 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
				>
					<svg
						className="mr-1 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to tools
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900">Add a Tool</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Add a new tool to your inventory
				</p>
			</header>

			<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
				<ToolForm mode="create" />
			</div>

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
