import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import OrdersListScreen from './src/screens/OrdersListScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Booking: {
    serviceType: string;
    serviceTitle: string;
    loadType: string;
    city: string;
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
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Home Screen - Landing page */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }} // Hide header for custom design
        />
        
        {/* Booking Screen - Order form */}
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{ title: 'Book Service' }}
        />
        
        {/* Orders List Screen - All orders */}
        <Stack.Screen 
          name="OrdersList" 
          component={OrdersListScreen}
          options={{ title: 'My Orders' }}
        />
        
        {/* Order Detail Screen - Single order details */}
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{ title: 'Order Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
