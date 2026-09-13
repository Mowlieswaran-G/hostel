const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'hostel_management',
} = process.env;

async function init() {
  console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  
  // 1. Connect without database first to ensure database exists
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  });

  try {
    console.log(`Creating database '${DB_NAME}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    // 2. Create tables
    console.log('Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(128) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NULL,
        \`role\` ENUM('resident', 'warden', 'technician') NOT NULL DEFAULT 'resident',
        \`roll_number\` VARCHAR(100) NULL,
        \`phone\` VARCHAR(50) NULL,
        \`room_number\` VARCHAR(50) NULL,
        \`floor\` INT NULL,
        \`hostel\` VARCHAR(100) DEFAULT 'Main Hostel Block',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Rooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`rooms\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`room_number\` VARCHAR(50) UNIQUE NOT NULL,
        \`block\` VARCHAR(50) NOT NULL,
        \`floor\` INT NOT NULL DEFAULT 1,
        \`capacity\` INT NOT NULL DEFAULT 4,
        \`occupied_beds\` INT NOT NULL DEFAULT 0,
        \`type\` VARCHAR(50) DEFAULT 'Standard',
        \`gender\` VARCHAR(20) DEFAULT 'Co-ed',
        \`price_per_semester\` INT DEFAULT 25000,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Booking groups table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`booking_groups\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`room_id\` VARCHAR(64) NOT NULL,
        \`room_number\` VARCHAR(50) NOT NULL,
        \`leader_id\` VARCHAR(128) NOT NULL,
        \`leader_roll\` VARCHAR(100) NULL,
        \`member_roll_numbers\` JSON NULL,
        \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        \`rejection_reason\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Maintenance requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`maintenance_requests\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`user_id\` VARCHAR(128) NULL,
        \`resident_name\` VARCHAR(255) NULL,
        \`resident_email\` VARCHAR(255) NULL,
        \`roll_number\` VARCHAR(100) NULL,
        \`room_number\` VARCHAR(50) NOT NULL,
        \`floor\` INT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`issue\` TEXT NOT NULL,
        \`priority\` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        \`status\` ENUM('pending', 'inProgress', 'resolved') NOT NULL DEFAULT 'pending',
        \`assigned_to\` VARCHAR(255) NULL,
        \`resolution_notes\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`resolved_at\` TIMESTAMP NULL
      ) ENGINE=InnoDB;
    `);

    // Outing requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`outing_requests\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`user_id\` VARCHAR(128) NULL,
        \`resident_name\` VARCHAR(255) NOT NULL,
        \`resident_email\` VARCHAR(255) NULL,
        \`roll_number\` VARCHAR(100) NULL,
        \`room_number\` VARCHAR(50) NULL,
        \`reason\` TEXT NOT NULL,
        \`destination\` VARCHAR(255) NOT NULL,
        \`out_date\` VARCHAR(50) NOT NULL,
        \`return_date\` VARCHAR(50) NOT NULL,
        \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Announcements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`announcements\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`priority\` ENUM('normal', 'important', 'urgent') NOT NULL DEFAULT 'normal',
        \`author\` VARCHAR(255) DEFAULT 'Hostel Warden',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Seed Initial Demo Users
    console.log('Seeding demo users...');
    const users = [
      ['mock-warden', 'Warden Demo', 'warden@smarthostel.com', 'warden@123', 'warden', 'W-001', '9876543210', 'Admin Block', 1],
      ['mock-technician', 'Rajan (Technician)', 'technician@smarthostel.com', 'tech@123', 'technician', 'T-001', '9876543211', 'Workshop', 1],
      ['demo-student-1', 'Mowlie (Resident)', 'mowlie@student.edu', 'student@123', 'resident', '21CS001', '9876543212', '101', 1],
      ['demo-student-2', 'John Doe', 'john@student.edu', 'student@123', 'resident', '21CS002', '9876543213', '102', 1],
    ];

    for (const [id, name, email, password, role, roll, phone, room, floor] of users) {
      await connection.query(`
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`, \`roll_number\`, \`phone\`, \`room_number\`, \`floor\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`role\`=VALUES(\`role\`), \`roll_number\`=VALUES(\`roll_number\`);
      `, [id, name, email, password, role, roll, phone, room, floor]);
    }

    // 4. Seed Rooms if empty
    const [existingRooms] = await connection.query('SELECT COUNT(*) as count FROM `rooms`');
    if (existingRooms[0].count === 0) {
      console.log('Seeding initial rooms...');
      const sampleRooms = [
        ['room-101', '101', 'A Block', 1, 4, 2, 'Standard', 'Co-ed', 25000],
        ['room-102', '102', 'A Block', 1, 4, 4, 'Standard', 'Co-ed', 25000],
        ['room-103', '103', 'A Block', 1, 4, 1, 'Standard', 'Co-ed', 25000],
        ['room-201', '201', 'A Block', 2, 4, 0, 'Deluxe', 'Co-ed', 32000],
        ['room-202', '202', 'A Block', 2, 4, 3, 'Standard', 'Co-ed', 25000],
        ['room-203', '203', 'A Block', 2, 4, 2, 'Standard', 'Co-ed', 25000],
        ['room-301', '301', 'B Block', 3, 2, 1, 'Premium Single/Double', 'Boys', 40000],
        ['room-302', '302', 'B Block', 3, 2, 2, 'Premium Single/Double', 'Boys', 40000],
        ['room-401', '401', 'C Block', 4, 4, 0, 'Standard', 'Girls', 25000],
        ['room-402', '402', 'C Block', 4, 4, 2, 'Standard', 'Girls', 25000],
      ];

      for (const r of sampleRooms) {
        await connection.query(`
          INSERT INTO \`rooms\` (\`id\`, \`room_number\`, \`block\`, \`floor\`, \`capacity\`, \`occupied_beds\`, \`type\`, \`gender\`, \`price_per_semester\`)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, r);
      }
    }

    // 5. Seed Announcements if empty
    const [existingAnnounce] = await connection.query('SELECT COUNT(*) as count FROM `announcements`');
    if (existingAnnounce[0].count === 0) {
      console.log('Seeding announcements...');
      await connection.query(`
        INSERT INTO \`announcements\` (\`id\`, \`title\`, \`message\`, \`priority\`, \`author\`)
        VALUES 
        ('ann-1', 'Hostel Wi-Fi Maintenance', 'Scheduled maintenance on Saturday between 2 AM and 5 AM.', 'important', 'Hostel Warden'),
        ('ann-2', 'Mess Menu Feedback', 'Please submit your mess suggestions for the upcoming month by Friday.', 'normal', 'Mess Committee');
      `);
    }

    // 6. Seed Sample Maintenance Requests if empty
    const [existingMaint] = await connection.query('SELECT COUNT(*) as count FROM `maintenance_requests`');
    if (existingMaint[0].count === 0) {
      console.log('Seeding sample maintenance requests...');
      await connection.query(`
        INSERT INTO \`maintenance_requests\` (\`id\`, \`resident_name\`, \`resident_email\`, \`roll_number\`, \`room_number\`, \`floor\`, \`category\`, \`issue\`, \`priority\`, \`status\`, \`assigned_to\`)
        VALUES 
        ('maint-1', 'Mowlie (Resident)', 'mowlie@student.edu', '21CS001', '101', 1, 'Electrical', 'Ceiling fan making vibrating sound', 'medium', 'pending', NULL),
        ('maint-2', 'John Doe', 'john@student.edu', '21CS002', '102', 1, 'Plumbing', 'Bathroom tap is dripping continuously', 'low', 'inProgress', 'Rajan (Technician)');
      `);
    }

    // 7. Seed Sample Outing Requests if empty
    const [existingOutings] = await connection.query('SELECT COUNT(*) as count FROM `outing_requests`');
    if (existingOutings[0].count === 0) {
      console.log('Seeding sample outing requests...');
      await connection.query(`
        INSERT INTO \`outing_requests\` (\`id\`, \`resident_name\`, \`resident_email\`, \`roll_number\`, \`room_number\`, \`reason\`, \`destination\`, \`out_date\`, \`return_date\`, \`status\`)
        VALUES 
        ('out-1', 'Mowlie (Resident)', 'mowlie@student.edu', '21CS001', '101', 'Weekend family visit', 'Home / Coimbatore', '2026-09-15', '2026-09-17', 'approved'),
        ('out-2', 'Mowlie (Resident)', 'mowlie@student.edu', '21CS001', '101', 'Hackathon competition', 'IIT Madras Research Park', '2026-09-20', '2026-09-21', 'pending');
      `);
    }

    console.log('✅ Database and tables initialized successfully!');
  } finally {
    await connection.end();
  }
}

init().catch((err) => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
