import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from './src/screens/PhoneLoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import OrdersListScreen from './src/screens/OrdersListScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import FareScreen from './src/screens/FareScreen';
import WaitingForDriverScreen from './src/screens/WaitingForDriverScreen';
import DriverTrackingScreen from './src/screens/DriverTrackingScreen';

export type RootStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: { phoneNumber: string };
  Home: undefined;
  Booking: {
    serviceType: string;
    serviceTitle: string;
    loadType: string;
    city: string;
  };
  Fare: {
    bookingData: {
      vendor_id: string;
      pickup_location: string;
      drop_location: string;
      load_type: string;
      load_weight_kg: number;
    };
  };
  WaitingForDriver: {
    bookingData: {
      vendor_id: string;
      pickup_location: string;
      drop_location: string;
      load_type: string;
      load_weight_kg: number;
      fare: number;
    };
  };
  DriverTracking: {
    bookingId: string;
    driver: {
      id: string;
      name: string;
      phone: string;
      vehicle_number: string;
      vehicle_type: string;
    };
    bookingData: {
      pickup_location: string;
      drop_location: string;
      fare: number;
    };
  };
  OrdersList: undefined;
  OrderDetail: {
    orderId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PhoneLogin"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a237e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Phone Login Screen - Initial screen */}
        <Stack.Screen 
          name="PhoneLogin" 
          component={PhoneLoginScreen}
          options={{ headerShown: false }}
        />
        
        {/* OTP Verification Screen */}
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
          options={{ headerShown: false }}
        />
        
        {/* Home Screen - Landing page */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        
        {/* Booking Screen - Order form */}
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{ headerShown: false }}
        />
        
        {/* Orders List Screen - All orders */}
        <Stack.Screen 
          name="OrdersList" 
          component={OrdersListScreen}
          options={{ headerShown: false }}
        />
        
        {/* Fare Screen - Set booking fare */}
        <Stack.Screen 
          name="Fare" 
          component={FareScreen}
          options={{ headerShown: false }}
        />
        
        {/* Waiting For Driver Screen - Finding driver */}
        <Stack.Screen 
          name="WaitingForDriver" 
          component={WaitingForDriverScreen}
          options={{ headerShown: false }}
        />
        
        {/* Driver Tracking Screen - Live GPS tracking */}
        <Stack.Screen 
          name="DriverTracking" 
          component={DriverTrackingScreen}
          options={{ headerShown: false }}
        />
        
        {/* Order Detail Screen - Single order details */}
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
