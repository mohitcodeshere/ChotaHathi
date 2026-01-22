import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Linking,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { socketService } from '../services/socket';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

type DriverTrackingScreenProps = NativeStackScreenProps<RootStackParamList, 'DriverTracking'>;

interface DriverLocation {
  latitude: number;
  longitude: number;
}

export default function DriverTrackingScreen({ route, navigation }: DriverTrackingScreenProps): React.JSX.Element {
  const { bookingId, driver, bookingData } = route.params;

  // Parse pickup and drop coordinates from bookingData
  // bookingData.pickup_coords and bookingData.drop_coords should be { latitude, longitude }
  // If not present, fallback to 0,0
  const pickupCoords = bookingData.pickup_coords || { latitude: 0, longitude: 0 };
  const dropCoords = bookingData.drop_coords || { latitude: 0, longitude: 0 };

  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [tripStatus, setTripStatus] = useState<'accepted' | 'reached_pickup' | 'in_transit' | 'delivered'>('accepted');
  const [estimatedTime, setEstimatedTime] = useState(15); // Initial ETA in minutes
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const truckPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Connect socket if not connected
    socketService.connect();

    // Listen for driver location updates
    socketService.onDriverLocation((data) => {
      if (data.bookingId === bookingId) {
        setDriverLocation(data.location);
        // Simulate ETA decrease with each location update
        setEstimatedTime(prev => Math.max(1, prev - 1));
      }
    });

    // Listen for trip status updates
    socketService.onTripStatus((data) => {
      if (data.bookingId === bookingId) {
        setTripStatus(data.status);

        if (data.status === 'reached_pickup') {
          setEstimatedTime(0);
          Alert.alert('🎉 Driver Arrived!', 'Your driver has reached the pickup location.');
        }

        if (data.status === 'in_transit') {
          setEstimatedTime(20); // Reset ETA for delivery
        }

        if (data.status === 'delivered') {
          Alert.alert(
            '✅ Delivery Complete!',
            'Your goods have been delivered successfully.',
            [{ text: 'Done', onPress: () => navigation.replace('Home') }]
          );
        }
      }
    });

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Truck animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckPosition, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(truckPosition, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      socketService.offDriverLocation();
      socketService.offTripStatus();
    };
  }, [bookingId]);

  const handleCall = () => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    }
  };

  const getStatusInfo = () => {
    switch (tripStatus) {
      case 'accepted':
        return { title: 'Driver on the way', subtitle: 'Coming to pickup', icon: '🚛', color: '#ff9800' };
      case 'reached_pickup':
        return { title: 'Driver Arrived!', subtitle: 'At pickup location', icon: '📍', color: '#4caf50' };
      case 'in_transit':
        return { title: 'In Transit', subtitle: 'Delivering your goods', icon: '📦', color: '#2196f3' };
      case 'delivered':
        return { title: 'Delivered!', subtitle: 'Order completed', icon: '✅', color: '#4caf50' };
      default:
        return { title: 'Tracking...', subtitle: '', icon: '🔄', color: '#666' };
    }
  };

  const statusInfo = getStatusInfo();
  const truckTranslateX = truckPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Status Card with ETA */}
      <View style={[styles.mainStatusCard, { borderColor: statusInfo.color }]}>
        <Animated.View style={[styles.statusIconBg, { transform: [{ scale: pulseAnim }], backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusIconLarge}>{statusInfo.icon}</Text>
        </Animated.View>
        <Text style={styles.statusTitle}>{statusInfo.title}</Text>
        <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
        
        {tripStatus !== 'delivered' && tripStatus !== 'reached_pickup' && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>Estimated arrival</Text>
            <Text style={styles.etaTime}>{estimatedTime} min</Text>
          </View>
        )}
      </View>

      {/* Animated Truck Track */}
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <View style={styles.trackLine} />
          <Animated.View style={[styles.truckAnimated, { transform: [{ translateX: truckTranslateX }] }]}>
            <Text style={styles.truckEmoji}>🚛</Text>
          </Animated.View>
          <View style={styles.trackDotStart} />
          <View style={styles.trackDotEnd} />
        </View>
        <View style={styles.trackLabels}>
          <Text style={styles.trackLabel}>{tripStatus === 'in_transit' ? 'Pickup' : 'Driver'}</Text>
          <Text style={styles.trackLabel}>{tripStatus === 'in_transit' ? 'Drop' : 'Pickup'}</Text>
        </View>
      </View>

      {/* Live GPS Map - In-App Tracking */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.mapTitle}>Driver's Location</Text>
        </View>
        
        {driverLocation ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {/* Route Polyline */}
              <Polyline
                coordinates={[pickupCoords, dropCoords]}
                strokeColor="#1a237e"
                strokeWidth={4}
                lineDashPattern={[8, 4]}
              />
              {/* Pickup Marker */}
              <Marker
                coordinate={pickupCoords}
                title="Pickup"
                description="Start location"
              >
                <View style={[styles.markerContainer, { borderColor: '#4caf50' }]}> 
                  <Text style={styles.markerEmoji}>📦</Text>
                </View>
              </Marker>
              {/* Drop Marker */}
              <Marker
                coordinate={dropCoords}
                title="Drop"
                description="Destination"
              >
                <View style={[styles.markerContainer, { borderColor: '#f44336' }]}> 
                  <Text style={styles.markerEmoji}>🏁</Text>
                </View>
              </Marker>
              {/* Driver Marker */}
              <Marker
                coordinate={{
                  latitude: driverLocation.latitude,
                  longitude: driverLocation.longitude,
                }}
                title="Driver"
                description="Your driver is here"
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerEmoji}>🚛</Text>
                </View>
              </Marker>
            </MapView>
          </View>
        ) : (
          <View style={styles.waitingLocation}>
            <View style={styles.waitingMapPlaceholder}>
              <Text style={styles.waitingMapIcon}>🗺️</Text>
              <Text style={styles.waitingText}>Waiting for driver's GPS signal...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Driver Info Card */}
      <View style={styles.driverCard}>
        <View style={styles.driverAvatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.driverDetails}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.vehicleInfo}>🚛 {driver.vehicle_type}</Text>
          <Text style={styles.vehicleNumber}>{driver.vehicle_number}</Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Trip & Fare */}
      <View style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={styles.dotGreen} />
          <Text style={styles.tripAddress} numberOfLines={1}>{bookingData.pickup_location}</Text>
        </View>
        <View style={styles.tripLine} />
        <View style={styles.tripRow}>
          <View style={styles.dotRed} />
          <Text style={styles.tripAddress} numberOfLines={1}>{bookingData.drop_location}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Total Fare</Text>
          <Text style={styles.fareAmount}>₹{bookingData.fare}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a237e',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 36,
  },
  mainStatusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconLarge: {
    fontSize: 28,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  etaContainer: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  etaLabel: {
    fontSize: 11,
    color: '#666',
  },
  etaTime: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  trackContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  track: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  trackLine: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginHorizontal: 16,
  },
  truckAnimated: {
    position: 'absolute',
    left: 16,
    top: 2,
  },
  truckEmoji: {
    fontSize: 28,
  },
  trackDotStart: {
    position: 'absolute',
    left: 12,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
  },
  trackDotEnd: {
    position: 'absolute',
    right: 12,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
  },
  trackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  trackLabel: {
    fontSize: 10,
    color: '#666',
  },
  mapCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4caf50',
    elevation: 3,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  mapContainer: {
    height: 200,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a237e',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerEmoji: {
    fontSize: 20,
  },
  waitingLocation: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  waitingMapPlaceholder: {
    alignItems: 'center',
  },
  waitingMapIcon: {
    fontSize: 40,
    marginBottom: 10,
    opacity: 0.5,
  },
  waitingText: {
    fontSize: 14,
    color: '#666',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 26,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  vehicleNumber: {
    fontSize: 12,
    color: '#999',
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 22,
  },
  tripCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
    marginRight: 10,
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f44336',
    marginRight: 10,
  },
  tripLine: {
    width: 2,
    height: 16,
    backgroundColor: '#ddd',
    marginLeft: 4,
    marginVertical: 4,
  },
  tripAddress: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
  },
});
