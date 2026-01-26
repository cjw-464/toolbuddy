"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "./ImageUpload";
import { useTool } from "@/hooks/useTool";
import {
	TOOL_CATEGORIES,
	TOOL_CONDITIONS,
	type Tool,
	type ToolCategory,
	type ToolCondition,
	type ToolImage,
} from "@/types";

interface ToolFormProps {
	tool?: Tool & { images: ToolImage[] };
	mode: "create" | "edit";
	onEditSuccess?: () => void;
}

export function ToolForm({ tool, mode, onEditSuccess }: ToolFormProps) {
	const router = useRouter();
	const { createTool, updateTool, deleteImage } = useTool(tool?.id);

	const [name, setName] = useState(tool?.name || "");
	const [brand, setBrand] = useState(tool?.brand || "");
	const [model, setModel] = useState(tool?.model || "");
	const [category, setCategory] = useState<ToolCategory | "">(tool?.category || "");
	const [condition, setCondition] = useState<ToolCondition | "">(tool?.condition || "");
	const [notes, setNotes] = useState(tool?.notes || "");
	const [isLendable, setIsLendable] = useState(tool?.is_lendable ?? true);
	const [images, setImages] = useState<File[]>([]);
	const [existingImages, setExistingImages] = useState<ToolImage[]>(tool?.images || []);

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleRemoveExistingImage = async (imageId: string, imageUrl: string) => {
		const result = await deleteImage(imageId, imageUrl);
		if (result.error) {
			setError(result.error);
		} else {
			setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		if (name.length > 100) {
			setError("Name must be 100 characters or less");
			return;
		}
		if (!category) {
			setError("Category is required");
			return;
		}
		if (!condition) {
			setError("Condition is required");
			return;
		}
		if (notes && notes.length > 500) {
			setError("Notes must be 500 characters or less");
			return;
		}

		setIsLoading(true);

		const toolData = {
			name: name.trim(),
			brand: brand.trim() || null,
			model: model.trim() || null,
			category: category as ToolCategory,
			condition: condition as ToolCondition,
			notes: notes.trim() || null,
			is_lendable: isLendable,
		};

		if (mode === "create") {
			const result = await createTool(toolData, images.length > 0 ? images : undefined);
			if (result.error) {
				setError(result.error);
				setIsLoading(false);
			} else if (result.data) {
				router.push(`/tools/${result.data.id}`);
			}
		} else if (tool) {
			const result = await updateTool(
				{ id: tool.id, ...toolData },
				images.length > 0 ? images : undefined
			);
			if (result.error) {
				setError(result.error);
				setIsLoading(false);
			} else {
				setIsLoading(false);
				if (onEditSuccess) {
					onEditSuccess();
				} else {
					router.push(`/tools/${tool.id}`);
				}
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
					{error}
				</div>
			)}

			<Input
				label="Name"
				name="name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="e.g., Cordless Drill"
				required
				maxLength={100}
			/>

			<div className="grid grid-cols-2 gap-3">
				<Input
					label="Brand"
					name="brand"
					value={brand}
					onChange={(e) => setBrand(e.target.value)}
					placeholder="e.g., DeWalt"
				/>

				<Input
					label="Model"
					name="model"
					value={model}
					onChange={(e) => setModel(e.target.value)}
					placeholder="e.g., DCD791"
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<Select
					label="Category"
					name="category"
					options={TOOL_CATEGORIES}
					value={category}
					onChange={(e) => setCategory(e.target.value as ToolCategory)}
					placeholder="Select category"
					required
				/>

				<Select
					label="Condition"
					name="condition"
					options={TOOL_CONDITIONS}
					value={condition}
					onChange={(e) => setCondition(e.target.value as ToolCondition)}
					placeholder="Select condition"
					required
				/>
			</div>

			<Textarea
				label="Notes"
				name="notes"
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder="Any additional details about this tool..."
				maxLength={500}
			/>

			<div>
				<label className="mb-1.5 block text-sm font-medium text-neutral-700">
					Photos
				</label>
				<ImageUpload
					images={images}
					onImagesChange={setImages}
					existingImages={existingImages}
					onRemoveExisting={handleRemoveExistingImage}
				/>
			</div>

			<div className="flex items-center gap-3">
				<input
					type="checkbox"
					id="isLendable"
					checked={isLendable}
					onChange={(e) => setIsLendable(e.target.checked)}
					className="h-5 w-5 rounded border-neutral-300 text-[#FFCC00] focus:ring-[#FFCC00]/50"
				/>
				<label htmlFor="isLendable" className="text-sm text-neutral-700">
					Available to lend to friends
				</label>
			</div>

			<div className="flex gap-3 pt-2">
				<Button
					type="button"
					variant="secondary"
					onClick={() => router.back()}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={isLoading}
					className="flex-1"
				>
					{mode === "create" ? "Add Tool" : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
