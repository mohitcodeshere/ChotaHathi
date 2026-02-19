# ChotaHathi

**Hyper-local logistics app for Kangra/Dharamshala**

> **Last Updated:** February 19, 2026
> **Platform:** React Native (Expo) + Node.js Backend
> **Status:** Active Development

---

## 📱 Project Overview

**ChotaHathi** is a Porter-style logistics and transportation mobile app for booking mini trucks (Chota Hathi) and trucks for goods transportation. The app serves the Kangra, Himachal Pradesh region.

The project consists of three main components:
1. **Mobile App (Customer)**: For users to book vehicles.
2. **Driver App**: For drivers to accept and manage bookings.
3. **Backend**: Node.js/Express server with Socket.io for real-time coordination.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile Frontend** | Expo ~54.0.31, React Native 0.81.5, TypeScript |
| **Driver App** | Expo ~54.0.31, React Native 0.77.1 |
| **Backend** | Node.js, Express 5.x, Socket.io |
| **Database** | MongoDB (Mongoose) |
| **Navigation** | @react-navigation/native-stack |
| **Maps** | react-native-maps (Google Provider) |
| **Location** | expo-location (GPS + Geocoding) |
| **Authentication** | Phone OTP (Custom implementation + Twilio optional) |

---

## 📂 Folder Structure

### `backend/`
Contains the Node.js/Express server and simple socket logic.
```
backend/
  config/db.js           # Database connection
  controllers/           # Request handlers
  middleware/            # Auth middleware
  models/                # Mongoose models (User, Order)
  routes/                # API routes
  server.js              # Entry point & Socket.io setup
```

### `driver-app/`
React Native Expo app for drivers.
```
driver-app/
  src/
    screens/             # Driver specific screens (HomeScreen, BookingDetail, etc.)
    services/            # API & Socket services
```

### `mobile/`
React Native Expo app for customers.
```
mobile/
  src/
    components/          # Reusable UI components
    screens/             # Customer screens (Booking, Orders, Tracking, etc.)
    services/            # API & Socket services
```

---

## 🚀 Features

- **Real-time Booking**: Customers can book vehicles and see drivers in real-time.
- **Driver Tracking**: Live location updates using Socket.io.
- **OTP Authentication**: Secure login via phone number.
- **Fare Calculation**: Automatic fare estimation based on distance/vehicle.
- **Responsive Design**: Polished UI/UX for mobile devices.

---

## 🎨 Design System

### Color Palette
| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Blue** | `#1a237e` | Headers, primary elements |
| **Action Blue** | `#2563eb` | Buttons, interactive elements |
| **Success Green** | `#22c55e` | Pickup markers, success states |
| **Error Red** | `#ef4444` | Drop markers, error states |
| **Background** | `#f5f7fa` | Screen backgrounds |
| **Card White** | `#ffffff` | Card backgrounds |

### Typography
- **Headers**: 700 weight, 20-24px
- **Body**: 400-600 weight, 13-16px
- **Captions**: 400 weight, 11-13px

---

## 🔌 API & Backend

### Backend Highlights
- **Socket.io Integration**: Routes can access `io` via `req.app.get('io')` or `app.set('io', io)`.
- **Resilience**: Server runs even if MongoDB fails (supports WebSocket-only testing).
- **In-Memory State**: Active bookings and driver locations are currently stored in memory (`Map` objects in `server.js`) for speed and simplicity during dev.

### Key Endpoints
**Auth**
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

**Orders**
- `POST /api/orders` (Create order)
- `GET /api/orders` (List pending)
- `GET /api/orders/:id` (Get details)

### Socket Events
- `driver:online` / `driver:offline`
- `booking:new` (Client -> Server -> Drivers)
- `booking:accept` (Driver -> Server -> Client)
- `driver:location` (Driver -> Server -> Client)
- `trip:status` (Updates: accepted -> arrived -> in_transit -> delivered)

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/chotahathi
JWT_SECRET=your_secret_key
PORT=5000
# Optional Twilio Config
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

---

## 🏃‍♂️ Getting Started

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Mobile App (Customer)
```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go or run on Emulator
```

### 3. Driver App
```bash
cd driver-app
npm install
npx expo start
```

---

## 🔮 Future Roadmap

- [ ] Persistent driver matching (Redis/DB)
- [ ] Payment gateway integration
- [ ] Push notifications (FCM)
- [ ] Advanced map routing and optimization
- [ ] Driver rating system

---

## 📞 Contact

**Project**: ChotaHathi Logistics App
