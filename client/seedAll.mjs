// seedAll.mjs - Seeds all Firestore collections with realistic hostel data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyCZdNxv6pPc6DHHshsAyIhdK-OEDVzl798',
  authDomain:        'hostel-management-775e6.firebaseapp.com',
  projectId:         'hostel-management-775e6',
  storageBucket:     'hostel-management-775e6.firebasestorage.app',
  messagingSenderId: '20835254431',
  appId:             '1:20835254431:web:e269fbf2b5a8c7cfa362aa',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const daysAgo = (n) => Timestamp.fromDate(new Date(Date.now() - n * 86400000));

// ─── MAINTENANCE REQUESTS ────────────────────────────────────────────────────
const maintenanceRequests = [
  { id: 'mr-001', residentName: 'Mouli',    residentEmail: 'mouli@student.edu',    rollNumber: '21CS001', roomNumber: '101', floor: 1, category: 'Electrical', issue: 'Fan not working properly',           priority: 'high',   status: 'pending',    createdAt: daysAgo(1)  },
  { id: 'mr-002', residentName: 'Dhaya',    residentEmail: 'dhaya@student.edu',    rollNumber: '21CS002', roomNumber: '102', floor: 1, category: 'Plumbing',   issue: 'Water leaking from tap',             priority: 'high',   status: 'inProgress', createdAt: daysAgo(3), assignedTo: 'Rajan (Technician)' },
  { id: 'mr-003', residentName: 'Nitihish', residentEmail: 'nitihish@student.edu', rollNumber: '21CS003', roomNumber: '103', floor: 1, category: 'Electrical', issue: 'Power socket not working',           priority: 'medium', status: 'resolved',   createdAt: daysAgo(7), resolvedAt: daysAgo(5) },
  { id: 'mr-004', residentName: 'Karthik',  residentEmail: 'karthik@student.edu',  rollNumber: '21CS004', roomNumber: '104', floor: 1, category: 'Furniture',  issue: 'Cupboard door broken',               priority: 'low',    status: 'pending',    createdAt: daysAgo(2)  },
];

// ─── OUTING REQUESTS ─────────────────────────────────────────────────────────
const outingRequests = [
  { id: 'or-001', residentName: 'Mouli',    residentEmail: 'mouli@student.edu',    rollNumber: '21CS001', roomNumber: '101', reason: 'Family function at home',        destination: 'Chennai',     outDate: '2026-08-05', returnDate: '2026-08-07', status: 'approved',  createdAt: daysAgo(3) },
  { id: 'or-002', residentName: 'Dhaya',    residentEmail: 'dhaya@student.edu',    rollNumber: '21CS002', roomNumber: '102', reason: 'Medical appointment',            destination: 'Coimbatore',  outDate: '2026-08-02', returnDate: '2026-08-02', status: 'approved',  createdAt: daysAgo(2) },
  { id: 'or-003', residentName: 'Nitihish', residentEmail: 'nitihish@student.edu', rollNumber: '21CS003', roomNumber: '103', reason: 'College hackathon event',        destination: 'Bangalore',   outDate: '2026-08-10', returnDate: '2026-08-12', status: 'pending',   createdAt: daysAgo(1) },
  { id: 'or-004', residentName: 'Karthik',  residentEmail: 'karthik@student.edu',  rollNumber: '21CS004', roomNumber: '104', reason: 'Weekend trip with family',       destination: 'Ooty',        outDate: '2026-08-08', returnDate: '2026-08-09', status: 'rejected',  createdAt: daysAgo(4), rejectReason: 'Exams upcoming' },
];

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
const announcements = [
  { id: 'ann-001', title: 'Water Supply Interruption',           body: 'Water supply will be interrupted on 3rd August from 9 AM to 2 PM for pipe maintenance work. Please store water accordingly.', priority: 'high',   postedBy: 'Warden', createdAt: daysAgo(0) },
  { id: 'ann-002', title: 'Monthly Room Inspection – August',    body: 'Monthly room inspection will be conducted on 5th August. Ensure your rooms are clean and all belongings are properly arranged.', priority: 'medium', postedBy: 'Warden', createdAt: daysAgo(2) },
  { id: 'ann-003', title: 'Mess Timings Updated',                body: 'Mess timings have been updated. Breakfast: 7:00–9:00 AM, Lunch: 12:00–2:00 PM, Dinner: 7:00–9:00 PM. Late entry will not be allowed.', priority: 'low',    postedBy: 'Warden', createdAt: daysAgo(5) },
];

// ─── BOOKING GROUPS (sample approved + pending) ───────────────────────────────
const bookingGroups = [
  { id: 'bg-001', roomId: 'room-101', roomNumber: '101', leaderId: 'demo-mouli',    leaderRoll: '21CS001', memberRollNumbers: [],           status: 'approved', createdAt: daysAgo(20) },
  { id: 'bg-002', roomId: 'room-102', roomNumber: '102', leaderId: 'demo-dhaya',    leaderRoll: '21CS002', memberRollNumbers: [],           status: 'approved', createdAt: daysAgo(15) },
  { id: 'bg-003', roomId: 'room-103', roomNumber: '103', leaderId: 'demo-nitihish', leaderRoll: '21CS003', memberRollNumbers: [],           status: 'pending',  createdAt: daysAgo(1) },
  { id: 'bg-004', roomId: 'room-104', roomNumber: '104', leaderId: 'demo-karthik',  leaderRoll: '21CS004', memberRollNumbers: [],           status: 'pending',  createdAt: daysAgo(0) },
];

async function clearCollection(name) {
  console.log(`Clearing ${name}...`);
  const snapshot = await getDocs(collection(db, name));
  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, name, docSnap.id));
    count++;
  }
  console.log(`  ✓ Deleted ${count} items`);
}

async function seedCollection(name, items) {
  await clearCollection(name);
  console.log(`\nSeeding ${items.length} ${name}...`);
  for (const item of items) {
    const { id, ...data } = item;
    await setDoc(doc(collection(db, name), id), data);
    console.log(`  ✓ ${id}`);
  }
}

async function main() {
  await seedCollection('maintenanceRequests', maintenanceRequests);
  await seedCollection('outingRequests', outingRequests);
  await seedCollection('announcements', announcements);
  await seedCollection('bookingGroups', bookingGroups);
  console.log('\n✅ All data seeded successfully!');
  process.exit(0);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
