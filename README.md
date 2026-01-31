# ChotaHaathi
ChotaHathi - Hyper-local logistics app for Kangra/Dharamshala

Two Branches on Repo

Main - Original Work
Dev - all initial development work

# ChotaHathi - Project Development Summary

> **Last Updated:** January 22, 2026  
> **Platform:** React Native (Expo) + Node.js Backend  
> **Status:** Active Development

---

## 📱 Project Overview

**ChotaHathi** is a Porter-style logistics and transportation mobile app for booking mini trucks (Chota Hathi) and trucks for goods transportation. The app serves the Kangra, Himachal Pradesh region.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile Frontend | React Native (~54.0.31), Expo, TypeScript |
| Navigation | @react-navigation/native-stack |
| Maps | react-native-maps (Google Provider) |
| Location | expo-location (GPS + Geocoding) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | Phone OTP |

---

## 📂 Folder Structure

### backend/

```
backend/
  config/
    db.js
  controllers/
    AuthController.js
    orderController.js
  middleware/
    AuthMiddleware.js
  models/
    Order.js
    User.js
    Vehicle.js
  routes/
    AuthRoutes.js
    orderRoutes.js
  package.json
  server.js
```

### driver-app/

```
driver-app/
  app.json
  App.tsx
  index.js
  package.json
  tsconfig.json
  src/
    constants/
      config.ts
    screens/
      ActiveOrderScreen.tsx
      BookingDetailScreen.tsx
      HomeScreen.tsx
      OTPVerificationScreen.tsx
      PhoneLoginScreen.tsx
      ProfileScreen.tsx
    services/
      api.ts
      socket.ts
```
### mobile/

```
mobile/
  app.json
  App.tsx
  index.js
  package.json
  tsconfig.json
  assets/
  src/
    components/
      CitySelector.tsx
      HeroSection.tsx
      LoadingSpinner.tsx
      LocationPickerGPS.tsx
      LocationPickerGPS.web.tsx
      OrderCard.tsx
      ServiceCard.tsx
      tagline-front.tsx
      VehicleType.tsx
    constants/
      config.ts
    screens/
      BookingScreen.tsx
      DriverTrackingScreen.tsx
      FareScreen.tsx
      HomeScreen.tsx
      OrderDetailScreen.tsx
      OrdersListScreen.tsx
      OTPVerificationScreen.tsx
      PhoneLoginScreen.tsx
      WaitingForDriverScreen.tsx
    services/
      api.ts
      socket.ts
    types/
      navigation.ts
```


## 🎨 Design System

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | `#1a237e` | Headers, primary elements |
| Action Blue | `#2563eb` | Buttons, interactive elements |
| Success Green | `#22c55e` | Pickup markers, success states |
| Error Red | `#ef4444` | Drop markers, error states |
| Background | `#f5f7fa` | Screen backgrounds |
| Card White | `#ffffff` | Card backgrounds |

### Typography
- Headers: 700 weight, 20-24px
- Body: 400-600 weight, 13-16px
- Captions: 400 weight, 11-13px

---

## 🚀 Features Implemented

# ChotaHaathi
ChotaHathi - Hyper-local logistics app for Kangra/Dharamshala

Two Branches on Repo

Main - Original Work
Dev - all initial development work

# ChotaHathi - Project Development Summary

> **Last Updated:** January 31, 2026  
> **Platform:** React Native (Expo) + Node.js Backend  
> **Status:** Active Development

---

## 📱 Project Overview

**ChotaHathi** is a Porter-style logistics and transportation mobile app for booking mini trucks (Chota Hathi) and trucks for goods transportation. The app primarily targets the Kangra, Himachal Pradesh region.

### Tech Stack (from code)

| Layer | Technology |
|-------|------------|
| Mobile Frontend (mobile) | Expo ~54.0.31, React Native 0.81.5, TypeScript |
| Driver App (driver-app) | Expo ~54.0.31, React Native 0.77.1 |
| Navigation | @react-navigation/native, native-stack |
| Maps | react-native-maps |
| Location | expo-location |
| Backend | Node.js, Express 5.x, Socket.io |
| Database | MongoDB (optional at runtime) |
| Auth | Phone OTP (console + optional Twilio) |

---

## Backend highlights

