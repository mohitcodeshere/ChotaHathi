import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { orderAPI, OrderData } from '../services/api';
import { socketService } from '../services/socket';

type WaitingForDriverScreenProps = NativeStackScreenProps<RootStackParamList, 'WaitingForDriver'>;

export default function WaitingForDriverScreen({ route, navigation }: WaitingForDriverScreenProps): React.JSX.Element {
  const { bookingData } = route.params;
  const [searchingText, setSearchingText] = useState('Searching for drivers');
  const [driversFound, setDriversFound] = useState(0);
  const [bookingId] = useState(() => `BK${Date.now()}`);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Connect to socket and emit booking
    socketService.connect();
    
    // Emit the new booking to all online drivers
    socketService.emitNewBooking({
      id: bookingId,
      pickup_location: bookingData.pickup_location,
      drop_location: bookingData.drop_location,
      load_type: bookingData.load_type,
      fare: bookingData.fare,
      customer_name: 'Customer', // Would come from auth
      customer_phone: '9876543210', // Would come from auth
      vehicle_type: 'Chota Hathi',
    });

    // Listen for booking confirmation with driver count
    socketService.onBookingConfirmed((data) => {
      console.log('📦 Booking confirmed, drivers notified:', data.driversNotified);
      setDriversFound(data.driversNotified);
    });

    // Listen for driver accepting
    socketService.onBookingAccepted((data) => {
      if (data.bookingId === bookingId) {
        console.log('✅ Driver accepted:', data.driver);
        
        // Create order in background (don't block navigation)
        const orderData: OrderData = {
          vendor_id: bookingData.vendor_id,
          pickup_location: bookingData.pickup_location,
          drop_location: bookingData.drop_location,
          load_type: bookingData.load_type,
          load_weight_kg: bookingData.load_weight_kg,
        };
        orderAPI.createOrder(orderData).catch(err => console.log('Order save error:', err));
        
        // Navigate to live tracking screen immediately
        navigation.replace('DriverTracking', {
          bookingId,
          driver: {
            id: data.driver?.id || 'driver_001',
            name: data.driver?.name || 'Driver',
            phone: data.driver?.phone || '9876543210',
            vehicle_number: data.driver?.vehicle_number || 'HP-00-XX-0000',
            vehicle_type: data.driver?.vehicle_type || 'Chota Hathi',
          },
          bookingData: {
            pickup_location: bookingData.pickup_location,
            drop_location: bookingData.drop_location,
            fare: bookingData.fare,
          },
        });
      }
    });

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Simulate finding drivers text animation
    const textInterval = setInterval(() => {
      setSearchingText(prev => {
        if (prev === 'Searching for drivers...') return 'Searching for drivers';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(textInterval);
      socketService.offBookingAccepted();
      socketService.offBookingConfirmed();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Search?',
      'Are you sure you want to cancel searching for drivers?',
      [
        { text: 'Keep Searching', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive', 
          onPress: () => {
            socketService.cancelBooking(bookingId);
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finding Driver</Text>
      </View>

      <View style={styles.content}>
        {/* Animated Loader */}
        <View style={styles.loaderContainer}>
          <Animated.View 
            style={[
              styles.pulseCircle,
              { transform: [{ scale: pulseAnim }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.spinnerCircle,
              { transform: [{ rotate: spin }] }
            ]}
          >
            <View style={styles.spinnerDot} />
          </Animated.View>
          <View style={styles.truckContainer}>
            <Text style={styles.truckEmoji}>🚛</Text>
          </View>
        </View>

        <Text style={styles.searchingText}>{searchingText}</Text>
        
        {driversFound > 0 && (
          <View style={styles.driversFoundBadge}>
            <Text style={styles.driversFoundText}>
              {driversFound} driver{driversFound > 1 ? 's' : ''} notified nearby
            </Text>
          </View>
        )}

        {/* Trip Details Card */}
        <View style={styles.tripCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Your Offer</Text>
            <Text style={styles.fareValue}>₹{bookingData.fare}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.routeRow}>
            <View style={styles.dotGreen} />
            <Text style={styles.routeText} numberOfLines={1}>
              {bookingData.pickup_location}
            </Text>
          </View>
          <View style={styles.routeLineSmall} />
          <View style={styles.routeRow}>
            <View style={styles.dotRed} />
            <Text style={styles.routeText} numberOfLines={1}>
              {bookingData.drop_location}
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Drivers in your area are being notified. Please wait while we find the best match for you.
          </Text>
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  loaderContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  spinnerCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#2563eb',
  },
  spinnerDot: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  truckContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  truckEmoji: {
    fontSize: 40,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  driversFoundBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  driversFoundText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  fareValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a237e',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginRight: 12,
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginRight: 12,
  },
  routeLineSmall: {
    width: 2,
    height: 16,
    backgroundColor: '#d1d5db',
    marginLeft: 4,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#1e40af',
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
