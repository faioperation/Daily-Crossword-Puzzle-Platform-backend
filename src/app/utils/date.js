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
 * Calculates the UTC offset string (e.g. -04:00 or -05:00) for a given date in America/New_York timezone.
 */
export const getOffsetStringForDate = (date) => {
  const tzString = date.toLocaleString("en-US", {
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
  return offsetStr;
};

/**
 * Calculates the start and end of the day in America/New_York (EST/EDT) timezone,
 * returning absolute Date objects. Supports passing String or Date objects.
 */
export const getESTDayBoundaries = (dateInput = new Date()) => {
  let targetDate;
  if (typeof dateInput === "string") {
    if (dateInput.length === 10) {
      // YYYY-MM-DD string, construct it in noon UTC to determine offset safely
      targetDate = new Date(`${dateInput}T12:00:00Z`);
    } else {
      targetDate = new Date(dateInput);
    }
  } else {
    targetDate = dateInput;
  }

  // Format to YYYY-MM-DD in America/New_York timezone
  const nyDateStr = targetDate.toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });

  const offsetStr = getOffsetStringForDate(targetDate);

  const start = new Date(`${nyDateStr}T00:00:00${offsetStr}`);
  const end = new Date(`${nyDateStr}T23:59:59.999${offsetStr}`);

  return { start, end };
};

/**
 * Returns a UTC Date representing the start of a calendar date string (e.g., '2026-07-14') in America/New_York timezone.
 */
export const getESTStartOfDay = (dateInput) => {
  let dateObj;
  if (typeof dateInput === "string") {
    if (dateInput.length === 10) {
      dateObj = new Date(`${dateInput}T12:00:00Z`);
    } else {
      dateObj = new Date(dateInput);
    }
  } else {
    dateObj = dateInput;
  }
  return getESTDayBoundaries(dateObj).start;
};

/**
 * Formats a Date object to get the day name in America/New_York (e.g. 'Sun', 'Mon').
 */
export const getESTDayName = (date = new Date()) => {
  return date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  });
};

