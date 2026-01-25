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

### 1. Porter-Style HomeScreen Redesign

**File:** `mobile/src/screens/HomeScreen.tsx`

**Features:**
- Curved blue header with gradient effect
- GPS-enabled pickup location card with Plus Code display
- Vehicle selection cards (Chota Hathi 🚛, Truck 🚚)
- Live deliveries ticker showing real-time driver activity
- Auto-scrolling animation (3-second interval)

**Key Code:**
```typescript
// Live Deliveries Ticker Data
const driverDeliveries = [
  { id: '1', driver: 'Rajesh Kumar', from: 'Dharamshala', to: 'Kangra', vehicle: '🚛' },
  { id: '2', driver: 'Vikram Singh', from: 'Palampur', to: 'Nagrota', vehicle: '🚚' },
  { id: '3', driver: 'Amit Thakur', from: 'McLeod Ganj', to: 'Gaggal', vehicle: '🚛' },
  // ... more entries
];
```

---

### 2. BookingScreen with Load Type Selection

**File:** `mobile/src/screens/BookingScreen.tsx`

**Features:**
- Blue themed header with vehicle icon
- Route indicator with green/red dots and connecting line
- Location picker integration with GPS
- Load type chips based on vehicle type
- Navigates to Fare screen on confirm

**Load Type Options:**
| Vehicle Type | Load Options |
|--------------|--------------|
| Chota Hathi | Furniture, Construction Items, Electronics, Other |
| Truck | Steel/Iron, Marvels/Tiles, Cement, Ply Wood, Other |

**Key Code:**
```typescript
const loadTypeOptions = serviceType === 'chota-hathi' 
  ? ['Furniture', 'Construction Items', 'Electronics', 'Other']
  : ['Steel/Iron', 'Marvels/Tiles', 'Cement', 'Ply Wood', 'Other'];
```

---

### 3. GPS Location Picker with Search

**File:** `mobile/src/components/LocationPickerGPS.tsx`

**Features:**
- Full-screen map with single 📍 emoji marker
- Search box in header with suggestions dropdown
- Pre-defined Kangra region locations
- Plus Code generation from coordinates
- Geocoding search via expo-location

**Kangra Locations Database:**
```typescript
const kangraLocations = [
  { name: 'Dharamshala Bus Stand', area: 'Dharamshala', coords: { latitude: 32.2190, longitude: 76.3234 } },
  { name: 'Kangra Fort', area: 'Kangra', coords: { latitude: 32.0998, longitude: 76.2691 } },
  { name: 'HPCA Stadium', area: 'Dharamshala', coords: { latitude: 32.2262, longitude: 76.3199 } },
  { name: 'McLeod Ganj Main Square', area: 'McLeod Ganj', coords: { latitude: 32.2427, longitude: 76.3213 } },
  { name: 'Palampur Bus Stand', area: 'Palampur', coords: { latitude: 32.1109, longitude: 76.5363 } },
  // ... more locations
];
```

**Plus Code Algorithm:**
```typescript
const generatePlusCode = (latitude: number, longitude: number): string => {
  const chars = '23456789CFGHJMPQRVWX';
  // Grid-based encoding algorithm
  // Returns format: "MQ8M+WMH"
};
```

---

### 4. Fare Selection Screen (NEW)

**File:** `mobile/src/screens/FareScreen.tsx`

**Features:**
- Trip summary card with pickup/drop route display
- Fare adjustment with +/- buttons (₹50 steps)
- Quick fare selection chips (₹500, ₹600, ₹750, ₹1000)
- Minimum fare: ₹500
- Info tip about higher fare = faster matching
- Navigates to WaitingForDriver screen

**Key Code:**
```typescript
const [fare, setFare] = useState(500);
const MIN_FARE = 500;
const FARE_STEP = 50;

const quickFares = [500, 600, 750, 1000];
```

---

### 5. Waiting For Driver Screen (NEW)

**File:** `mobile/src/screens/WaitingForDriverScreen.tsx`

**Features:**
- Animated loader with pulse effect and spinning circle
- Truck emoji (🚛) in center
- "Searching for drivers..." animated text
- Driver notification counter
- Trip details card with fare offer
- Cancel search button with confirmation
- Auto-creates order after 5 seconds (simulating driver match)

