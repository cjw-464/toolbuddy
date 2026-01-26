"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
	avatarUrl: string | null;
	displayName: string | null;
	isEditing: boolean;
	onUpload: (file: File) => Promise<{ error: string | null }>;
}

export function AvatarUpload({
	avatarUrl,
	displayName,
	isEditing,
	onUpload,
}: AvatarUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleClick = () => {
		if (isEditing && fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadError(null);

		const { error } = await onUpload(file);

		if (error) {
			setUploadError(error);
		}

		setIsUploading(false);
		// Reset file input
		e.target.value = "";
	};

	const initials = displayName
		? displayName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div className="flex flex-col items-center">
			<button
				type="button"
				onClick={handleClick}
				disabled={!isEditing || isUploading}
				className={cn(
					"relative h-24 w-24 overflow-hidden rounded-full",
					"ring-4 ring-white shadow-lg",
					isEditing && !isUploading && "cursor-pointer hover:opacity-90",
					!isEditing && "cursor-default"
				)}
			>
				{avatarUrl ? (
					<Image
						src={avatarUrl}
						alt={displayName || "Profile"}
						fill
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-neutral-200 text-2xl font-semibold text-neutral-600">
						{initials}
					</div>
				)}

				{/* Camera overlay in edit mode */}
				{isEditing && (
					<div
						className={cn(
							"absolute inset-0 flex items-center justify-center",
							"bg-black/40 transition-opacity",
							isUploading ? "opacity-100" : "opacity-0 hover:opacity-100"
						)}
					>
						{isUploading ? (
							<svg
								className="h-8 w-8 animate-spin text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						) : (
							<svg
								className="h-8 w-8 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
								/>
							</svg>
						)}
					</div>
				)}
			</button>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleFileChange}
				className="sr-only"
			/>

			{uploadError && (
				<p className="mt-2 text-sm text-red-600">{uploadError}</p>
			)}

			{isEditing && !uploadError && (
				<p className="mt-2 text-xs text-neutral-500">Tap to change photo</p>
			)}
		</div>
	);
}
