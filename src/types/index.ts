export interface User {
	id: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
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

export interface Friend {
	id: string;
	user_id: string;
	friend_id: string;
	status: "pending" | "accepted" | "declined";
	created_at: string;
}
