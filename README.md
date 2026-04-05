# 🧠 SignBuddy – Learning App for Deaf & Mute

## 📌 Overview
SignBuddy is a web-based application designed to help deaf and mute individuals communicate and learn sign language effectively. The system integrates AI-based sign recognition, voice-to-text conversion, and structured learning modules to provide an inclusive and interactive platform.

---

## 🚀 Features
- 📚 Sign language learning modules (alphabets, numbers, words)
- 🎤 Voice-to-text conversion for normal users
- 🤖 AI-based sign recognition and translation
- 📊 User progress tracking
- 👤 User profiles (Normal / Handicap)
- 🧑‍💻 Admin dashboard for user management

---

## 🛠 Tech Stack

### Frontend
- Angular

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### AI Model
- Python (Flask, OpenCV, Ultralytics YOLO)

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```
git clone https://github.com/Project-Pinmaster/Learning-App-for-Deaf-Mute.git
cd Learning-App-for-Deaf-Mute
```

---

### 2. Run Frontend
```
cd Frontend
npm install
ng serve
```

Open:
http://localhost:4200

---

### 3. Run Backend
```
cd Backend
npm install
node server.js
```

Runs on:
http://localhost:5000

---

### 4. Run AI Model
```
cd "Ai Model"
pip install -r requirements.txt
python app.py
```

---

## 🔗 API Endpoints

### Authentication
- POST /api/auth/register  
- POST /api/auth/login  

### Progress
- GET /api/progress/:userId  

## 📦 Folder Structure
```
Learning-App-for-Deaf-Mute/
│
├── Frontend/
├── Backend/
├── Ai Model/
├── docs/
└── README.md
```

---

## ⚠️ Requirements
- Node.js (v18+ recommended)
- Python (3.9+)
- MongoDB installed and running

---

## 🎯 Objective
To bridge the communication gap between deaf/mute individuals and the general population while promoting sign language learning through an interactive and accessible platform.

---

## 👥 Team
Dweep Bariya
Aditya Chaudhari
Saptarishi Maurya
Heiyam Pinky Chanu
---

## 📄 License
This project is for academic purposes.
