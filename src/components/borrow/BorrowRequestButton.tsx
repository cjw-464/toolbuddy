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
		canJoinWaitlist,
		existingRequest,
		isCurrentlyBorrowed,
		waitlistPosition,
		waitlistCount,
		loading: statusLoading,
		refetch: refetchStatus,
	} = useToolBorrowStatus(toolId, ownerId);

	const { createRequest, joinWaitlist, markAsPickedUp } = useBorrowRequests();
	const [isWaitlistMode, setIsWaitlistMode] = useState(false);
	const [isPickupMode, setIsPickupMode] = useState(false);

	const handleOpenModal = (mode: "request" | "waitlist" | "pickup" = "request") => {
		setMessage("");
		setSubmitError(null);
		setSubmitSuccess(false);
		setIsWaitlistMode(mode === "waitlist");
		setIsPickupMode(mode === "pickup");
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsWaitlistMode(false);
		setIsPickupMode(false);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setSubmitError(null);

		let error: string | null = null;

		if (isPickupMode && existingRequest) {
			const result = await markAsPickedUp(existingRequest.id);
			error = result.error;
		} else if (isWaitlistMode) {
			const result = await joinWaitlist(toolId, ownerId, message || undefined);
			error = result.error;
		} else {
			const result = await createRequest(toolId, ownerId, message || undefined);
			error = result.error;
		}

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
			setIsWaitlistMode(false);
			setIsPickupMode(false);
		}, 1500);
	};

	// Determine button state and text
	const getButtonState = (): { disabled: boolean; text: string; variant: "primary" | "secondary"; mode: "request" | "waitlist" | "pickup" } => {
		if (statusLoading) {
			return { disabled: true, text: "Loading...", variant: "secondary", mode: "request" };
		}

		if (existingRequest) {
			if (existingRequest.status === "pending") {
				return { disabled: true, text: "Handshake Pending", variant: "secondary", mode: "request" };
			}
			if (existingRequest.status === "approved") {
				return { disabled: false, text: "I've Picked It Up", variant: "primary", mode: "pickup" };
			}
			if (existingRequest.status === "active") {
				return { disabled: true, text: "Currently Borrowing", variant: "secondary", mode: "request" };
			}
			if (existingRequest.status === "waitlisted") {
				return {
					disabled: true,
					text: `On Waitlist (#${waitlistPosition})`,
					variant: "secondary",
					mode: "request",
				};
			}
		}

		if (canRequest) {
			return { disabled: false, text: "Request to Borrow", variant: "primary", mode: "request" };
		}

		if (canJoinWaitlist) {
			const waitlistText = waitlistCount > 0
				? `Join Waitlist (${waitlistCount} waiting)`
				: "Join Waitlist";
			return { disabled: false, text: waitlistText, variant: "secondary", mode: "waitlist" };
		}

		return { disabled: true, text: "Unavailable", variant: "secondary", mode: "request" };
	};

	const buttonState = getButtonState();

	return (
		<>
			<Button
				onClick={() => handleOpenModal(buttonState.mode)}
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
									{isPickupMode ? "Marked as Picked Up!" : isWaitlistMode ? "Added to Waitlist!" : "Request Sent!"}
								</h3>
								<p className="mt-1 text-neutral-600">
									{isPickupMode
										? "You now have the tool. Remember to return it when you're done!"
										: isWaitlistMode
										? "You'll be notified when the tool becomes available."
										: `${ownerName || "The owner"} will be notified of your request.`}
								</p>
							</div>
						) : isPickupMode ? (
							<>
								<h2 className="text-xl font-semibold text-neutral-900">
									Confirm Pickup
								</h2>
								<p className="mt-1 text-neutral-600">
									Confirm that you&apos;ve picked up <span className="font-medium">{toolName}</span> from{" "}
									{ownerName || "your buddy"}.
								</p>

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
										I&apos;ve Picked It Up
									</Button>
								</div>
							</>
						) : (
							<>
								<h2 className="text-xl font-semibold text-neutral-900">
									{isWaitlistMode ? "Join Waitlist" : "Request to Borrow"}
								</h2>
								<p className="mt-1 text-neutral-600">
									{isWaitlistMode ? (
										<>
											<span className="font-medium">{toolName}</span> is currently on loan.
											Join the waitlist to be notified when it&apos;s available.
											{waitlistCount > 0 && (
												<span className="block mt-1 text-sm">
													{waitlistCount} {waitlistCount === 1 ? "person is" : "people are"} already waiting.
												</span>
											)}
										</>
									) : (
										<>
											Request to borrow <span className="font-medium">{toolName}</span> from{" "}
											{ownerName || "your buddy"}.
										</>
									)}
								</p>

								<div className="mt-4">
									<Textarea
										label="Message (optional)"
										placeholder={isWaitlistMode
											? "Add a note about when you'd need it..."
											: "Add a message to your request..."}
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										rows={3}
									/>
									<p className="mt-1 text-xs text-neutral-500">
										{isWaitlistMode
											? "You'll be notified when the tool becomes available."
											: "Let them know when you need it or any other details."}
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
										{isWaitlistMode ? "Join Waitlist" : "Send Request"}
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
