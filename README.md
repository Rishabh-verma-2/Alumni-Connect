# 🎓 Alumni Connect

> **Bridging the gap between Campus and Career.**  
> A next-generation platform empowering students and alumni to connect, simple mentor-mentee interaction, and foster professional growth.

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61DAFB.svg?logo=react)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg?logo=node.js)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248.svg?logo=mongodb)
![Status](https://img.shields.io/badge/status-Active-success.svg)

[**View Demo**](#) · [**Report Bug**](https://github.com/Rishabh-verma-2/Alumni-Connect/issues) · [**Request Feature**](https://github.com/Rishabh-verma-2/Alumni-Connect/issues)

</div>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

**Alumni Connect** is a full-stack web application designed to dissolve the barriers between a university's alumni network and its current student body. 

In many institutions, valuable alumni connections remain untapped. This platform provides a centralized, dedicated space for:
*   **Mentorship:** Allowing students to find guidance from industry professionals.
*   **Networking:** Building professional relationships that last beyond graduation.
*   **Career Growth:** Exclusive job postings and internship opportunities.
*   **Community:** Sharing achievements, memories, and arranging meetups.

Built with a **MERN stack**, it emphasizes a modern, responsive, and "premium" user experience.

---

## ✨ Key Features

### 🔐 Authentication & Roles
*   **Secure Access:** JWT-based authentication with encrypted cookies.
*   **Role-Based Dashboards:** Custom tailored experiences for **Students**, **Alumni**, **Admins**, and **Faculty**.
*   **Profile Management:** Rich profiles with work history, education, and skills.

### 🤝 Networking & Social
*   **Smart Connections:** Send and manage connection requests similar to LinkedIn.
*   **Real-Time Chat:** Instant messaging powered by **Socket.io** for seamless communication.
*   **Community Feed:** Share updates, achievements, and photos with the network. Includes **Edit/Delete** posts and **Like/Comment** functionality.
*   **Alumni Directory:** Advanced search filters (Company, Year, Branch) to find the right mentor.

### 💼 Career & Growth
*   **Job Portal:** dedicated section for Alumni to post openings and Students to apply.
*   **Mentorship Requests:** Formal flow for requesting mentorship from alumni.
*   **Events Calendar:** RSVP for webinars, reunions, and workshops.

### 🎨 Modern UI/UX
*   **Glassmorphism Design:** A sleek, modern aesthetic using transparency and blur effects.
*   **Responsive:** Fully optimized for Mobile, Tablet, and Desktop.
*   **Interactive:** Smooth animations using `framer-motion`.

---

## 🛠 Technology Stack

### Frontend
| Tech | Description |
| --- | --- |
| **React.js** | Component-based UI library (Vite build tool) |
| **Tailwind CSS** | Utility-first CSS framework for rapid styling |
| **Framer Motion** | Production-ready animation library |
| **Lucide React** | Beautiful, consistent icon set |
| **Axios** | Promise-based HTTP client |

### Backend
| Tech | Description |
| --- | --- |
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Fast, unopinionated web framework |
| **MongoDB** | NoSQL database for flexible data storage |
| **Mongoose** | ODM for MongoDB schema validation |
| **Socket.io** | Bidirectional real-time event-based communication |
| **Cloudinary** | Cloud storage for image and video assets |

---

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
*   [Cloudinary](https://cloudinary.com/) Account (Free tier works)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Rishabh-verma-2/Alumni-Connect.git
    cd Alumni-Connect
    ```

2.  **Backend Configuration**
    Navigate to the `backend` folder and install dependencies:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in `backend/` with the following credentials:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_random_string
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    CLIENT_URL=http://localhost:5173
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Frontend Configuration**
    Open a new terminal, navigate to `frontend`, and install dependencies:
    ```bash
    cd frontend
    npm install
    ```
    Start the React app:
    ```bash
    npm run dev
    ```

The app should now be live at `http://localhost:5173`!

---

## 📁 Project Structure

```bash
Alumni-Connect/
├── Backend/                 # Server-side logic
│   ├── src/
│   │   ├── controllers/     # Route logic & responses
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoint definitions
│   │   ├── middlewares/     # Auth & Error handling
│   │   └── server.js        # App entry point
│   └── ...
├── Frontend/                # Client-side application
│   ├── src/
│   │   ├── api/             # Centralized API calls
│   │   ├── components/      # Shared UI components
│   │   ├── context/         # Auth & Global State providers
│   │   ├── Student/         # Pages for Student role
│   │   ├── Alumni/          # Pages for Alumni role
│   │   └── ...
│   └── ...
└── README.md                # Project documentation
```

---

## 📸 Screenshots

*(Add your screenshots here)*

| Student Dashboard | Alumni Profile |
|:---:|:---:|
| <img src="https://via.placeholder.com/400x200?text=Dashboard+View" alt="Dashboard" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Profile+View" alt="Profile" width="100%"> |

| Community Feed | Chat Interface |
|:---:|:---:|
| <img src="https://via.placeholder.com/400x200?text=Feed+View" alt="Feed" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Chat+View" alt="Chat" width="100%"> |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by <b>Rishabh Verma</b></p>
  <p>
    <a href="https://github.com/Rishabh-verma-2">GitHub</a> · 
    <a href="https://linkedin.com/in/rishabh-verma">LinkedIn</a>
  </p>
</div>
