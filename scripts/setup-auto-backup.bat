@echo off
echo Setting up automatic database backup task...

:: Create logs directory if it doesn't exist
if not exist "..\logs" mkdir "..\logs"

:: Full path to Node.js executable
where node > temp.txt
set /p NODE_PATH=<temp.txt
del temp.txt

:: Full paths to script and log file
set "SCRIPT_PATH=%~dp0auto-backup-neon.js"
set "LOG_PATH=%~dp0..\logs\backup.log"

:: Create the scheduled task (runs every 2 hours)
echo Creating scheduled task "KeshevPlusDBBackup"...
schtasks /create /tn "KeshevPlusDBBackup" /tr "%NODE_PATH% "%SCRIPT_PATH%" >> "%LOG_PATH%" 2>&1" /sc hourly /mo 2 /st 00:00 /ru System /f

echo.
if %errorlevel% equ 0 (
    echo Automatic backup task created successfully!
    echo The database will be backed up every 2 hours and saved to the C:\KESHEVPLUS\prod directory.
    echo Log files will be written to: %LOG_PATH%
) else (
    echo Failed to create the scheduled task. Please run this script as administrator.
)

echo.
echo Press any key to exit...
pause > nul
