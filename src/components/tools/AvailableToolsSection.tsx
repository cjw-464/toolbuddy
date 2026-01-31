"use client";

import { useState, useEffect } from "react";
import { useAllFriendsTools, type SortOption } from "@/hooks/useAllFriendsTools";
import { useProfile } from "@/hooks/useProfile";
import { useFriends } from "@/hooks/useFriends";
import { FriendToolCard } from "@/components/friends/FriendToolCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TOOL_CATEGORIES, type ToolCategory } from "@/types";

const categoryOptions = [
	{ value: "", label: "All Categories" },
	...TOOL_CATEGORIES,
];

const sortOptions = [
	{ value: "distance", label: "Nearest" },
	{ value: "recent", label: "Most Recent" },
	{ value: "name", label: "Name A-Z" },
];

export function AvailableToolsSection() {
	const { profile } = useProfile();
	const { friends } = useFriends();

	const [toolSearch, setToolSearch] = useState("");
	const [toolCategory, setToolCategory] = useState<ToolCategory | "">("");
	const [toolSort, setToolSort] = useState<SortOption>("distance");
	const [debouncedToolSearch, setDebouncedToolSearch] = useState("");

	const { tools, loading: toolsLoading } = useAllFriendsTools({
		search: debouncedToolSearch,
		category: toolCategory,
		sortBy: toolSort,
		userLatitude: profile?.latitude,
		userLongitude: profile?.longitude,
	});

	// Debounce tool search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedToolSearch(toolSearch);
		}, 300);
		return () => clearTimeout(timer);
	}, [toolSearch]);

	return (
		<>
			{/* Tool Filters */}
			<div className="mb-6 space-y-3">
				<Input
					type="search"
					placeholder="Search tools..."
					value={toolSearch}
					onChange={(e) => setToolSearch(e.target.value)}
					className="w-full"
				/>
				<div className="flex gap-3">
					<div className="flex-1">
						<Select
							options={categoryOptions}
							value={toolCategory}
							onChange={(e) =>
								setToolCategory(e.target.value as ToolCategory | "")
							}
						/>
					</div>
					<div className="flex-1">
						<Select
							options={sortOptions}
							value={toolSort}
							onChange={(e) => setToolSort(e.target.value as SortOption)}
						/>
					</div>
				</div>
			</div>

			{/* Tools Grid */}
			{toolsLoading ? (
				<div className="grid grid-cols-2 gap-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
						>
							<div className="aspect-[4/3] rounded-xl bg-neutral-200" />
							<div className="mt-3 space-y-2">
								<div className="h-3 w-16 rounded bg-neutral-200" />
								<div className="h-5 w-24 rounded bg-neutral-200" />
								<div className="h-3 w-20 rounded bg-neutral-200" />
							</div>
						</div>
					))}
				</div>
			) : tools.length === 0 ? (
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
					<h3 className="text-lg font-semibold text-neutral-900">
						{friends.length === 0
							? "No buddies yet"
							: "No tools available"}
					</h3>
					<p className="mt-1 text-neutral-600">
						{friends.length === 0
							? "Add buddies to see their lendable tools."
							: toolSearch || toolCategory
							? "Try adjusting your search or filters."
							: "None of your buddies have lendable tools yet."}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4">
					{tools.map((tool) => (
						<FriendToolCard key={tool.id} tool={tool} />
					))}
				</div>
			)}
		</>
	);
}
