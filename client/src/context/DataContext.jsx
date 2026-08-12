/**
 * DataContext — Global data store that fetches all Firestore collections ONCE
 * at app startup, then serves data from memory to every page.
 *
 * Page switches are instant since they read from state, not the network.
 * Any mutation (create/update) calls refreshCollection() to re-sync.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [outingRequests, setOutingRequests] = useState([]);
  const [bookingGroups, setBookingGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ready, setReady] = useState(false);

  // Fetch a single collection and update state
  const fetchCollection = useCallback(
    async (name, setter, orderField = "createdAt") => {
      try {
        const q = orderField
          ? query(collection(db, name), orderBy(orderField, "desc"))
          : query(collection(db, name));
        const snap = await getDocs(q);
        setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn(`DataContext: failed to fetch ${name}`, err);
      }
    },
    [],
  );

  // Re-fetch a specific collection (call after mutations)
  const refreshCollection = useCallback(
    async (name) => {
      const map = {
        rooms: (d) => setRooms(d),
        maintenanceRequests: (d) => setMaintenanceRequests(d),
        outingRequests: (d) => setOutingRequests(d),
        bookingGroups: (d) => setBookingGroups(d),
        announcements: (d) => setAnnouncements(d),
      };
      const orderField = name === "rooms" ? "roomNumber" : "createdAt";
      if (map[name]) await fetchCollection(name, map[name], orderField);
    },
    [fetchCollection],
  );

  // Load all collections in parallel on mount (single burst of network calls)
  useEffect(() => {
    Promise.all([
      fetchCollection("rooms", setRooms, "roomNumber"),
      fetchCollection(
        "maintenanceRequests",
        setMaintenanceRequests,
        "createdAt",
      ),
      fetchCollection("outingRequests", setOutingRequests, "createdAt"),
      fetchCollection("bookingGroups", setBookingGroups, "createdAt"),
      fetchCollection("announcements", setAnnouncements, "createdAt"),
    ]).finally(() => setReady(true));
  }, [fetchCollection]);

  return (
    <DataContext.Provider
      value={{
        rooms,
        maintenanceRequests,
        outingRequests,
        bookingGroups,
        announcements,
        ready,
        refreshCollection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
