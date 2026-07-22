<div align="center">

# 📸 EFIS Photo Kiosk

**Offline Photo Booth & CR80 Card Printing Application**

A desktop-based photo kiosk application built with **Electron** for capturing photos using a webcam and printing them onto **CR80 cards** using a **Fargo Card Printer**.

Designed for self-service kiosks, exhibitions, visitor registration, employee cards, and event photo booths.

![Platform](https://img.shields.io/badge/Platform-Windows-blue)
![Electron](https://img.shields.io/badge/Electron-31.x-47848F)
![NodeJS](https://img.shields.io/badge/Node.js-20+-339933)
![License](https://img.shields.io/badge/License-Internal-red)

</div>

---

# Table of Contents

- Overview
- Features
- System Requirements
- Project Structure
- Installation
- Running Development Mode
- Building Production
- Offline Deployment
- Windows Kiosk Configuration
- Printer Configuration
- Changing Photo Template
- Application Flow
- Troubleshooting
- Future Roadmap
- License

---

# Overview

EFIS Photo Kiosk is an Electron-based desktop application developed for self-service photo kiosks.

The application captures photos from a webcam, places them into a predefined template, and prints them directly onto CR80 cards through a Fargo card printer.

The application is designed to work completely **offline**, making it suitable for environments with limited or no internet connection.

Typical use cases include:

- Employee ID Cards
- Visitor Cards
- Membership Cards
- Event Photo Booth
- School ID Cards
- Exhibition Registration

---

# Features

✅ Fullscreen Kiosk Interface

✅ Webcam Live Preview

✅ Photo Capture

✅ Photo Template Overlay

✅ CR80 Card Printing

✅ Offline Operation

✅ Electron Desktop Application

✅ Simple HTML, CSS & JavaScript Architecture

---

# System Requirements

## Hardware

- Windows 10 / Windows 11
- Intel Core i3 or higher
- 4 GB RAM minimum
- Webcam
- Mouse / Touchscreen
- Fargo Card Printer
- CR80 PVC Cards

---

## Software

- Node.js 20+
- npm
- Electron
- Fargo Printer Driver

---

# Project Structure

```
photo-kiosk
│
├── assets/
│   └── template.png
│
├── electron/
│   ├── main.js
│   └── preload.js
│
├── app.js
├── index.html
├── style.css
├── package.json
└── README.md
```

### Folder Description

| Folder | Description |
|----------|------------|
| assets | Image assets and photo templates |
| electron | Electron Main Process |
| app.js | Main application logic |
| index.html | Application UI |
| style.css | User Interface styling |

---

# Installation

Clone repository

```bash
git clone https://github.com/Agansulisfiana/Efis-kiosk-foto.git
```

Move into project

```bash
cd Efis-kiosk-foto
```

Install dependencies

```bash
npm install
```

---

# Running Development Mode

```bash
npm start
```

The Electron application will launch automatically.

---

# Building Production

Install Electron Builder

```bash
npm install --save-dev electron-builder
```

Example package.json

```json
"scripts": {
    "start": "electron .",
    "build": "electron-builder"
}
```

Build executable

```bash
npm run build
```

Output

```
dist/
```

The installer (.exe) will be generated inside the **dist** folder.

---

# Offline Deployment

The application is designed to operate without internet access.

Deployment steps:

1. Install Windows.

2. Install Fargo Printer Driver.

3. Install Webcam Driver (if required).

4. Install EFIS Photo Kiosk.

5. Configure Windows Auto Login.

6. Configure Startup Application.

7. Restart Windows.

The kiosk is now ready for operation.

---

# Windows Kiosk Configuration

## Disable Sleep Mode

Settings

```
Power Options
```

Configure

- Never Sleep
- Never Hibernate
- Never Turn Off Display

---

## Auto Login

Run

```
netplwiz
```

Disable

```
Users must enter a username and password...
```

Restart Windows.

---

## Auto Start Application

Press

```
Win + R
```

Type

```
shell:startup
```

Create a shortcut of the application inside this folder.

The application will automatically launch every time Windows starts.

---

## Hide Windows Cursor (Optional)

Suitable for touchscreen kiosks.

Third-party utilities may be used if the cursor should remain hidden during operation.

---

## Recommended Windows Settings

- Disable Windows Update during operation
- Disable Screen Saver
- Disable Notification Popups
- Disable Sleep Mode
- Auto Login Enabled
- Taskbar Auto Hide
- Fullscreen Mode Enabled

---

# Printer Configuration

Supported Card Size

```
CR80

85.60 mm × 53.98 mm
```

Supported Printer

- Fargo HDP5600
- Fargo DTC1250e
- Fargo DTC1500
- Fargo DTC4500e

Before using the application:

- Install the official Fargo printer driver.
- Verify the printer is detected in Windows.
- Perform a test print.

---

# Changing Photo Template

Default template location

```
assets/template.png
```

Replace the image with a new design while keeping the same filename.

Recommended format

```
PNG
Transparent Background
300 DPI
```

---

# Application Flow

```
Application Start

        │

        ▼

Camera Preview

        │

        ▼

Capture Photo

        │

        ▼

Merge With Template

        │

        ▼

Preview Result

        │

        ▼

Print CR80 Card

        │

        ▼

Ready For Next User
```

---

# Troubleshooting

## Camera Not Detected

- Verify webcam connection.
- Check Windows Camera permissions.
- Restart the application.

---

## Printer Not Found

- Reinstall Fargo Driver.
- Verify USB connection.
- Check Devices and Printers.

---

## Application Won't Start

Run

```bash
npm install
npm start
```

If the problem persists, delete

```
node_modules
```

then reinstall dependencies.

---

## Blank Printing

- Verify template exists.
- Check printer ribbon.
- Check CR80 card alignment.

---

# Future Roadmap

- Multiple Templates
- QR Code Support
- Barcode Support
- Face Detection
- Face Centering
- Touch Keyboard
- Admin Panel
- Event Configuration
- Print History
- Reprint Function
- Camera Settings
- Printer Settings
- Multi-language Support
- Automatic Updates

---

# Screenshots

```
docs/

home.png

capture.png

preview.png

print.png
```

Replace these placeholder images with actual application screenshots.

---

# License

This project is intended for internal use within EFIS.

Unauthorized distribution, modification, or commercial use without permission is prohibited.

---

<div align="center">

Developed with Electron for Windows Kiosk Systems

**EFIS Photo Kiosk**

</div>
