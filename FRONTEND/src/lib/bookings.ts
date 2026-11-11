export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-stone-200 text-stone-600",
};

// The same moves the server allows: pending -> confirmed/cancelled,
// confirmed -> completed/cancelled. Finished bookings have no actions.
export const NEXT_ACTIONS: Partial<Record<BookingStatus, { to: BookingStatus; label: string }[]>> = {
  pending: [
    { to: "confirmed", label: "Confirm" },
    { to: "cancelled", label: "Cancel" },
  ],
  confirmed: [
    { to: "completed", label: "Mark completed" },
    { to: "cancelled", label: "Cancel" },
  ],
};

// Booking dates are stored as midnight UTC, so format in UTC to avoid the
// date shifting by a day in some time zones.
export function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
