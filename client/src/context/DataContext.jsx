/**
 * DataContext — Global data store backed by MySQL Express API.
 * Fetches collections from MySQL backend at app startup,
 * then serves data from memory to every page for instant switching.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../services/api";

const DataContext = createContext(null);

function normalizeDates(item) {
  if (!item || typeof item !== "object") return item;
  const copy = { ...item };
  for (const key of ["createdAt", "updatedAt", "resolvedAt"]) {
    if (copy[key]) {
      const d = new Date(copy[key]);
      copy[key] = {
        toDate: () => d,
        toISOString: () => d.toISOString(),
        toLocaleDateString: (...args) => d.toLocaleDateString(...args),
        toString: () => d.toString(),
      };
    }
  }
  return copy;
}

const ENDPOINTS = {
  rooms: "/rooms",
  maintenanceRequests: "/maintenance/all",
  outingRequests: "/outing/all",
  bookingGroups: "/bookings",
  announcements: "/announcements",
};

export function DataProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [outingRequests, setOutingRequests] = useState([]);
  const [bookingGroups, setBookingGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ready, setReady] = useState(false);

  // Fetch a single collection from MySQL backend
  const fetchCollection = useCallback(async (name, setter) => {
    try {
      const endpoint = ENDPOINTS[name];
      if (!endpoint) return;
      const res = await api.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : [];
      setter(data.map(normalizeDates));
    } catch (err) {
      console.warn(`DataContext: failed to fetch ${name} from MySQL backend`, err);
    }
  }, []);

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
      if (map[name]) await fetchCollection(name, map[name]);
    },
    [fetchCollection],
  );

  // Load all collections in parallel on mount
  useEffect(() => {
    Promise.all([
      fetchCollection("rooms", setRooms),
      fetchCollection("maintenanceRequests", setMaintenanceRequests),
      fetchCollection("outingRequests", setOutingRequests),
      fetchCollection("bookingGroups", setBookingGroups),
      fetchCollection("announcements", setAnnouncements),
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
