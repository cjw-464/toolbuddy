"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { Tool, ToolCategory, ToolCondition, ToolImage } from "@/types";

interface ToolWithImages extends Tool {
	images: ToolImage[];
}

interface CreateToolInput {
	name: string;
	brand?: string | null;
	model?: string | null;
	category: ToolCategory;
	condition: ToolCondition;
	notes?: string | null;
	is_lendable: boolean;
}

interface UpdateToolInput extends Partial<CreateToolInput> {
	id: string;
}

export function useTool(toolId?: string) {
	const { user, loading: authLoading } = useAuth();
	const [tool, setTool] = useState<ToolWithImages | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTool = useCallback(async () => {
		if (!user || !toolId) {
			setTool(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		const { data, error } = await supabase
			.from("tools")
			.select(`
				*,
				images:tool_images(*)
			`)
			.eq("id", toolId)
			.eq("owner_id", user.id)
			.single();

		if (error) {
			setError(error.message);
			setTool(null);
		} else {
			setTool(data);
		}

		setLoading(false);
	}, [user, toolId]);

	useEffect(() => {
		if (authLoading) return;
		if (toolId) {
			fetchTool();
		} else {
			setLoading(false);
		}
	}, [authLoading, toolId, fetchTool]);

	const createTool = async (input: CreateToolInput, images?: File[]) => {
		if (!user) return { data: null, error: "Not authenticated" };

		const supabase = createClient();

		const { data, error } = await supabase
			.from("tools")
			.insert({
				...input,
				owner_id: user.id,
			})
			.select()
			.single();

		if (error) {
			return { data: null, error: error.message };
		}

		// Upload images if provided
		if (images && images.length > 0) {
			const imageResults = await uploadImages(data.id, images);
			if (imageResults.error) {
				return { data, error: imageResults.error };
			}
		}

		return { data, error: null };
	};

	const updateTool = async (input: UpdateToolInput, newImages?: File[]) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { id, ...updates } = input;

		const { error } = await supabase
			.from("tools")
			.update(updates)
			.eq("id", id)
			.eq("owner_id", user.id);

		if (error) {
			return { error: error.message };
		}

		// Upload new images if provided
		if (newImages && newImages.length > 0) {
			const imageResults = await uploadImages(id, newImages);
			if (imageResults.error) {
				return { error: imageResults.error };
			}
		}

		// Refresh tool data
		await fetchTool();
		return { error: null };
	};

	const deleteTool = async (id: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		// First delete all images from storage
		const { data: images } = await supabase
			.from("tool_images")
			.select("url")
			.eq("tool_id", id);

		if (images && images.length > 0) {
			const paths = images.map((img) => {
				const url = new URL(img.url);
				return url.pathname.split("/storage/v1/object/public/tool-images/")[1];
			}).filter(Boolean);

			if (paths.length > 0) {
				await supabase.storage.from("tool-images").remove(paths);
			}
		}

		const { error } = await supabase
			.from("tools")
			.delete()
			.eq("id", id)
			.eq("owner_id", user.id);

		if (error) {
			return { error: error.message };
		}

		return { error: null };
	};

	const uploadImages = async (toolId: string, files: File[]) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();
		const uploadedUrls: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileExt = file.name.split(".").pop();
			const fileName = `${Date.now()}-${i}.${fileExt}`;
			const filePath = `${user.id}/${toolId}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("tool-images")
				.upload(filePath, file);

			if (uploadError) {
				return { error: uploadError.message };
			}

			const { data: publicUrl } = supabase.storage
				.from("tool-images")
				.getPublicUrl(filePath);

			uploadedUrls.push(publicUrl.publicUrl);
		}

		// Insert image records
		const imageRecords = uploadedUrls.map((url, index) => ({
			tool_id: toolId,
			url,
			is_primary: index === 0 && (!tool || tool.images.length === 0),
		}));

		const { error: insertError } = await supabase
			.from("tool_images")
			.insert(imageRecords);

		if (insertError) {
			return { error: insertError.message };
		}

		return { error: null };
	};

	const deleteImage = async (imageId: string, imageUrl: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		// Delete from storage
		const url = new URL(imageUrl);
		const path = url.pathname.split("/storage/v1/object/public/tool-images/")[1];

		if (path) {
			await supabase.storage.from("tool-images").remove([path]);
		}

		// Delete from database
		const { error } = await supabase
			.from("tool_images")
			.delete()
			.eq("id", imageId);

		if (error) {
			return { error: error.message };
		}

		// Refresh tool data
		await fetchTool();
		return { error: null };
	};

	return {
		tool,
		loading: loading || authLoading,
		error,
		createTool,
		updateTool,
		deleteTool,
		deleteImage,
		refetch: fetchTool,
	};
}
