const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const bookingsRoutes = require('./routes/bookings');
const maintenanceRoutes = require('./routes/maintenance');
const outingRoutes = require('./routes/outing');
const technicianRoutes = require('./routes/technician');
const announcementsRoutes = require('./routes/announcements');

// Mount under both /api/... and root /... for maximum compatibility
const routeConfigs = [
  { path: 'auth', router: authRoutes },
  { path: 'rooms', router: roomsRoutes },
  { path: 'bookings', router: bookingsRoutes },
  { path: 'maintenance', router: maintenanceRoutes },
  { path: 'outing', router: outingRoutes },
  { path: 'technician', router: technicianRoutes },
  { path: 'announcements', router: announcementsRoutes },
];

for (const { path, router } of routeConfigs) {
  app.use(`/${path}`, router);
  app.use(`/api/${path}`, router);
}

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SmartHostel MySQL backend is running',
    database: process.env.DB_NAME || 'hostel_management' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
