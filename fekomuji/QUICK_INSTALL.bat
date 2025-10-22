@echo off
echo Installing QR Code Dependencies...
cd /d "c:\xampp\htdocs\Komuji\fekomuji"
npm install qrcode qrcode.react @types/qrcode @types/qrcode.react
echo.
echo Dependencies installed successfully!
echo Now you can use real QR codes instead of placeholders.
pause
