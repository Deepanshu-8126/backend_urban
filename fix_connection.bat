@echo off
echo ==========================================
echo      URBAN APP CONNECTION FIXER
echo ==========================================
echo.

echo [1/3] Locating ADB...
set ADB_PATH=adb
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    echo Found ADB at Default Location.
)

echo [2/3] Setting up Reverse Tunnel...
echo This allows your phone to access http://localhost:3000
%ADB_PATH% reverse tcp:3000 tcp:3000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] ADB Reverse Tunnel Established!
    echo Your phone can now access localhost:3000.
    echo.
) else (
    echo.
    echo [ERROR] Could not run adb reverse.
    echo Please make sure:
    echo  1. Your phone is connected via USB
    echo  2. USB Debugging is ON
    echo  3. You have accepted the PC authorization on your phone
    echo.
)

echo [3/3] Firewall Instruction
echo If you still have issues, you may need to allow Node.js through the firewall.
echo Run this command as Administrator if 192.168.1.18 still fails:
echo netsh advfirewall firewall add rule name="Allow Node 3000" dir=in action=allow protocol=TCP localport=3000
echo.
pause
