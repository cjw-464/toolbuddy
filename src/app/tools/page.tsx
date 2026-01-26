"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTools } from "@/hooks/useTools";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ToolCategory } from "@/types";

function ToolsContent() {
	const searchParams = useSearchParams();
	const lendableOnly = searchParams.get("lendable") === "true";

	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<ToolCategory | "">("");

	const { tools, loading } = useTools({ search, category: category || undefined, lendableOnly });

	const handleSearchChange = useCallback((value: string) => {
		setSearch(value);
	}, []);

	const handleCategoryChange = useCallback((value: ToolCategory | "") => {
		setCategory(value);
	}, []);

	const filteredTools = tools;
	const title = lendableOnly ? "Lendable Tools" : "My Tools";

	return (
		<>
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
						{lendableOnly && (
							<Link href="/tools" className="ml-2 text-[#FFCC00] hover:underline">
								Show all
							</Link>
						)}
					</p>
				</div>
				<Link href="/tools/new">
					<Button>Add Tool</Button>
				</Link>
			</header>

			<div className="mb-6">
				<ToolFilters
					onSearchChange={handleSearchChange}
					onCategoryChange={handleCategoryChange}
				/>
			</div>

			<ToolGrid tools={tools} loading={loading} />
		</>
	);
}

function ToolsLoading() {
	return (
		<>
			<header className="mb-6 flex items-center justify-between">
				<div>
					<div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
					<div className="mt-1 h-4 w-20 animate-pulse rounded bg-neutral-200" />
				</div>
				<div className="h-10 w-24 animate-pulse rounded-lg bg-neutral-200" />
			</header>
			<div className="mb-6 h-12 animate-pulse rounded-lg bg-neutral-200" />
		</>
	);
}

export default function ToolsPage() {
	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<Suspense fallback={<ToolsLoading />}>
				<ToolsContent />
			</Suspense>

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
