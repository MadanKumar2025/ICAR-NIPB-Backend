// import express from "express";
// import { execFile } from "child_process";
// import path from "path";
// import fs from "fs";

// const router = express.Router();

// const MONGO_URI = process.env.MONGO_URI;

// // MongoDB mongodump.exe path
// const MONGODUMP_PATH = path.join(
//   "C:",
//   "mongodb-tools",
//   "bin",
//   "mongodump.exe"
// );

// // Windows Downloads folder
// const BACKUP_DIR = path.join(
//   process.env.USERPROFILE,
//   "Downloads",
//   "MongoDB-Backups"
// );

// // Create Downloads/MongoDB-Backups if it doesn't exist
// if (!fs.existsSync(BACKUP_DIR)) {
//   fs.mkdirSync(BACKUP_DIR, { recursive: true });
// }

// router.post("/backup", (req, res) => {
//   if (!MONGO_URI) {
//     return res.status(500).json({
//       success: false,
//       message: "MONGO_URI is not configured in .env",
//     });
//   }

//   // Check mongodump.exe
//   if (!fs.existsSync(MONGODUMP_PATH)) {
//     return res.status(500).json({
//       success: false,
//       message: "mongodump.exe not found",
//       path: MONGODUMP_PATH,
//     });
//   }

//   const timestamp = new Date()
//     .toISOString()
//     .replace(/[:.]/g, "-");

//   const backupFile = path.join(
//     BACKUP_DIR,
//     `mongodb-backup-${timestamp}.archive.gz`
//   );

//   const args = [
//     `--uri=${MONGO_URI}`,
//     `--archive=${backupFile}`,
//     "--gzip",
//   ];

//   // console.log("=================================");
//   // console.log("MongoDB backup started...");
//   // console.log("mongodump:", MONGODUMP_PATH);
//   // console.log("Backup location:", backupFile);
//   // console.log("=================================");

//   execFile(MONGODUMP_PATH, args, (error, stdout, stderr) => {
//     if (error) {
//       console.error("MongoDB backup failed");
//       console.error(error);
//       console.error(stderr);

//       return res.status(500).json({
//         success: false,
//         message: "MongoDB backup failed",
//         error: error.message,
//         stderr,
//       });
//     }

//     console.log("MongoDB backup completed successfully");

//     return res.status(200).json({
//       success: true,
//       message: "MongoDB backup created successfully",
//       file: path.basename(backupFile),
//       location: BACKUP_DIR,
//     });
//   });
// });

// export default router;

import express from "express";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import cron from "node-cron";

const router = express.Router();

const MONGO_URI = process.env.MONGO_URI;

// MongoDB mongodump.exe path
const MONGODUMP_PATH = path.join(
  "C:",
  "mongodb-tools",
  "bin",
  "mongodump.exe"
);

// Windows Downloads folder
const BACKUP_DIR = path.join(
  process.env.USERPROFILE,
  "Downloads",
  "MongoDB-Backups"
);

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// --------------------------------------------------
// MongoDB Backup Function
// --------------------------------------------------

const createMongoBackup = () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not configured in .env");
    return;
  }

  // Check mongodump.exe
  if (!fs.existsSync(MONGODUMP_PATH)) {
    console.error("mongodump.exe not found:");
    console.error(MONGODUMP_PATH);
    return;
  }

  // Get current day name
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date());

  // Example:
  // Monday.archive.gz
  // Tuesday.archive.gz
  // Wednesday.archive.gz
  const backupFile = path.join(
    BACKUP_DIR,
    `${dayName}.archive.gz`
  );

  // console.log("=================================");
  // console.log("MongoDB backup started...");
  // console.log("Day:", dayName);
  // console.log("mongodump:", MONGODUMP_PATH);
  // console.log("Backup location:", backupFile);
  // console.log("=================================");

  // Delete previous backup for this day
  if (fs.existsSync(backupFile)) {
    try {
      fs.unlinkSync(backupFile);
      // console.log(`Old ${dayName} backup deleted.`);
    } catch (deleteError) {
      console.error("Failed to delete old backup:");
      console.error(deleteError);
      return;
    }
  }

  const args = [
    `--uri=${MONGO_URI}`,
    `--archive=${backupFile}`,
    "--gzip",
  ];

  execFile(
    MONGODUMP_PATH,
    args,
    (error, stdout, stderr) => {
      if (error) {
        console.error("MongoDB backup failed");
        console.error(error);
        console.error(stderr);

        return;
      }

      console.log("MongoDB backup completed successfully");
      console.log(`Backup saved as: ${dayName}.archive.gz`);
      console.log(`Location: ${backupFile}`);
    }
  );
};

// --------------------------------------------------
// Automatic Backup
// --------------------------------------------------

// Every day at 12:00 AM
cron.schedule(
  // "0 0 * * *",
   "00 11 * * *",
  () => {
    console.log("Automatic MongoDB backup triggered...");
    createMongoBackup();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

// --------------------------------------------------
// Manual Backup API
// --------------------------------------------------

router.post("/backup", (req, res) => {
  if (!MONGO_URI) {
    return res.status(500).json({
      success: false,
      message: "MONGO_URI is not configured in .env",
    });
  }

  if (!fs.existsSync(MONGODUMP_PATH)) {
    return res.status(500).json({
      success: false,
      message: "mongodump.exe not found",
      path: MONGODUMP_PATH,
    });
  }

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date());

  const backupFile = path.join(
    BACKUP_DIR,
    `${dayName}.archive.gz`
  );

  // Delete old backup for this day
  if (fs.existsSync(backupFile)) {
    try {
      fs.unlinkSync(backupFile);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Could not delete old backup",
        error: error.message,
      });
    }
  }

  const args = [
    `--uri=${MONGO_URI}`,
    `--archive=${backupFile}`,
    "--gzip",
  ];

  execFile(
    MONGODUMP_PATH,
    args,
    (error, stdout, stderr) => {
      if (error) {
        console.error("MongoDB backup failed");
        console.error(error);
        console.error(stderr);

        return res.status(500).json({
          success: false,
          message: "MongoDB backup failed",
          error: error.message,
          stderr,
        });
      }

      return res.status(200).json({
        success: true,
        message: "MongoDB backup created successfully",
        day: dayName,
        file: `${dayName}.archive.gz`,
        location: BACKUP_DIR,
      });
    }
  );
});

export default router;
