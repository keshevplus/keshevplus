import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database connection parameters from environment
const DB_HOST = 'ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech';
const DB_USER = 'neondb_owner';
const DB_NAME = 'neondb';
const DB_PASSWORD = 'npg_tYJvA94QMXLK';

// Backup storage directory (parent directory - ../prod)
const BACKUP_DIR = path.resolve(__dirname, '../../prod');

// Function to format the date as YYYY-MM-DD_HH-MM-SS
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Function to create the backup
async function createBackup() {
  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Generate backup filename with timestamp
    const timestamp = getFormattedDate();
    const backupFilename = path.join(BACKUP_DIR, `neondb_backup_${timestamp}.sql`);
    
    console.log(`Starting backup to ${backupFilename}...`);
    
    // Using pg_dump with environment variables to avoid password in command line
    const cmd = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} --no-owner --no-acl -F p > "${backupFilename}"`;
    
    // Execute the pg_dump command
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing backup: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`pg_dump stderr: ${stderr}`);
      }
      
      console.log(`✅ Backup successfully created at: ${backupFilename}`);
      
      // List recent backups
      listRecentBackups();
    });
  } catch (error) {
    console.error(`Backup failed: ${error.message}`);
  }
}

// Function to list recent backups
async function listRecentBackups() {
  try {
    // Get all files in the backup directory
    const files = await fs.readdir(BACKUP_DIR);
    
    // Filter for SQL backup files and sort by modification time (most recent first)
    const backupFiles = files.filter(file => file.startsWith('neondb_backup_') && file.endsWith('.sql'));
    
    if (backupFiles.length === 0) {
      console.log('No backups found.');
      return;
    }
    
    // Get file stats for each backup
    const fileStats = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        return { file, stats };
      })
    );
    
    // Sort by modification time (most recent first)
    fileStats.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
    
    // Display the 5 most recent backups
    console.log('\nRecent backups:');
    fileStats.slice(0, 5).forEach((fileStat, index) => {
      const sizeInMB = (fileStat.stats.size / (1024 * 1024)).toFixed(2);
      console.log(`${index + 1}. ${fileStat.file} (${sizeInMB} MB) - ${fileStat.stats.mtime.toLocaleString()}`);
    });
    
    // Display total count and disk usage
    const totalSizeInMB = fileStats.reduce((total, fileStat) => total + fileStat.stats.size, 0) / (1024 * 1024);
    console.log(`\nTotal backups: ${fileStats.length} (${totalSizeInMB.toFixed(2)} MB)`);
  } catch (error) {
    console.error(`Error listing backups: ${error.message}`);
  }
}

// Create a backup immediately when script is run
createBackup();

// Log that this is a manual run (when scheduled, this will be different)
console.log('\nThis is a manual backup. To schedule automatic backups every 2 hours:');
console.log('1. For Windows: Create a scheduled task using Task Scheduler');
console.log('2. For Linux/Mac: Add a crontab entry');
console.log('\nExample crontab entry (every 2 hours):');
console.log('0 */2 * * * cd /path/to/keshevplus && node scripts/auto-backup-neon.js >> logs/backup.log 2>&1');
