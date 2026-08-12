import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { RiBookmarkLine, RiBuilding2Line } from "react-icons/ri";

export default function MyBookings() {
  const { user } = useAuth();
  const { bookingGroups: allBookings, ready } = useData();

  // Filter by current resident's Firebase UID — instant, no network call
  const bookings = allBookings.filter((b) => b.leaderId === user?.uid);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Track your current and past room booking requests" />

        <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest mb-4">
          My Booking Requests
        </h2>

        {!ready ? (
          <Skeleton rows={4} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <RiBookmarkLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">
                  No bookings yet. Go to "Book a Room" to get started!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applied On</th>
                      <th>Room</th>
                      <th>Members</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {b.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <RiBuilding2Line
                              size={14}
                              className="text-[color:var(--text-muted)]"
                            />
                            <span className="font-bold text-[color:var(--text-primary)]">
                              Room {b.roomNumber}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-[color:var(--text-secondary)]">
                          {b.memberRollNumbers?.length > 0
                            ? b.memberRollNumbers.join(", ")
                            : "Solo booking"}
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                          {b.status === "approved" && (
                            <p className="text-xs text-green-400 mt-1">
                              Room assigned ✓
                            </p>
                          )}
                          {b.status === "rejected" && (
                            <p className="text-xs text-red-400 mt-1">
                              Contact the warden
                            </p>
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

        {/* Help card */}
        <div className="glass rounded-2xl p-5 mt-6">
          <h3 className="font-semibold text-[color:var(--text-primary)] mb-2 text-sm">
            How Booking Works
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-xs text-[color:var(--text-secondary)]">
            <li>Browse available rooms in the "Book a Room" section.</li>
            <li>Select a room and add your group members' roll numbers.</li>
            <li>Submit the request — it goes to the Warden for approval.</li>
            <li>
              Once approved, the room is officially assigned to your group.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
