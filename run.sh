#!/bin/bash

# Function to print with icons
print_step() {
    case $1 in
        "check") echo "🔍 $2";;
        "success") echo "✅ $2";;
        "error") echo "❌ $2";;
        "install") echo "📦 $2";;
        "run") echo "🚀 $2";;
        "browser") echo "🌐 $2";;
    esac
}

# Check if Node.js is installed
print_step "check" "Renifle si Node.js est installé."
if ! command -v node &> /dev/null; then
    print_step "error" "Node.js n'est pas installé!"
    print_step "error" "Merci d'installer NodeJs a partir de https://nodejs.org/"
    exit 1
fi
print_step "success" "Node.js is installed ($(node -v))"

# Check if npm is installed
print_step "check" "Renifle si Npm est installé..."
if ! command -v npm &> /dev/null; then
    print_step "error" "npm n'est pas installé...!"
    exit 1
fi
print_step "success" "npm est installé good dog! ($(npm -v))"

# Check if node_modules exists
print_step "check" "Regarde si les dépendances..."
if [ ! -d "node_modules" ]; then
    print_step "install" "Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        print_step "error" "Installation des dépendances échecs!"
        exit 1
    fi
    print_step "success" "Installation des dépendances Validés!"
else
    print_step "success" "Tes Dépendances sont déjà validés"
fi

# Run the development server
print_step "run" "Lancement du serveur de production..."
npm run dev &

# Wait for the server to start (adjust sleep time if needed)
sleep 5

# Open the browser
print_step "browser" "On ouvre le navigateur web..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
else
    print_step "error" "Le navigateur web ne s'ouvre pas."
    print_step "info" "Tu vas devoir ouvrir http://localhost:3000 à la main."
fi

# Keep the script running
wait
