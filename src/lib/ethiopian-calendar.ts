import Kenat from 'kenat';

/**
 * Uses the 'kenat' library for professional Ethiopian Calendar conversion.
 */

export function toEthiopianDate(date: Date): string {
  try {
    // Initialize Kenat with the Gregorian date
    const kenatDate = new Kenat(date);
    
    // Use the built-in format method
    return kenatDate.format({ lang: 'english' });
  } catch (error) {
    console.error("Error converting to Ethiopian date:", error);
    return date.toLocaleDateString();
  }
}

export function formatByPreference(date: Date, type: "GREGORIAN" | "ETHIOPIAN"): string {
  if (type === "ETHIOPIAN") {
    return toEthiopianDate(date);
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
