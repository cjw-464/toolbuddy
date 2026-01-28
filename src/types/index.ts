export interface User {
	id: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
	zip_code: string | null;
	latitude: number | null;
	longitude: number | null;
	created_at: string;
}

export type ToolCategory =
	| "power-tools"
	| "hand-tools"
	| "measuring"
	| "electrical"
	| "plumbing"
	| "automotive"
	| "gardening"
	| "safety"
	| "other";

export type ToolCondition =
	| "excellent"
	| "good"
	| "fair"
	| "needs-repair";

export interface Tool {
	id: string;
	owner_id: string;
	name: string;
	brand: string | null;
	model: string | null;
	category: ToolCategory;
	condition: ToolCondition;
	notes: string | null;
	is_lendable: boolean;
	created_at: string;
	updated_at: string;
}

export interface ToolImage {
	id: string;
	tool_id: string;
	url: string;
	is_primary: boolean;
	created_at: string;
}

export interface ToolWithImages extends Tool {
	images: ToolImage[];
}

export const TOOL_CATEGORIES: { value: ToolCategory; label: string }[] = [
	{ value: "power-tools", label: "Power Tools" },
	{ value: "hand-tools", label: "Hand Tools" },
	{ value: "measuring", label: "Measuring" },
	{ value: "electrical", label: "Electrical" },
	{ value: "plumbing", label: "Plumbing" },
	{ value: "automotive", label: "Automotive" },
	{ value: "gardening", label: "Gardening" },
	{ value: "safety", label: "Safety" },
	{ value: "other", label: "Other" },
];

export const TOOL_CONDITIONS: { value: ToolCondition; label: string }[] = [
	{ value: "excellent", label: "Excellent" },
	{ value: "good", label: "Good" },
	{ value: "fair", label: "Fair" },
	{ value: "needs-repair", label: "Needs Repair" },
];

// Friendship types
export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";

export interface Friendship {
	id: string;
	requester_id: string;
	addressee_id: string;
	status: FriendshipStatus;
	created_at: string;
	updated_at: string;
}

export interface FriendProfile {
	id: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
	zip_code: string | null;
	latitude: number | null;
	longitude: number | null;
	friendship_id?: string;
	friendship_status?: FriendshipStatus | null;
	i_requested?: boolean;
	lendable_tools_count?: number;
}

export interface FriendTool extends Tool {
	images: ToolImage[];
	owner_name: string | null;
	owner_avatar: string | null;
	owner_latitude: number | null;
	owner_longitude: number | null;
	distance?: number | null; // Calculated distance in miles
}

// Borrow Request / Loan types
export type BorrowRequestStatus =
	| "pending"
	| "approved"
	| "declined"
	| "active"
	| "returned"
	| "cancelled";

export interface BorrowRequest {
	id: string;
	tool_id: string;
	borrower_id: string;
	lender_id: string;
	status: BorrowRequestStatus;
	message: string | null;
	requested_at: string;
	responded_at: string | null;
	picked_up_at: string | null;
	returned_at: string | null;
	created_at: string;
	updated_at: string;
}

// Extended types with joined data for UI
export interface BorrowRequestWithTool extends BorrowRequest {
	tool: Tool & { images: ToolImage[] };
}

export interface BorrowRequestWithDetails extends BorrowRequest {
	tool: Tool & { images: ToolImage[] };
	borrower: User;
	lender: User;
}

// For incoming requests (as lender)
export interface IncomingBorrowRequest extends BorrowRequest {
	tool: Tool & { images: ToolImage[] };
	borrower: User;
}

// For outgoing requests (as borrower)
export interface OutgoingBorrowRequest extends BorrowRequest {
	tool: Tool & { images: ToolImage[] };
	lender: User;
}

// Active loan (approved or active status)
export interface ActiveLoan extends BorrowRequest {
	tool: Tool & { images: ToolImage[] };
	borrower: User;
	lender: User;
}

export const BORROW_REQUEST_STATUSES: {
	value: BorrowRequestStatus;
	label: string;
	description: string;
}[] = [
	{ value: "pending", label: "Pending", description: "Awaiting response" },
	{ value: "approved", label: "Approved", description: "Ready for pickup" },
	{ value: "declined", label: "Declined", description: "Request declined" },
	{ value: "active", label: "Active", description: "Currently borrowed" },
	{ value: "returned", label: "Returned", description: "Tool returned" },
	{ value: "cancelled", label: "Cancelled", description: "Request cancelled" },
];
