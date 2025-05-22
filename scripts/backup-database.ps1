# PowerShell script to backup NeonDB database

# Database connection parameters
$DB_HOST = "ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech"
$DB_USER = "neondb_owner"
$DB_NAME = "neondb"
$DB_PASSWORD = "npg_tYJvA94QMXLK"

# Create timestamp for filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "C:\KESHEVPLUS\prod"
$backupFile = "$backupDir\neondb_backup_$timestamp.sql"

# Ensure backup directory exists
if (-not (Test-Path $backupDir)) {
    Write-Host "Creating backup directory: $backupDir"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host "Starting database backup..."
Write-Host "Target file: $backupFile"

# Create temporary environment variables for the pg_dump command
$env:PGPASSWORD = $DB_PASSWORD

try {
    # Check if pg_dump exists in PATH
    $pgDumpExists = Get-Command "pg_dump" -ErrorAction SilentlyContinue
    
    if (-not $pgDumpExists) {
        Write-Host "ERROR: pg_dump not found in PATH. Please install PostgreSQL client tools." -ForegroundColor Red
        Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        exit 1
    }
    
    # Execute pg_dump
    $startTime = Get-Date
    pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --no-owner --no-acl -f $backupFile
    $endTime = Get-Date
    
    # Check if backup file was created successfully
    if (Test-Path $backupFile) {
        $fileInfo = Get-Item $backupFile
        $fileSizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
        $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "File: $backupFile"
        Write-Host "Size: $fileSizeMB MB ($fileSizeKB KB)"
        Write-Host "Duration: $duration seconds"
        
        # List recent backups
        Write-Host ""
        Write-Host "Recent backups:" -ForegroundColor Cyan
        Get-ChildItem -Path $backupDir -Filter "neondb_backup_*.sql" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 5 | 
            ForEach-Object {
                $size = [math]::Round($_.Length / 1MB, 2)
                Write-Host "- $($_.Name) ($size MB) - $($_.LastWriteTime)"
            }
        
        # Calculate total space used by backups
        $allBackups = Get-ChildItem -Path $backupDir -Filter "neondb_backup_*.sql"
        $totalSize = ($allBackups | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host ""
        Write-Host "Total backups: $($allBackups.Count) ($('{0:N2}' -f $totalSize) MB)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Backup failed - output file not created" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during backup:" -ForegroundColor Red
    Write-Host $_.Exception.Message
} finally {
    # Clear the password from environment
    $env:PGPASSWORD = ""
}

# Instructions for scheduling
Write-Host ""
Write-Host "To schedule automatic backups every 2 hours:" -ForegroundColor Yellow
Write-Host "1. Open Task Scheduler"
Write-Host "2. Create a Basic Task"
Write-Host "3. Set trigger to 'Daily' and recur every 2 hours"
Write-Host "4. Action: Start a program"
Write-Host "5. Program/script: powershell.exe"
Write-Host "6. Arguments: -ExecutionPolicy Bypass -File $($MyInvocation.MyCommand.Path)"
