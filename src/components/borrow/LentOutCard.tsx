"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ActiveLoan, IncomingBorrowRequest } from "@/types";

interface LentOutCardProps {
	loan: ActiveLoan | IncomingBorrowRequest;
	onConfirmPickup?: (requestId: string) => Promise<{ error: string | null }>;
	onConfirmReturn?: (requestId: string) => Promise<{ error: string | null }>;
}

export function LentOutCard({ loan, onConfirmPickup, onConfirmReturn }: LentOutCardProps) {
	const [isConfirming, setIsConfirming] = useState(false);
	const [showPickupConfirm, setShowPickupConfirm] = useState(false);
	const [showReturnConfirm, setShowReturnConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check handshake status
	const borrowerConfirmedPickup = !!loan.borrower_confirmed_pickup_at;
	const lenderConfirmedPickup = !!loan.lender_confirmed_pickup_at;
	const borrowerConfirmedReturn = !!loan.borrower_confirmed_return_at;
	const lenderConfirmedReturn = !!loan.lender_confirmed_return_at;

	const primaryImage =
		loan.tool.images?.find((img) => img.is_primary) || loan.tool.images?.[0];

	const handleConfirmPickup = async () => {
		if (!onConfirmPickup) return;
		setIsConfirming(true);
		setError(null);
		const { error } = await onConfirmPickup(loan.id);
		if (error) {
			setError(error);
		}
		setIsConfirming(false);
		setShowPickupConfirm(false);
	};

	const handleConfirmReturn = async () => {
		if (!onConfirmReturn) return;
		setIsConfirming(true);
		setError(null);
		const { error } = await onConfirmReturn(loan.id);
		if (error) {
			setError(error);
		}
		setIsConfirming(false);
		setShowReturnConfirm(false);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	// Get the latest transaction info
	const getLatestTransaction = () => {
		if (loan.picked_up_at) {
			return { label: "Picked up", date: loan.picked_up_at };
		}
		if (loan.responded_at) {
			return { label: "Approved", date: loan.responded_at };
		}
		return { label: "Requested", date: loan.requested_at };
	};

	const latestTransaction = getLatestTransaction();

	const getDuration = () => {
		const start = loan.picked_up_at || loan.responded_at || loan.requested_at;
		const startDate = new Date(start);
		const now = new Date();
		const days = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		if (days === 0) return "Today";
		if (days === 1) return "1 day";
		return `${days} days`;
	};

	return (
		<>
			<div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
				<div className="flex gap-4">
					{/* Tool Image */}
					<Link
						href={`/tools/${loan.tool_id}`}
						className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100"
					>
						{primaryImage ? (
							<Image
								src={primaryImage.url}
								alt={loan.tool.name}
								width={80}
								height={80}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<svg
									className="h-8 w-8 text-neutral-300"
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
						)}
					</Link>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<Link
							href={`/tools/${loan.tool_id}`}
							className="font-semibold text-neutral-900 hover:underline truncate block"
						>
							{loan.tool.name}
						</Link>

						{/* Borrower info */}
						<Link
							href={`/friends/${loan.borrower_id}`}
							className="mt-1 flex items-center gap-2 group"
						>
							<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
								{loan.borrower.avatar_url ? (
									<img
										src={loan.borrower.avatar_url}
										alt={loan.borrower.display_name || "User"}
										className="h-5 w-5 rounded-full object-cover"
									/>
								) : (
									<svg
										className="h-3 w-3 text-neutral-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
										/>
									</svg>
								)}
							</div>
							<span className="text-sm text-neutral-600 truncate group-hover:underline">
								Borrowed by {loan.borrower.display_name || loan.borrower.email}
							</span>
						</Link>

						{/* Status & Duration */}
						<div className="mt-2 flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
										loan.status === "active"
											? "bg-blue-50 text-blue-700"
											: "bg-green-50 text-green-700"
									)}
								>
									{loan.status === "active" ? "Active" : "Ready for pickup"}
								</span>
								{loan.status === "active" && (
									<span className="text-xs text-neutral-500">
										{getDuration()}
									</span>
								)}
							</div>
							<p className="text-xs text-neutral-500">
								{latestTransaction.label} {formatDate(latestTransaction.date)}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
						{error}
					</div>
				)}

				{/* Handshake Status for Approved (Pickup Pending) */}
				{loan.status === "approved" && (
					<div className="mt-4 space-y-3">
						{/* Pickup confirmation status */}
						<div className="rounded-lg bg-neutral-50 p-3">
							<p className="text-sm font-medium text-neutral-700 mb-2">Pickup Confirmation</p>
							<div className="flex items-center gap-2 text-sm">
								<span className={cn(
									"inline-flex items-center gap-1",
									borrowerConfirmedPickup ? "text-green-600" : "text-neutral-400"
								)}>
									{borrowerConfirmedPickup ? (
										<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
									) : (
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<circle cx="12" cy="12" r="10" strokeWidth="2" />
										</svg>
									)}
									{loan.borrower.display_name || "Borrower"}
								</span>
								<span className="text-neutral-300">|</span>
								<span className={cn(
									"inline-flex items-center gap-1",
									lenderConfirmedPickup ? "text-green-600" : "text-neutral-400"
								)}>
									{lenderConfirmedPickup ? (
										<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
									) : (
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<circle cx="12" cy="12" r="10" strokeWidth="2" />
										</svg>
									)}
									You
								</span>
							</div>
						</div>

						{/* Confirm pickup button (if lender hasn't confirmed yet) */}
						{!lenderConfirmedPickup && onConfirmPickup && (
							<Button
								variant="primary"
								onClick={() => setShowPickupConfirm(true)}
								className="w-full"
							>
								Confirm Handoff
							</Button>
						)}

						{/* Waiting message if lender confirmed but borrower hasn't */}
						{lenderConfirmedPickup && !borrowerConfirmedPickup && (
							<p className="text-sm text-center text-neutral-500">
								Waiting for {loan.borrower.display_name || "borrower"} to confirm pickup...
							</p>
						)}
					</div>
				)}

				{/* Handshake Status for Active (Return Pending) */}
				{loan.status === "active" && (
					<div className="mt-4 space-y-3">
						{/* Return confirmation status (only show if someone has started return) */}
						{(borrowerConfirmedReturn || lenderConfirmedReturn) && (
							<div className="rounded-lg bg-neutral-50 p-3">
								<p className="text-sm font-medium text-neutral-700 mb-2">Return Confirmation</p>
								<div className="flex items-center gap-2 text-sm">
									<span className={cn(
										"inline-flex items-center gap-1",
										borrowerConfirmedReturn ? "text-green-600" : "text-neutral-400"
									)}>
										{borrowerConfirmedReturn ? (
											<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
										) : (
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<circle cx="12" cy="12" r="10" strokeWidth="2" />
											</svg>
										)}
										{loan.borrower.display_name || "Borrower"}
									</span>
									<span className="text-neutral-300">|</span>
									<span className={cn(
										"inline-flex items-center gap-1",
										lenderConfirmedReturn ? "text-green-600" : "text-neutral-400"
									)}>
										{lenderConfirmedReturn ? (
											<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
										) : (
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<circle cx="12" cy="12" r="10" strokeWidth="2" />
											</svg>
										)}
										You
									</span>
								</div>
							</div>
						)}

						{/* Confirm return button (if lender hasn't confirmed yet) */}
						{!lenderConfirmedReturn && onConfirmReturn && (
							<Button
								variant="primary"
								onClick={() => setShowReturnConfirm(true)}
								className="w-full"
							>
								Confirm Return
							</Button>
						)}

						{/* Waiting message if lender confirmed but borrower hasn't */}
						{lenderConfirmedReturn && !borrowerConfirmedReturn && (
							<p className="text-sm text-center text-neutral-500">
								Waiting for {loan.borrower.display_name || "borrower"} to confirm return...
							</p>
						)}
					</div>
				)}
			</div>

			{/* Pickup Confirmation Modal */}
			{showPickupConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setShowPickupConfirm(false)}
					/>
					<div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-semibold text-neutral-900">
							Confirm Handoff
						</h3>
						<p className="mt-2 text-neutral-600">
							Confirm that <span className="font-medium">{loan.borrower.display_name || "the borrower"}</span> has picked up{" "}
							<span className="font-medium">{loan.tool.name}</span>?
						</p>
						<p className="mt-2 text-sm text-neutral-500">
							Both you and the borrower must confirm for the handoff to complete.
						</p>

						<div className="mt-6 flex gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowPickupConfirm(false)}
								className="flex-1"
								disabled={isConfirming}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleConfirmPickup}
								isLoading={isConfirming}
								className="flex-1"
							>
								Yes, Confirm
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Return Confirmation Modal */}
			{showReturnConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setShowReturnConfirm(false)}
					/>
					<div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-semibold text-neutral-900">
							Confirm Return
						</h3>
						<p className="mt-2 text-neutral-600">
							Confirm that <span className="font-medium">{loan.borrower.display_name || "the borrower"}</span> has returned{" "}
							<span className="font-medium">{loan.tool.name}</span>?
						</p>
						<p className="mt-2 text-sm text-neutral-500">
							Both you and the borrower must confirm for the return to complete.
						</p>

						<div className="mt-6 flex gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowReturnConfirm(false)}
								className="flex-1"
								disabled={isConfirming}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleConfirmReturn}
								isLoading={isConfirming}
								className="flex-1"
							>
								Yes, Confirm
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
