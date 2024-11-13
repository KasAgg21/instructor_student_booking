# Instructor-Student Booking System

Welcome to the **Instructor-Student Booking System**, a comprehensive web application designed to facilitate seamless scheduling between instructors and students. This platform allows instructors to manage their availability and students to book appointments efficiently. Built with modern technologies, it ensures real-time updates, secure authentication, and an intuitive user experience.

## Features

### For Instructors

- **Manage Availability:**
  - **One-Time Availability:** Set specific dates and time slots.
  - **Recurring Availability:** Define availability based on days of the week.
- **Edit/Delete Availability:** Modify or remove existing availability entries.
- **View Bookings:**
  - Access a dashboard displaying all upcoming bookings.
  - View details such as student information, purpose, and prerequisites.

### For Students

- **Browse Instructors:**
  - View a list of available instructors with their profiles.
- **View Availability:**
  - See instructors' availability on an interactive calendar.
- **Book Appointments:**
  - Select desired time slots and provide necessary details.
  - Receive confirmation upon successful booking.
- **Manage Bookings:**
  - View, cancel, or reschedule existing appointments.

### General

- **Secure Authentication:**
  - Role-based access control for instructors and students.
- **Real-Time Updates:**
  - Instant reflection of availability and bookings without page refreshes.
- **Responsive Design:**
  - Optimized for desktops, tablets, and mobile devices.

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/) - JavaScript library for building user interfaces.
  - [React Router](https://reactrouter.com/) - Declarative routing for React.
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
  - [React Calendar](https://github.com/wojtekmaj/react-calendar) - Interactive calendar component.
  - [Axios](https://axios-http.com/) - Promise-based HTTP client.

- **Backend:**
  - [Node.js](https://nodejs.org/) - JavaScript runtime.
  - [Express.js](https://expressjs.com/) - Web framework for Node.js.
  - [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) - Server-side Firebase integration.
  - [CORS](https://github.com/expressjs/cors) - Middleware for enabling CORS.
  - [Firebase Realtime Database](https://firebase.google.com/docs/database) - NoSQL cloud database.

- **Authentication & Authorization:**
  - [Firebase Authentication](https://firebase.google.com/docs/auth) - User authentication services.

## Installation

Follow the steps below to set up and run the project locally.

### Prerequisites

- **Node.js & npm:** Ensure you have [Node.js](https://nodejs.org/en/download/) and npm installed.
- **Firebase Account:** Create a [Firebase](https://firebase.google.com/) account to set up authentication and Realtime Database.

### Backend Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/instructor-student-booking-system.git
   cd instructor-student-booking-system/backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `backend` directory and add the following variables:

   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   ```

   - **FIREBASE_PRIVATE_KEY:** Ensure that newline characters (`\n`) are correctly formatted. Wrap the key in quotes if it contains special characters.

4. **Initialize Firebase Admin SDK:**

   Ensure that the Firebase service account JSON is correctly referenced in your backend code. Typically, the credentials are passed via environment variables as shown above.

5. **Start the Backend Server:**

   ```bash
   npm start
   ```

   The server should be running at `http://localhost:5000`.

### Frontend Setup

1. **Navigate to Frontend Directory:**

   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `frontend` directory and add the following variables:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   REACT_APP_FIREBASE_DATABASE_URL=your-firebase-database-url
   REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
   ```

   - **Note:** Ensure that all Firebase configuration details match those of your Firebase project.

4. **Start the Frontend Development Server:**

   ```bash
   npm start
   ```

   The application should be accessible at `http://localhost:3000`.
