import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";

export const createBooking = async (data) => {
  // data: { roomId, roomNumber, memberRollNumbers, leaderId, leaderRoll }
  const docRef = await addDoc(collection(db, "bookingGroups"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef;
};

export const approveBooking = async ({ id, roomId, memberCount }) => {
  const batch = writeBatch(db);

  const bookingRef = doc(db, "bookingGroups", id);
  batch.update(bookingRef, {
    status: "approved",
    updatedAt: serverTimestamp(),
  });

  if (roomId && memberCount) {
    const roomRef = doc(db, "rooms", roomId);
    batch.update(roomRef, { occupiedBeds: increment(memberCount) });
  }

  await batch.commit();
};

export const rejectBooking = async (id) => {
  const bookingRef = doc(db, "bookingGroups", id);
  await updateDoc(bookingRef, {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
};

export const getAllBookings = async () => {
  const q = query(
    collection(db, "bookingGroups"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBookingStatus = async (uid) => {
  const q = query(
    collection(db, "bookingGroups"),
    where("leaderId", "==", uid),
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docData = snap.docs[0];
    return { data: { id: docData.id, ...docData.data() } };
  }
  return { data: null };
};
