"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTools } from "@/hooks/useTools";
import { useAllFriendsTools } from "@/hooks/useAllFriendsTools";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { AvailableToolsSection } from "@/components/tools/AvailableToolsSection";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

type TabType = "my-tools" | "available";

function ToolsContent() {
	const searchParams = useSearchParams();
	const lendableOnly = searchParams.get("lendable") === "true";

	const [activeTab, setActiveTab] = useState<TabType>("my-tools");
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<ToolCategory | "">("");

	const { tools, loading } = useTools({ search, category: category || undefined, lendableOnly });
	const { tools: availableTools } = useAllFriendsTools({});

	const handleSearchChange = useCallback((value: string) => {
		setSearch(value);
	}, []);

	const handleCategoryChange = useCallback((value: ToolCategory | "") => {
		setCategory(value);
	}, []);

	return (
		<>
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-neutral-900">Toolbox</h1>
					<p className="mt-1 text-sm text-neutral-600">
						Your tools and what&apos;s available from buddies
					</p>
				</div>
				<Link href="/tools/new">
					<Button>Add Tool</Button>
				</Link>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl bg-neutral-100 p-1">
				<button
					onClick={() => setActiveTab("my-tools")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "my-tools"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					My Tools
					{tools.length > 0 && activeTab !== "my-tools" && (
						<span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs">
							{tools.length}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("available")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "available"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Available Tools
					{availableTools.length > 0 && activeTab !== "available" && (
						<span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs">
							{availableTools.length}
						</span>
					)}
				</button>
			</div>

			{/* My Tools Tab */}
			{activeTab === "my-tools" && (
				<>
					<div className="mb-4 flex items-center justify-between">
						<p className="text-sm text-neutral-600">
							{tools.length} {tools.length === 1 ? "tool" : "tools"}
							{lendableOnly && (
								<Link href="/tools" className="ml-2 text-[#FFCC00] hover:underline">
									Show all
								</Link>
							)}
						</p>
					</div>

					<div className="mb-6">
						<ToolFilters
							onSearchChange={handleSearchChange}
							onCategoryChange={handleCategoryChange}
						/>
					</div>

					<ToolGrid tools={tools} loading={loading} />
				</>
			)}

			{/* Available Tools Tab */}
			{activeTab === "available" && <AvailableToolsSection />}
		</>
	);
}

function ToolsLoading() {
	return (
		<>
			<header className="mb-6 flex items-center justify-between">
				<div>
					<div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
					<div className="mt-1 h-4 w-48 animate-pulse rounded bg-neutral-200" />
				</div>
				<div className="h-10 w-24 animate-pulse rounded-lg bg-neutral-200" />
			</header>
			<div className="mb-6 h-12 animate-pulse rounded-xl bg-neutral-200" />
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
