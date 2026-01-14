export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    ` • ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} ${date.getHours() >= 12 ? "PM" : "AM"}`
  );
};
