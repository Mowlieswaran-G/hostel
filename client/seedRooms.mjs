// seedRooms.mjs - Populates Firestore 'rooms' collection with sample hostel data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

const capacities = [1, 2, 2, 3, 3, 2, 3, 1, 2, 3];
const amenitiesList = [
  ['AC', 'WiFi', 'Attached Bathroom'],
  ['WiFi', 'Shared Bathroom'],
  ['AC', 'WiFi', 'Balcony', 'Attached Bathroom'],
  ['WiFi', 'Shared Bathroom', 'Fan'],
  ['AC', 'WiFi', 'Attached Bathroom', 'Study Table'],
];

const rooms = [];
for (let floor = 1; floor <= 3; floor++) {
  for (let roomNum = 1; roomNum <= 10; roomNum++) {
    const cap = capacities[roomNum - 1];
    const occ = Math.floor(Math.random() * (cap + 1));
    const ams = amenitiesList[(roomNum + floor) % amenitiesList.length];

    rooms.push({
      roomNumber: `${floor}${String(roomNum).padStart(2, '0')}`,
      floor,
      capacity: cap,
      occupiedBeds: occ,
      type: cap === 1 ? 'Single' : cap === 2 ? 'Double' : 'Triple',
      amenities: ams,
      block: floor === 1 ? 'A' : floor === 2 ? 'B' : 'C',
      monthlyRent: cap === 1 ? 8000 : cap === 2 ? 6000 : 5000,
    });
  }
}

async function seed() {
  console.log(`Seeding ${rooms.length} rooms...`);
  for (const room of rooms) {
    const roomId = `room-${room.roomNumber}`;
    await setDoc(doc(collection(db, 'rooms'), roomId), room);
    console.log(`  Room ${room.roomNumber} | Floor ${room.floor} | ${room.type} | ${room.occupiedBeds}/${room.capacity}`);
  }
  console.log('\nAll rooms seeded!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
