"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
	displayName: string;
	location: string;
	zipCode: string;
	onSave: (data: { display_name: string; location: string; zip_code: string }) => Promise<{ error: string | null }>;
	onCancel: () => void;
}

export function ProfileForm({
	displayName,
	location,
	zipCode,
	onSave,
	onCancel,
}: ProfileFormProps) {
	const [formData, setFormData] = useState({
		display_name: displayName,
		location: location,
		zip_code: zipCode,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setError(null);

		const { error } = await onSave(formData);

		if (error) {
			setError(error);
			setIsSaving(false);
		} else {
			onCancel(); // Exit edit mode on success
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Display Name"
				name="display_name"
				value={formData.display_name}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, display_name: e.target.value }))
				}
				placeholder="Your display name"
			/>

			<Input
				label="Location"
				name="location"
				value={formData.location}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, location: e.target.value }))
				}
				placeholder="City, State"
			/>

			<Input
				label="Zip Code"
				name="zip_code"
				value={formData.zip_code}
				onChange={(e) => {
					const value = e.target.value.replace(/\D/g, "").slice(0, 5);
					setFormData((prev) => ({ ...prev, zip_code: value }));
				}}
				placeholder="12345"
				inputMode="numeric"
				maxLength={5}
			/>

			{error && (
				<p className="text-sm text-red-600">{error}</p>
			)}

			<div className="flex gap-3 pt-2">
				<Button
					type="button"
					variant="secondary"
					onClick={onCancel}
					disabled={isSaving}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={isSaving}
					className="flex-1"
				>
					Save
				</Button>
			</div>
		</form>
	);
}
