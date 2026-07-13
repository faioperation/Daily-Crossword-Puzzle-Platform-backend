/**
 * Formats a given date (defaulting to now) as a YYYY-MM-DD string in the America/New_York (EST/EDT) timezone.
 */
export const getESTDateString = (date = new Date()) => {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
};

/**
 * Calculates the difference in days between two EST date strings.
 */
export const getESTDateDiffInDays = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates the start and end of the current day in America/New_York (EST/EDT) timezone,
 * returning absolute Date objects.
 */
export const getESTDayBoundaries = () => {
  const now = new Date();

  // Format to YYYY-MM-DD in America/New_York timezone
  const nyDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });

  // Get timezone string with long offset
  const tzString = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "longOffset",
  });

  const match = tzString.match(/GMT([+-]\d+)(:?\d+)?/);
  let offsetStr = "-05:00"; // fallback
  if (match) {
    const sign = match[1].charAt(0);
    const hours = match[1].replace(/[+-]/, "").padStart(2, "0");
    const minutes = (match[2] || ":00").replace(":", "").padStart(2, "0");
    offsetStr = `${sign}${hours}:${minutes}`;
  }

  const start = new Date(`${nyDateStr}T00:00:00${offsetStr}`);
  const end = new Date(`${nyDateStr}T23:59:59.999${offsetStr}`);

  return { start, end };
};
