
# YapChat 🚀  
A real-time chat application built for seamless conversations and intelligent summarization. YapChat empowers users with instant communication, media sharing, and AI-powered chat summaries — making chat history easier to revisit and understand.

---

## ✨ Features

- 🗨️ Real-time Messaging:  
  Instant, socket-powered messaging for smooth, lag-free communication.

- 🧠 Chat Summarization:  
  Gemini API integration to auto-generate crisp summaries of long conversations with a single click.

- 🖼️ Image Sharing:  
  Upload and send images in real-time using Cloudinary storage.

- 👥 User Authentication:  
  Secure login and sign-up flows with session management.

- 🌐 Persistent Chat History:  
  All conversations are saved and fetched using MongoDB for continuity.

- 📦 State Management with Zustand:  
  Lightweight and efficient client-side state management for a seamless UI experience.

- 💬 UI with DaisyUI & Tailwind CSS:  
  Fully responsive and clean user interface for desktop and mobile.

---

## 🛠️ Tech Stack

### Frontend:
- React.js  
- DaisyUI  
- Zustand (for global state management)  
- Socket.io-client  

### Backend:
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- Socket.io  
- Cloudinary (for image storage)  
- Gemini API (for summarization)

---

## 🔧 Setup Instructions

### 1. Clone the Repository

git clone https://github.com/ShreyaKhandekar12/Real-time-chat-app.git  
cd Real-time-chat-app

---

### 2. Set up the Backend

cd backend  
npm install

Create a `.env` file inside the `backend` folder and add the following:

PORT=5001  
MONGO_URI=your_mongodb_connection_string  
CLOUDINARY_CLOUD_NAME=your_cloud_name  
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret  
GEMINI_API_KEY=your_gemini_api_key

Start the backend server:

npm run dev

---

### 3. Set up the Frontend

cd ../frontend  
npm install

Start the frontend development server:

npm run dev

---

### 4. Access the App

Visit the app at:  
http://localhost:5173
