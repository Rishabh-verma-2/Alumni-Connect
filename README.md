# 🎓 Alumni Connect

> **Bridging the gap between Students and Alumni.**  
> A comprehensive platform for networking, mentorship, and career growth.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Rishabh-verma-2/Alumni-Connect)

## 🚀 Overview

**Alumni Connect** is a full-stack web application designed to foster a strong community between a university's alumni and its current students. It solves the problem of disconnected networks by providing a centralized hub for mentorship, job opportunities, sharing achievements, and real-time communication.

## ✨ Key Features

*   **👥 Role-Based Access:** Dedicated dashboards for **Students**, **Alumni**, and **Admins**.
*   **🎨 Modern UI/UX:** "Premium Light" glassmorphism aesthetic with responsive design using Tailwind CSS.
*   **🤝 Networking:** Send connection requests, follow profiles, and view detailed stats.
*   **💬 Real-Time Chat:** Instant messaging between students and alumni powered by **Socket.io**.
*   **💼 Job Portal:** Alumni can post jobs/internships; Students can apply directly.
*   **📅 Events & Webinars:** Register for upcoming meetups and alumni talks.
*   **🔐 Secure Authentication:** JWT-based auth with secure cookie handling.
*   **🔍 Directory:** Advanced search to find alumni by company, year, or branch.

## 🛠️ Tech Stack

### Frontend
*   **React.js** (Vite)
*   **Tailwind CSS** (Styling)
*   **Lucide React** (Icons)
*   **Double Glazing** (Glassmorphism Effects)
*   **React Router DOM** (Navigation)
*   **Axios** (API Client)

### Backend
*   **Node.js & Express.js** (Server)
*   **MongoDB** (Database)
*   **Mongoose** (ODM)
*   **Socket.io** (Real-time Communication)
*   **Cloudinary** (Image Storage)
*   **JWT & Bcrypt** (Security)

## 📦 Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local or Atlas URL)
*   Cloudinary Account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/Rishabh-verma-2/Alumni-Connect.git
cd Alumni-Connect
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```
> The server will run on `http://localhost:5001`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd Frontend
npm install
```

Start the React development server:
```bash
npm run dev
```
> The application will open at `http://localhost:5173`.

## 📁 Project Structure

```
Alumni-Connect/
├── Backend/             # Express Server & API logic
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   └── server.js    # Entry point
│   └── ...
├── Frontend/            # React Application
│   ├── src/
│   │   ├── api/         # Axios setup
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Global state (Auth, Sidebar)
│   │   ├── Student/     # Student-specific pages
│   │   ├── Alumni/      # Alumni-specific pages
│   │   └── App.jsx      # Main routing
│   └── ...
└── README.md            # You are here
```

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---
*Built with ❤️ by Rishabh Verma*
