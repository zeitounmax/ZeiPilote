@echo off
setlocal enabledelayedexpansion

:: Function to print with icons (through echo)
:print_step
set "type=%~1"
set "message=%~2"
if "%type%"=="check" echo 🔍 %message%
if "%type%"=="success" echo ✅ %message%
if "%type%"=="error" echo ❌ %message%
if "%type%"=="install" echo 📦 %message%
if "%type%"=="run" echo 🚀 %message%
if "%type%"=="browser" echo 🌐 %message%
exit /b

:: Check if Node.js is installed
call :print_step "check" "Checking if Node.js is installed..."
where node >nul 2>&1
if %errorlevel% neq 0 (
    call :print_step "error" "Node.js n'est pas installe!"
    call :print_step "error" "Merci d'installer NodeJs a partir de https://nodejs.org/"
    pause
    exit /b 1
)
for /f "tokens=1,*" %%a in ('node -v') do (
    call :print_step "success" "Node.js is installed (%%a)"
)

:: Check if npm is installed
call :print_step "check" "Renifle si Npm est installe..."
where npm >nul 2>&1
if %errorlevel% neq 0 (
    call :print_step "error" "npm n'est pas installe...!"
    pause
    exit /b 1
)
for /f "tokens=1,*" %%a in ('npm -v') do (
    call :print_step "success" "npm est installe good dog! (%%a)"
)

:: Check if node_modules exists
call :print_step "check" "Regarde si les dependances..."
if not exist "node_modules\" (
    call :print_step "install" "Installation des dependances..."
    npm install
    if %errorlevel% neq 0 (
        call :print_step "error" "Installation des dependances echecs!"
        pause
        exit /b 1
    )
    call :print_step "success" "Installation des dependances Valides!"
) else (
    call :print_step "success" "Tes Dependances sont deja valides"
)

:: Run the development server
call :print_step "run" "Lancement du serveur de production..."
start "" npm run dev

:: Wait a bit for the server to start
timeout /t 5 /nobreak >nul

:: Open the browser
call :print_step "browser" "On ouvre le navigateur web..."
start "" http://localhost:3000

:: Keep the window open
pause >nul
