"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	images: File[];
	onImagesChange: (images: File[]) => void;
	existingImages?: { id: string; url: string }[];
	onRemoveExisting?: (id: string, url: string) => void;
	maxImages?: number;
	className?: string;
}

export function ImageUpload({
	images,
	onImagesChange,
	existingImages = [],
	onRemoveExisting,
	maxImages = 5,
	className,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [previews, setPreviews] = useState<string[]>([]);

	const totalImages = images.length + existingImages.length;
	const canAddMore = totalImages < maxImages;

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files) return;

			const validFiles: File[] = [];
			const newPreviews: string[] = [];

			Array.from(files).forEach((file) => {
				// Check file type
				if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
					return;
				}

				// Check file size (5MB max)
				if (file.size > 5 * 1024 * 1024) {
					return;
				}

				// Check if we can add more
				if (totalImages + validFiles.length >= maxImages) {
					return;
				}

				validFiles.push(file);
				newPreviews.push(URL.createObjectURL(file));
			});

			if (validFiles.length > 0) {
				onImagesChange([...images, ...validFiles]);
				setPreviews([...previews, ...newPreviews]);
			}
		},
		[images, onImagesChange, maxImages, totalImages, previews]
	);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles]
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			handleFiles(e.target.files);
			// Reset the input so the same file can be selected again
			e.target.value = "";
		},
		[handleFiles]
	);

	const removeImage = useCallback(
		(index: number) => {
			const newImages = images.filter((_, i) => i !== index);
			const newPreviews = previews.filter((_, i) => i !== index);

			// Revoke the URL to free memory
			URL.revokeObjectURL(previews[index]);

			onImagesChange(newImages);
			setPreviews(newPreviews);
		},
		[images, previews, onImagesChange]
	);

	return (
		<div className={cn("space-y-3", className)}>
			{canAddMore && (
				<label
					className={cn(
						"flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6",
						"transition-colors",
						dragActive
							? "border-[#FFCC00] bg-[#FFCC00]/10"
							: "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
					)}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						onChange={handleInputChange}
						className="sr-only"
					/>
					<svg
						className="mb-2 h-8 w-8 text-neutral-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
						/>
					</svg>
					<p className="text-sm font-medium text-neutral-600">
						Tap to add photos
					</p>
					<p className="mt-0.5 text-xs text-neutral-500">
						or drag and drop
					</p>
					<p className="mt-2 text-xs text-neutral-400">
						{totalImages}/{maxImages} photos • Max 5MB each
					</p>
				</label>
			)}

			{(existingImages.length > 0 || previews.length > 0) && (
				<div className="grid grid-cols-4 gap-2">
					{existingImages.map((image) => (
						<div
							key={image.id}
							className="group relative aspect-square overflow-hidden rounded-lg"
						>
							<Image
								src={image.url}
								alt="Tool photo"
								fill
								className="object-cover"
							/>
							{onRemoveExisting && (
								<button
									type="button"
									onClick={() => onRemoveExisting(image.id, image.url)}
									className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
								>
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							)}
						</div>
					))}
					{previews.map((preview, index) => (
						<div
							key={preview}
							className="group relative aspect-square overflow-hidden rounded-lg"
						>
							<Image
								src={preview}
								alt="New photo preview"
								fill
								className="object-cover"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
