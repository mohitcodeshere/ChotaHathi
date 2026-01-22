import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Animated,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { driverSocketService, Booking } from '../services/socket';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Driver ID - in production this would come from auth
const DRIVER_ID = 'driver_001';

export default function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const alertAnim = useRef(new Animated.Value(0)).current;

  // Connect to socket on mount
  useEffect(() => {
    driverSocketService.connect(DRIVER_ID);

    // Listen for existing bookings when going online
    driverSocketService.onBookingsList((existingBookings) => {
      console.log('📦 Received existing bookings:', existingBookings.length);
      setBookings(existingBookings.map(b => ({
        ...b,
        distance: b.distance || '~10 km',
        created_at: b.created_at || 'Just now',
        vehicle_type: b.vehicle_type || 'Chota Hathi',
      })));
    });

    // Listen for new bookings
    driverSocketService.onNewBooking((booking) => {
      console.log('🆕 New booking received:', booking.id);
      Vibration.vibrate([0, 500, 200, 500]); // Vibrate pattern
      
      setBookings(prev => [{
        ...booking,
        distance: booking.distance || '~10 km',
        created_at: 'Just now',
        vehicle_type: booking.vehicle_type || 'Chota Hathi',
      }, ...prev]);
      
      // Show new booking alert animation
      setNewBookingAlert(true);
      Animated.sequence([
        Animated.timing(alertAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(alertAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNewBookingAlert(false));
    });

    // Listen for booking taken by another driver
    driverSocketService.onBookingTaken(({ bookingId }) => {
      console.log('❌ Booking taken:', bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    });

    // Listen for booking cancelled by customer
    driverSocketService.onBookingCancelled(({ bookingId }) => {
      console.log('🚫 Booking cancelled:', bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    });

    return () => {
      driverSocketService.removeAllListeners();
      driverSocketService.disconnect();
    };
  }, []);

  // Handle online/offline toggle
  const handleToggleOnline = () => {
    if (isOnline) {
      driverSocketService.goOffline();
      setIsOnline(false);
      setBookings([]);
    } else {
      driverSocketService.goOnline();
      setIsOnline(true);
    }
  };

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  const onRefresh = () => {
    setRefreshing(true);
    // Re-request bookings
    if (isOnline) {
      driverSocketService.goOnline();
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const todayEarnings = 2450;
  const totalTrips = 5;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning! 👋</Text>
            <Text style={styles.driverName}>Rajesh Kumar</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Online/Offline Toggle */}
        <TouchableOpacity 
          style={[styles.statusToggle, !isOnline && styles.statusOffline]}
          onPress={handleToggleOnline}
        >
          <Animated.View 
            style={[
              styles.statusDot, 
              isOnline && { transform: [{ scale: pulseAnim }] },
              !isOnline && styles.statusDotOffline,
            ]} 
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online - Accepting Bookings' : 'Offline - Tap to go online'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* New Booking Alert */}
      {newBookingAlert && (
        <Animated.View style={[styles.newBookingAlert, { opacity: alertAnim }]}>
          <Text style={styles.newBookingAlertText}>🔔 New Booking Received!</Text>
        </Animated.View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <View>
            <Text style={styles.statValue}>₹{todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚛</Text>
          <View>
            <Text style={styles.statValue}>{totalTrips}</Text>
            <Text style={styles.statLabel}>Trips Today</Text>
          </View>
        </View>
      </View>

      {/* Available Bookings */}
      <View style={styles.bookingsHeader}>
        <Text style={styles.bookingsTitle}>Available Bookings</Text>
        <View style={styles.bookingsBadge}>
          <Text style={styles.bookingsBadgeText}>{bookings.length} new</Text>
        </View>
      </View>

      <ScrollView
        style={styles.bookingsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!isOnline ? (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineIcon}>😴</Text>
            <Text style={styles.offlineTitle}>You're Offline</Text>
            <Text style={styles.offlineSubtitle}>Go online to see available bookings</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => navigation.navigate('BookingDetail', { booking })}
            >
              <View style={styles.bookingTop}>
                <View style={styles.fareContainer}>
                  <Text style={styles.fareValue}>₹{booking.fare}</Text>
                  <Text style={styles.fareLabel}>{booking.distance}</Text>
                </View>
                <View style={styles.vehicleBadge}>
                  <Text style={styles.vehicleIcon}>
                    {booking.vehicle_type === 'Chota Hathi' ? '🚛' : '🚚'}
                  </Text>
                  <Text style={styles.vehicleText}>{booking.vehicle_type}</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeRow}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {booking.pickup_location}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeRow}>
                  <View style={styles.dotRed} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {booking.drop_location}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingBottom}>
                <View style={styles.loadInfo}>
                  <Text style={styles.loadIcon}>📦</Text>
                  <Text style={styles.loadText}>{booking.load_type}</Text>
                </View>
                <Text style={styles.timeAgo}>{booking.created_at}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -10,
    gap: 12,
  },
  newBookingAlert: {
    position: 'absolute',
    top: 180,
    left: 16,
    right: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  newBookingAlertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusDotOffline: {
    backgroundColor: '#ef4444',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  bookingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  bookingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  bookingsBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  offlineMessage: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  offlineIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fareContainer: {
    alignItems: 'flex-start',
  },
  fareValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22c55e',
  },
  fareLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vehicleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  routeContainer: {
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
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d5db',
    marginLeft: 4,
    marginVertical: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  bookingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  loadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  loadText: {
    fontSize: 13,
    color: '#6b7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bottomSpacer: {
    height: 20,
  },
});
