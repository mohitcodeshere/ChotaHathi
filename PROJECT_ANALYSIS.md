# Project Analysis: ChotaHathi

## 1. Code Structure

The project is structured as a monorepo containing three main components:

-   `backend/`: Node.js backend using Express and Socket.io.
-   `mobile/`: Customer-facing mobile application built with React Native (Expo) and TypeScript.
-   `driver-app/`: Driver-facing mobile application built with React Native (Expo) and TypeScript.

### Tech Stack
-   **Backend**: Node.js, Express, MongoDB, Socket.io, Mongoose (ODM).
-   **Frontend (Mobile & Driver App)**: React Native (Expo), TypeScript, Axios, Socket.io Client.
-   **Maps/Location**: `react-native-maps`, `expo-location`.

## 2. Backend Architecture

### Overview
The backend is a Node.js application running an Express server integrated with Socket.io for real-time communication. It connects to a MongoDB database using Mongoose.

### Key Components
-   **Server**: `backend/server.js` initializes the Express app and Socket.io server. It handles socket connections and routes API requests.
-   **Database**: Uses Mongoose schemas (`Order`, `User`) to interact with MongoDB.
-   **Real-Time**: Socket.io manages real-time events for driver availability, booking creation, acceptance, and location tracking.
-   **Authentication**: Phone number-based OTP authentication is implemented (logged to console for dev, optional Twilio integration).

### Limitations
-   **In-Memory State**: Active bookings, trips, and online drivers are currently stored in-memory (Javascript `Map` objects). This means state is lost on server restart, making it unsuitable for production without a persistent store like Redis or database integration for this state.
-   **Missing Endpoints**: The driver app expects several endpoints (e.g., specific booking actions, earnings, profile management) that are not yet implemented in the backend routes.

## 3. UI/Frontend Overview

### Mobile App (Customer)
-   **Purpose**: Allows customers to book vehicles for goods transportation.
-   **Key Flows**: Login (OTP) -> Home -> Book Vehicle -> Track Driver -> Order History.
-   **Implementation**: Uses functional components with hooks. Communication with backend via Axios (REST) and Socket.io (Real-time updates).

### Driver App
-   **Purpose**: Allows drivers to receive booking requests, manage active trips, and track earnings.
-   **Key Flows**: Login (OTP) -> Home (Wait for orders) -> Accept/Reject Order -> Active Trip Management -> Profile.
-   **Gap**: The API service in the driver app includes calls for features like earnings, rating, and detailed profile management that are not yet supported by the backend.

## 4. Design Philosophy

-   **Style**: "Porter-style" logistics app focusing on utility and clarity.
-   **Color Palette**: Primarily Blue (`#1a237e`, `#2563eb`) and White (`#ffffff`), with success/error indicators (Green/Red).
-   **UX**: Emphasis on map-based interaction and clear status updates for bookings.

## 5. Project Status

**Current Phase**: Active Development / Prototyping.

-   The core booking flow (Customer creates booking -> Driver accepts) is implemented using Socket.io.
-   Basic authentication works.
-   The project is in a functional prototype stage where the happy path works, but robustness and completeness are lacking.
-   There is a significant gap between the driver app's expected API surface and the actual backend implementation.

## 6. Future Roadmap

### Immediate Goals
-   **Backend Alignment**: Implement missing API endpoints required by the driver app (e.g., `GET /api/bookings/available`, `POST /api/bookings/:id/accept`).
-   **Persistence**: Move in-memory state (active trips, online drivers) to a persistent store (Redis or MongoDB) to handle server restarts and scaling.
-   **Driver Matching**: Implement a robust driver matching algorithm (e.g., geospatial queries to find nearest drivers) instead of broadcasting to all.

### Long-Term Goals
-   **Payments**: Integrate a payment gateway (e.g., Razorpay, Stripe).
-   **Push Notifications**: Implement push notifications for offline updates.
-   **Driver Ratings**: Add a rating system for drivers and customers.
-   **Scaling**: Optimize database queries and socket handling for high load.