- Express server with Socket.io integration (see `backend/server.js`).
- Server sets `app.set('io', io)` so routes can access Socket.io instance.
- MongoDB connection uses `process.env.MONGO_URI`. If the DB connection fails the server keeps running so WebSocket-only testing is possible.

---

## API Endpoints (quick reference)

Auth:
- POST `/api/auth/send-otp`  — Body: { phoneNumber }
- POST `/api/auth/verify-otp` — Body: { phoneNumber, otp }
- POST `/api/auth/resend-otp` — Body: { phoneNumber }

Orders:
- POST `/api/orders` — Create order. Body (JSON):
  {
    "vendor_id": "<userId>",
    "pickup_location": "<address or plus code>",
    "drop_location": "<address or plus code>",
    "load_type": "<one of load type strings>",
    "load_weight_kg": 120  // optional
  }
- GET `/api/orders` — List pending orders
- GET `/api/orders/:id` — Get order by id

Responses follow { success: boolean, ... } with orders containing fields from `backend/models/Order.js` (vendor_id, driver_id, pickup_location, drop_location, load_type, load_weight_kg, status, fare_amount, createdAt).

---

## Socket / WebSocket events

The server implements driver/customer coordination events. Important events (server-side names):
- `driver:online` (payload: driverId)
- `driver:offline` (driverId)
- `customer:join` (customerId)
- `booking:new` (booking object sent from customer)
- `bookings:list` (sent to newly connected drivers)
- `booking:confirmed` (sent to customer with bookingId and driversNotified)
- `booking:accept` (driver accepts booking)
- `booking:accepted` (broadcast to customer with driver info)
- `booking:taken` (notify other drivers)
- `booking:reject`, `booking:cancel` (cancellations)
- `driver:location` (driver sends location updates for an active trip)
- `trip:status` (driver updates status; server notifies customer)

The active booking/trip state is kept in-memory (see `server.js`): `onlineDrivers`, `activeBookings`, `activeTrips` maps. Note: this means state is ephemeral and will not survive server restart.

---

## Environment variables (backend)

Create `backend/.env` with at least the following when running in production-like mode:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret used in auth
- `TWILIO_ACCOUNT_SID` — (optional) Twilio SID for SMS
- `TWILIO_AUTH_TOKEN` — (optional) Twilio auth token
- `TWILIO_PHONE_NUMBER` — (optional) From number for Twilio SMS
- `PORT` — optional (defaults to 5000)

Notes:
- OTPs are always logged to the server console for development. Twilio is optional; the server will attempt SMS but will continue if SMS sending fails.

---

## Running the project (local quick start)

1) Backend API + Socket server

```powershell
cd backend
npm install
# create a .env file with the env vars above (MONGO_URI, JWT_SECRET, etc.)
# development with auto-reload:
npm run dev
# or production-like:
npm start
```

If MongoDB is not available the server will still run (useful for testing WebSocket flows). OTP codes will be printed to the console.

2) Mobile (customer) app

```powershell
cd mobile
npm install
npx expo start
# run on Android:
npx expo start --android
# run on iOS:
npx expo start --ios
```

3) Driver app (separate Expo app)

```powershell
cd driver-app
npm install
npx expo start
# run on device/emulator as above
```

---

## Models (high level)

- `User` (see `backend/models/User.js`): phoneNumber, name, role (vendor|driver|admin), isVerified, otp (object), lastLogin
- `Order` (see `backend/models/Order.js`): vendor_id, driver_id, pickup_location, drop_location, load_type, load_weight_kg, status, fare_amount, timestamps

Note: `backend/models/Vehicle.js` exists but is currently empty in the repository.

---

## Development notes & behaviour

- OTP workflow logs OTP to console and stores code on `User.otp` for verification. The server limits OTP attempts and expiry (5 minutes, 5 attempts).
- WebSocket booking flow: when a customer emits `booking:new`, the server stores it in `activeBookings` and broadcasts to the `drivers` room; drivers accept by emitting `booking:accept` which creates an `activeTrips` entry and notifies the customer.
- State is in-memory; consider adding Redis or persistent store for production.

---

## TODO / Future work

- Real driver matching with persistence
- Payment integration
- Push notifications
- Order tracking on map
- Driver rating system

---

## Contact / Author  
Project: ChotaHathi Logistics App
