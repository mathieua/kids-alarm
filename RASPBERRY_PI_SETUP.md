# Raspberry Pi Setup Guide

This guide will help you set up and run the Kids Alarm application on a Raspberry Pi.

## Prerequisites

- Raspberry Pi (3 or 4 recommended)
- Raspberry Pi OS (latest version)
- Internet connection
- USB speakers or audio output
- (Optional) Display for testing

## System Setup

1. **Update System**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

2. **Install Required System Packages**
   ```bash
   # Install Node.js (LTS version)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install MPV for audio playback
   sudo apt-get install -y mpv

   # Install Git
   sudo apt-get install -y git
   ```

3. **Verify Installations**
   ```bash
   node --version  # Should show v20.x.x
   npm --version   # Should show 10.x.x
   mpv --version   # Should show MPV version
   ```

## Application Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/mathieua/kids-alarm.git
   cd kids-alarm
   ```

2. **Environment Setup**
   ```bash
   # Create .env file in backend directory
   cd backend
   cp .env.example .env  # If you have an example file
   # Or create .env manually with:
   # PORT=3001
   # OPENWEATHER_API_KEY=your_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Media Setup**
   ```bash
   # Create media directory
   mkdir -p media
   # Copy your media files (music, images) to this directory
   ```

## Running the Application

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Open a web browser on any device on your network
   - Navigate to `http://[raspberry-pi-ip]:5173`
   - The backend API will be available at `http://[raspberry-pi-ip]:3001`

## Running as a Service (Optional)

To run the application automatically on startup:

1. **Create Backend Service**
   ```bash
   sudo nano /etc/systemd/system/kids-alarm-backend.service
   ```
   Add the following content:
   ```ini
   [Unit]
   Description=Kids Alarm Backend
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/kids-alarm/backend
   ExecStart=/usr/bin/npm run dev
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. **Create Frontend Service**
   ```bash
   sudo nano /etc/systemd/system/kids-alarm-frontend.service
   ```
   Add the following content:
   ```ini
   [Unit]
   Description=Kids Alarm Frontend
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/kids-alarm/frontend
   ExecStart=/usr/bin/npm run dev
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and Start Services**
   ```bash
   sudo systemctl enable kids-alarm-backend
   sudo systemctl enable kids-alarm-frontend
   sudo systemctl start kids-alarm-backend
   sudo systemctl start kids-alarm-frontend
   ```

## Troubleshooting

1. **Audio Issues**
   - Check if MPV is installed: `mpv --version`
   - Verify audio output: `mpv --no-video test.mp3`
   - Check system volume: `alsamixer`

2. **Network Issues**
   - Find your Pi's IP: `hostname -I`
   - Check if ports are open: `sudo netstat -tulpn | grep LISTEN`
   - Verify firewall settings: `sudo ufw status`

3. **Service Issues**
   - Check service status: `sudo systemctl status kids-alarm-backend`
   - View logs: `journalctl -u kids-alarm-backend`

## Performance Optimization

1. **Node.js Memory Limit**
   ```bash
   # Add to /etc/systemd/system/kids-alarm-backend.service
   Environment=NODE_OPTIONS="--max-old-space-size=512"
   ```

2. **MPV Configuration**
   Create `~/.config/mpv/mpv.conf`:
   ```ini
   # Reduce CPU usage
   vo=null
   ao=alsa
   ```

## Security Considerations

1. **Firewall Setup**
   ```bash
   sudo ufw allow 3001  # Backend
   sudo ufw allow 5173  # Frontend
   ```

2. **Environment Variables**
   - Keep your `.env` file secure
   - Don't commit sensitive data
   - Use strong passwords

## Maintenance

1. **Update Application**
   ```bash
   cd kids-alarm
   git pull
   cd backend && npm install
   cd ../frontend && npm install
   sudo systemctl restart kids-alarm-backend
   sudo systemctl restart kids-alarm-frontend
   ```

2. **Backup**
   - Regularly backup your media files
   - Keep a copy of your `.env` file
   - Document any custom configurations

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the application logs
3. Check the GitHub repository for updates
4. Create an issue on GitHub if needed 