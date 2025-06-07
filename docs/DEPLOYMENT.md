# DEPLOYMENT.md

## Initial Setup
1. Flash Raspberry Pi OS
2. Set up SSH and Wi-Fi
3. Install Node.js, PM2, Git, etc.
4. Clone the app repo: `git clone https://github.com/your/repo.git`
5. Install dependencies: `npm install` in frontend and backend

## Running Services
- Use PM2 or systemd to manage:
  - `my-app/backend/index.js`
  - `ota-server/index.js`

## Access
- UI: `http://pi.local:3000`
- OTA API: `http://pi.local:3000/api/update`
