<div align="center">

# 🎯 Lost & Found - University IoT Solution

### *Reconnecting Students with Their Lost Items*

[![Made with React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-IoT-C51A4A?logo=raspberry-pi)](https://www.raspberrypi.org/)
[![MariaDB](https://img.shields.io/badge/MariaDB-Database-003545?logo=mariadb)](https://mariadb.org/)

[About](#-about-the-project) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation)

---

> **Note:** This repository contains a restored copy of the project files from the original repository which is no longer accessible.

</div>

---

## 📖 About The Project

**Lost & Found** is an innovative IoT-integrated web platform designed to solve a common problem at our university: **the lengthy and often unsuccessful process of recovering lost items.**

Every day, students lose valuable items around campus—phones, wallets, keys, notebooks, and more. The traditional lost-and-found system is slow, disorganized, and often leads to items never being reunited with their owners. 

### 💡 Our Solution

We've created a comprehensive system that combines:
- 🌐 **Web Platform**: Easy-to-use interface for reporting and searching lost items
- 🤖 **IoT Integration**: Raspberry Pi powered RFID system for instant item identification
- 📱 **Real-time Notifications**: WhatsApp integration to alert users when items are found
- 🎮 **Gamification**: Point system to encourage community participation

---

## ✨ Features

### 🔍 For Item Seekers
- **Quick Reporting**: Report lost items with detailed descriptions and location
- **Smart Search**: Find lost items by category, location, or date
- **Real-time Alerts**: Get notified instantly when your item is found
- **Digital Tracking**: Track the status of your lost items

### 🎁 For Good Samaritans
- **Easy Registration**: Register found items quickly with photo upload
- **RFID Integration**: Use our IoT stations to scan and register items automatically
- **Rewards System**: Earn points for helping fellow students
- **Leaderboard**: See top contributors to the community

### 🏫 For Campus Management
- **Dashboard Analytics**: Monitor lost items statistics
- **Location Mapping**: Identify high-loss areas on campus
- **User Management**: Oversee registered users and items
- **Report Generation**: Generate insights for campus security

---

## 🛠 Tech Stack

### Frontend
- **React.js** - Dynamic user interface
- **React Router** - Seamless navigation
- **Axios** - API communication
- **CSS3** - Modern responsive design

### Backend
- **Node.js + Express** - RESTful API server
- **JWT** - Secure authentication
- **bcrypt** - Password encryption
- **MariaDB** - Relational database
- **CORS** - Cross-origin resource sharing

### IoT Layer
- **Raspberry Pi** - Main IoT controller
- **RFID RC522** - Item identification
- **LCD Display 16x2** - User feedback
- **GPIO LEDs** - Status indicators
- **Python** - Hardware control scripts

### Third-party Services
- **Twilio API** - WhatsApp notifications

---

## 📋 Prerequisites

- **Node.js** (v14 or higher) & npm
- **Python 3** (for Raspberry Pi scripts)
- **MariaDB**
- **Git**

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/lost-and-found.git
cd lost-and-found
```

### 2️⃣ Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306

# Twilio (WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Server
PORT=3001
HOST=localhost

# URLs
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=http://localhost:3000
```

### 3️⃣ Database Setup

Install and configure MariaDB, then create your database and tables according to your needs.

### 4️⃣ Backend Setup

```bash
cd server

# Install dependencies
npm install
pip install -r requirements.txt

# Start server
node server.js
```

Server runs at `http://localhost:3001`

### 5️⃣ Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at `http://localhost:3000`

---

## 🎮 Usage

### Web Platform

1. **Register** with your university credentials
2. **Report lost items** with descriptions and location
3. **Search found items** in the catalog
4. **Receive notifications** when items are found

### IoT Station

1. Approach a Lost & Found kiosk on campus
2. Place item near the RFID reader
3. Scan your student ID card
4. Follow LCD screen instructions

---

## 📦 Project Structure

```
lost-and-found/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
│
├── server/             # Backend & IoT
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── main.py        # RFID registration
│   ├── check.py       # RFID verification
│   └── server.js
│
├── whatsapp-api/      # Twilio integration
├── .env.example       # Environment template
└── .gitignore
```


