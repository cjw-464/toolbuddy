"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { Tool, ToolCategory, ToolImage } from "@/types";

interface ToolWithImages extends Tool {
	images: ToolImage[];
}

interface UseToolsOptions {
	search?: string;
	category?: ToolCategory | "";
	lendableOnly?: boolean;
}

export function useTools(options: UseToolsOptions = {}) {
	const { user, loading: authLoading } = useAuth();
	const [tools, setTools] = useState<ToolWithImages[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTools = useCallback(async () => {
		if (!user) {
			setTools([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		let query = supabase
			.from("tools")
			.select(`
				*,
				images:tool_images(*)
			`)
			.eq("owner_id", user.id)
			.order("created_at", { ascending: false });

		if (options.search) {
			query = query.ilike("name", `%${options.search}%`);
		}

		if (options.category) {
			query = query.eq("category", options.category);
		}

		if (options.lendableOnly) {
			query = query.eq("is_lendable", true);
		}

		const { data, error } = await query;

		if (error) {
			setError(error.message);
		} else {
			setTools(data || []);
		}

		setLoading(false);
	}, [user, options.search, options.category, options.lendableOnly]);

	useEffect(() => {
		if (authLoading) return;
		fetchTools();
	}, [authLoading, fetchTools]);

	const refetch = () => {
		fetchTools();
	};

	return { tools, loading: loading || authLoading, error, refetch };
}
