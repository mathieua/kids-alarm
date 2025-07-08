#!/bin/bash

# Install required packages
sudo apt-get update
sudo apt-get install -y chromium-browser unclutter

# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Create autostart entry for the application
cat > ~/.config/autostart/kids-alarm.desktop << EOL
[Desktop Entry]
Type=Application
Name=Kids Alarm
Exec=chromium-browser --kiosk --app=http://localhost:3000
Terminal=false
X-GNOME-Autostart-enabled=true
EOL

# Create autostart entry for unclutter (hides mouse cursor)
cat > ~/.config/autostart/unclutter.desktop << EOL
[Desktop Entry]
Type=Application
Name=Unclutter
Exec=unclutter -idle 0
Terminal=false
X-GNOME-Autostart-enabled=true
EOL

# Copy and enable the systemd service
sudo cp /home/mathieua/kids-alarm/config/kids-alarm.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable kids-alarm.service

# Disable screen blanking
sudo bash -c 'cat > /etc/xdg/lxsession/LXDE-pi/autostart << EOL
@xset s off
@xset -dpms
@xset s noblank
EOL'

echo "Kiosk mode setup complete. Please reboot your Raspberry Pi." 