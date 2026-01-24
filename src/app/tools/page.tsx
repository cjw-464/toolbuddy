"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTools } from "@/hooks/useTools";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ToolCategory } from "@/types";

export default function ToolsPage() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<ToolCategory | "">("");

	const { tools, loading } = useTools({ search, category: category || undefined });

	const handleSearchChange = useCallback((value: string) => {
		setSearch(value);
	}, []);

	const handleCategoryChange = useCallback((value: ToolCategory | "") => {
		setCategory(value);
	}, []);

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-neutral-900">My Tools</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{tools.length} {tools.length === 1 ? "tool" : "tools"}
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

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