**Animations:**
```typescript
// Pulse animation for outer circle
Animated.loop(
  Animated.sequence([
    Animated.timing(pulseAnim, { toValue: 1.2, duration: 800 }),
    Animated.timing(pulseAnim, { toValue: 1, duration: 800 }),
  ])
).start();

// Rotation animation for spinner
Animated.loop(
  Animated.timing(rotateAnim, { toValue: 1, duration: 2000 })
).start();
```

---

### 6. Navigation Configuration

**File:** `mobile/App.tsx`

**Route Structure:**
```typescript
export type RootStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: { phoneNumber: string };
  Home: undefined;
  Booking: { serviceType: string; serviceTitle: string; loadType: string; city: string };
  Fare: { bookingData: { vendor_id, pickup_location, drop_location, load_type, load_weight_kg } };
  WaitingForDriver: { bookingData: { ...fareData, fare: number } };
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};
```

**All screens use `headerShown: false` for custom headers.**

---

## 📂 File Structure

```
mobile/
├── App.tsx                          # Navigation setup
├── src/
│   ├── components/
│   │   ├── CitySelector.tsx
│   │   ├── HeroSection.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── LocationPickerGPS.tsx    # Map picker with search
│   │   ├── LocationPickerGPS.web.tsx
│   │   ├── OrderCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── tagline-front.tsx
│   │   └── VehicleType.tsx
│   ├── screens/
│   │   ├── BookingScreen.tsx        # Order form with load types
│   │   ├── HomeScreen.tsx           # Porter-style landing
│   │   ├── FareScreen.tsx           # NEW: Fare selection
│   │   ├── WaitingForDriverScreen.tsx # NEW: Driver search
│   │   ├── OrderDetailScreen.tsx
│   │   ├── OrdersListScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   └── PhoneLoginScreen.tsx
│   ├── services/
│   │   └── api.ts                   # API client
│   ├── constants/
│   │   └── config.ts
│   └── types/
│       └── navigation.ts
```

---

## 🔄 User Flow

```
┌─────────────────┐
│  PhoneLogin     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ OTPVerification │
└────────┬────────┘
         ▼
┌─────────────────┐
│   HomeScreen    │ ◄── Select vehicle (Chota Hathi/Truck)
└────────┬────────┘
         ▼
┌─────────────────┐
│ BookingScreen   │ ◄── Set pickup/drop, load type
└────────┬────────┘
         ▼
┌─────────────────┐
│   FareScreen    │ ◄── Set fare offer (₹500+)
└────────┬────────┘
         ▼
┌─────────────────────────┐
│ WaitingForDriverScreen  │ ◄── Animated search
└────────┬────────────────┘
         ▼
┌─────────────────┐
│  OrdersList     │ ◄── View all orders
└─────────────────┘
```

---

## 🛠️ API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | POST | Create new order |
| `/api/orders` | GET | List all orders |
| `/api/orders/:id` | GET | Get order details |
| `/api/auth/send-otp` | POST | Send OTP to phone |
| `/api/auth/verify-otp` | POST | Verify OTP |

---

## 📝 Recent Changes Log

| Date | Change | Files Modified |
|------|--------|----------------|
| Jan 22, 2026 | Created FareScreen for fare selection | `FareScreen.tsx`, `App.tsx` |
| Jan 22, 2026 | Created WaitingForDriverScreen with animations | `WaitingForDriverScreen.tsx`, `App.tsx` |
| Jan 22, 2026 | Updated BookingScreen to navigate to Fare | `BookingScreen.tsx` |
| Jan 22, 2026 | Added search box to LocationPickerGPS | `LocationPickerGPS.tsx` |
| Jan 22, 2026 | Added live deliveries ticker to HomeScreen | `HomeScreen.tsx` |
| Jan 22, 2026 | Added load type chips to BookingScreen | `BookingScreen.tsx` |
| Jan 22, 2026 | Changed theme to Porter-style blue | All screens |
| Jan 22, 2026 | Renamed Trucks to "Chota Hathi" | `HomeScreen.tsx` |

---

## 🚧 Pending / Future Work

- [ ] Real driver matching via WebSocket
- [ ] Payment integration
- [ ] Order tracking on map
- [ ] Push notifications
- [ ] Driver app
- [ ] Rating system
- [ ] Fare estimation based on distance

---

## 🏃 Running the Project

```bash
# Install dependencies
cd mobile
npm install

# Start Expo
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

---

## 👤 Author

**Mohit Kumar**  
Project: ChotaHathi Logistics App
