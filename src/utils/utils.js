/**
 * Converts an initial timestamp, measured in milliseconds since an event, into a user-friendly elapsed time string.
 *
 * @param {number} initialTimestamp The initial timestamp in milliseconds
 * @returns {string} A human-readable representation of elapsed time (e.g., "Just now", "1 min ago", "5 mins ago", "3 hours ago", "12 days ago", etc.)
 */

export const formatElapsedTime = (initialTimestamp) => {
  const /** {Number} */ currentTimestamp = new Date().getTime();

  const /** {Number} */ mins = Math.round(
      (currentTimestamp - initialTimestamp) / 1000 / 60
    );
  const /** {Number} */ hours = Math.round(mins / 60);
  const /** {Number} */ days = Math.round(hours / 24);

  return mins < 1
    ? "Just now"
    : mins < 2
    ? `${mins} min ago`
    : mins < 60
    ? `${mins} mins ago`
    : hours < 2
    ? `${hours} hour ago`
    : hours < 24
    ? `${hours} hours ago`
    : days < 2
    ? `${days} day ago`
    : `${days} days ago`;
};
