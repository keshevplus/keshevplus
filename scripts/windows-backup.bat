@echo off
setlocal

:: Set the date and time for the filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%
set second=%datetime:~12,2%

:: Set the backup filename
set BACKUP_FILENAME=C:\KESHEVPLUS\prod\neondb_backup_%year%-%month%-%day%_%hour%-%minute%-%second%.sql

:: Create the backup directory if it doesn't exist
if not exist C:\KESHEVPLUS\prod mkdir C:\KESHEVPLUS\prod

:: Database connection info
set PGHOST=ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech
set PGUSER=neondb_owner
set PGDATABASE=neondb
set PGPASSWORD=npg_tYJvA94QMXLK

echo Starting database backup...
echo Saving to: %BACKUP_FILENAME%

:: Check if pg_dump is available (requires PostgreSQL client tools)
where pg_dump >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: pg_dump not found. Please install PostgreSQL client tools.
    echo You can download from: https://www.postgresql.org/download/windows/
    goto :EOF
)

:: Run the backup
pg_dump -h %PGHOST% -U %PGUSER% -d %PGDATABASE% --no-owner --no-acl -f "%BACKUP_FILENAME%"

if %ERRORLEVEL% equ 0 (
    echo Backup completed successfully!
    echo File saved to: %BACKUP_FILENAME%
    
    :: Get file size
    for %%A in ("%BACKUP_FILENAME%") do set filesize=%%~zA
    set /a filesizekb=%filesize% / 1024
    set /a filesizemb=%filesizekb% / 1024
    
    echo Backup size: %filesizemb% MB (%filesizekb% KB)
) else (
    echo Backup failed with error code: %ERRORLEVEL%
)

echo.
echo Recent backups:
dir /b /o-d C:\KESHEVPLUS\prod\neondb_backup_*.sql | findstr /B /C:"neondb_backup_" 2>nul

endlocal
