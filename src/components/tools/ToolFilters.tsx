"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TOOL_CATEGORIES, type ToolCategory } from "@/types";

interface ToolFiltersProps {
	onSearchChange: (search: string) => void;
	onCategoryChange: (category: ToolCategory | "") => void;
	initialSearch?: string;
	initialCategory?: ToolCategory | "";
}

export function ToolFilters({
	onSearchChange,
	onCategoryChange,
	initialSearch = "",
	initialCategory = "",
}: ToolFiltersProps) {
	const [search, setSearch] = useState(initialSearch);
	const [category, setCategory] = useState<ToolCategory | "">(initialCategory);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			onSearchChange(search);
		}, 300);

		return () => clearTimeout(timer);
	}, [search, onSearchChange]);

	const handleCategoryChange = (value: string) => {
		const newCategory = value as ToolCategory | "";
		setCategory(newCategory);
		onCategoryChange(newCategory);
	};

	const categoryOptions = [
		{ value: "", label: "All Categories" },
		...TOOL_CATEGORIES,
	];

	return (
		<div className="flex flex-col gap-3 sm:flex-row">
			<div className="flex-1">
				<Input
					type="search"
					placeholder="Search tools..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full"
				/>
			</div>
			<div className="w-full sm:w-48">
				<Select
					options={categoryOptions}
					value={category}
					onChange={(e) => handleCategoryChange(e.target.value)}
				/>
			</div>
		</div>
	);
}
