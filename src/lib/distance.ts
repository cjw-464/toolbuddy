/**
 * Look up coordinates for a US zip code using zippopotam.us API
 */
export async function getCoordinatesFromZip(
	zipCode: string
): Promise<{ latitude: number; longitude: number } | null> {
	try {
		const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
		if (!response.ok) {
			return null;
		}
		const data = await response.json();
		if (data.places && data.places.length > 0) {
			return {
				latitude: parseFloat(data.places[0].latitude),
				longitude: parseFloat(data.places[0].longitude),
			};
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 3959; // Earth's radius in miles
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;

	return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
	if (miles < 1) {
		return "< 1 mi";
	}
	if (miles < 10) {
		return `${miles.toFixed(1)} mi`;
	}
	return `${Math.round(miles)} mi`;
}
