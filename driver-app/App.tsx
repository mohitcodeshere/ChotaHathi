import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from './src/screens/PhoneLoginScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import ActiveOrderScreen from './src/screens/ActiveOrderScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export type RootStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: { phoneNumber: string };
  Home: undefined;
  BookingDetail: {
    booking: {
      id: string;
      pickup_location: string;
      drop_location: string;
      load_type: string;
      fare: number;
      customer_name: string;
      customer_phone: string;
      distance: string;
      created_at: string;
    };
  };
  ActiveOrder: {
    order: {
      id: string;
      pickup_location: string;
      drop_location: string;
      load_type: string;
      fare: number;
      customer_name: string;
      customer_phone: string;
      status: string;
    };
  };
  Profile: undefined;
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
        <Stack.Screen 
          name="PhoneLogin" 
          component={PhoneLoginScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="BookingDetail" 
          component={BookingDetailScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="ActiveOrder" 
          component={ActiveOrderScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
