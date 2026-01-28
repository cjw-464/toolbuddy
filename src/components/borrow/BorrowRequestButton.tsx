"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToolBorrowStatus } from "@/hooks/useToolBorrowStatus";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { cn } from "@/lib/utils";

interface BorrowRequestButtonProps {
	toolId: string;
	toolName: string;
	ownerId: string;
	ownerName: string | null;
}

export function BorrowRequestButton({
	toolId,
	toolName,
	ownerId,
	ownerName,
}: BorrowRequestButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	const {
		canRequest,
		existingRequest,
		isCurrentlyBorrowed,
		loading: statusLoading,
		refetch: refetchStatus,
	} = useToolBorrowStatus(toolId, ownerId);

	const { createRequest } = useBorrowRequests();

	const handleOpenModal = () => {
		setMessage("");
		setSubmitError(null);
		setSubmitSuccess(false);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setSubmitError(null);

		const { error } = await createRequest(toolId, ownerId, message || undefined);

		if (error) {
			setSubmitError(error);
			setIsSubmitting(false);
			return;
		}

		setSubmitSuccess(true);
		setIsSubmitting(false);
		await refetchStatus();

		// Close modal after a short delay
		setTimeout(() => {
			setIsModalOpen(false);
		}, 1500);
	};

	// Determine button state and text
	const getButtonState = () => {
		if (statusLoading) {
			return { disabled: true, text: "Loading...", variant: "secondary" as const };
		}

		if (existingRequest) {
			if (existingRequest.status === "pending") {
				return { disabled: true, text: "Request Pending", variant: "secondary" as const };
			}
			if (existingRequest.status === "approved") {
				return { disabled: true, text: "Approved - Ready for Pickup", variant: "secondary" as const };
			}
			if (existingRequest.status === "active") {
				return { disabled: true, text: "Currently Borrowing", variant: "secondary" as const };
			}
		}

		if (isCurrentlyBorrowed) {
			return { disabled: true, text: "Currently Unavailable", variant: "secondary" as const };
		}

		if (canRequest) {
			return { disabled: false, text: "Request to Borrow", variant: "primary" as const };
		}

		return { disabled: true, text: "Unavailable", variant: "secondary" as const };
	};

	const buttonState = getButtonState();

	return (
		<>
			<Button
				onClick={handleOpenModal}
				disabled={buttonState.disabled}
				variant={buttonState.variant}
				className="w-full"
			>
				{buttonState.text}
			</Button>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/50"
						onClick={handleCloseModal}
					/>

					{/* Modal Content */}
					<div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
						{submitSuccess ? (
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
									<svg
										className="h-6 w-6 text-green-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-neutral-900">
									Request Sent!
								</h3>
								<p className="mt-1 text-neutral-600">
									{ownerName || "The owner"} will be notified of your request.
								</p>
							</div>
						) : (
							<>
								<h2 className="text-xl font-semibold text-neutral-900">
									Request to Borrow
								</h2>
								<p className="mt-1 text-neutral-600">
									Request to borrow <span className="font-medium">{toolName}</span> from{" "}
									{ownerName || "your friend"}.
								</p>

								<div className="mt-4">
									<Textarea
										label="Message (optional)"
										placeholder="Add a message to your request..."
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										rows={3}
									/>
									<p className="mt-1 text-xs text-neutral-500">
										Let them know when you need it or any other details.
									</p>
								</div>

								{submitError && (
									<div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
										{submitError}
									</div>
								)}

								<div className="mt-6 flex gap-3">
									<Button
										variant="secondary"
										onClick={handleCloseModal}
										className="flex-1"
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										variant="primary"
										onClick={handleSubmit}
										className="flex-1"
										isLoading={isSubmitting}
									>
										Send Request
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
