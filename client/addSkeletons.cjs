const fs = require('fs');

const files = [
  'src/pages/Resident/MaintenanceRequest.jsx',
  'src/pages/Resident/OutingRequest.jsx',
  'src/pages/Resident/ResidentDashboard.jsx',
  'src/pages/Warden/MaintenanceMgmt.jsx',
  'src/pages/Warden/OutingApproval.jsx',
  'src/pages/Warden/BookingApproval.jsx',
  'src/pages/Technician/TechnicianDashboard.jsx',
  'src/pages/Technician/HeatmapPage.jsx',
  'src/pages/Resident/RoomBooking.jsx',
  'src/pages/Resident/MyBookings.jsx',
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  const original = c;

  // Add Skeleton import if Loading text exists and Skeleton not already imported
  if (!c.includes('Skeleton') && c.includes('Loading')) {
    c = c.replace(
      "import Navbar from '../../components/Navbar';",
      "import Navbar from '../../components/Navbar';\nimport Skeleton from '../../components/Skeleton';"
    );
  }

  // Replace inline loading divs with Skeleton — simple string match
  const loadingPatterns = [
    'py-12 text-[color:var(--text-muted)]">Loading...<',
    'py-12 text-[color:var(--text-muted)]">Loading bookings...<',
    'py-12 text-[color:var(--text-muted)]">Loading tasks...<',
    'py-12 text-[color:var(--text-muted)]">Loading rooms...<',
    'py-16 text-[color:var(--text-muted)]">Loading heatmap...<',
  ];

  // Replace each pattern
  c = c.replace(/<div className="text-center py-12 text-\[color:var\(--text-muted\)\]">Loading\.\.\.<\/div>/g, '<Skeleton rows={6} />');
  c = c.replace(/<div className="text-center py-12 text-\[color:var\(--text-muted\)\]">Loading bookings\.\.\.<\/div>/g, '<Skeleton rows={6} />');
  c = c.replace(/<div className="text-center py-12 text-\[color:var\(--text-muted\)\]">Loading tasks\.\.\.<\/div>/g, '<Skeleton rows={6} />');
  c = c.replace(/<div className="text-center py-12 text-\[color:var\(--text-muted\)\]">Loading rooms\.\.\.<\/div>/g, '<Skeleton rows={6} />');
  c = c.replace(/<div className="text-center py-16 text-\[color:var\(--text-muted\)\]">Loading heatmap\.\.\.<\/div>/g, '<Skeleton rows={8} />');

  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log('Updated: ' + file);
  } else {
    console.log('No change: ' + file);
  }
});
