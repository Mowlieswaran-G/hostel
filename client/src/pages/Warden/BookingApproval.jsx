import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { approveBooking, rejectBooking } from "../../services/booking";
import toast from "react-hot-toast";

export default function BookingApproval() {
  const { bookingGroups: bookings, ready, refreshCollection } = useData();

  const handleApprove = async (booking) => {
    try {
      const memberCount = (booking.memberRollNumbers?.length || 0) + 1;
      await approveBooking({
        id: booking.id,
        roomId: booking.roomId,
        memberCount,
      });
      toast.success("Booking approved successfully");
      await Promise.all([
        refreshCollection("bookingGroups"),
        refreshCollection("rooms"),
      ]);
    } catch {
      toast.error("Failed to approve booking");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      toast.success("Booking rejected");
      await refreshCollection("bookingGroups");
    } catch {
      toast.error("Failed to reject booking");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Approve or reject resident room bookings" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            Booking Requests
          </h2>
        </div>
        {!ready ? (
          <Skeleton rows={5} />
        ) : (
          <div className="glass rounded-2xl p-6 text-[color:var(--text-primary)]">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-[color:var(--text-muted)]">
                No booking requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Room</th>
                      <th>Leader Roll No.</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {booking.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString() || "N/A"}
                        </td>
                        <td className="font-bold">{booking.roomNumber}</td>
                        <td>{booking.leaderRoll || "N/A"}</td>
                        <td className="text-xs text-[color:var(--text-secondary)]">
                          {booking.memberRollNumbers?.length > 0
                            ? booking.memberRollNumbers.join(", ")
                            : "None"}
                        </td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                        <td>
                          {booking.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(booking)}
                                className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(booking.id)}
                                className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
