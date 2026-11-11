import { BookingStatus, STATUS_STYLES, capitalize } from "@/lib/bookings";

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {capitalize(status)}
    </span>
  );
}
