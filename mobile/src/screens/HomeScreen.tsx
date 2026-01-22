import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as Location from 'expo-location';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface UserLocation {
  address: string;
  landmark: string;
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface VehicleOption {
  id: string;
  title: string;
  loadType: string;
}

export default function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Home');

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get detailed address
      const [result] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let addressText = 'Unknown Location';
      let landmarkText = '';
      
      if (result) {
        // Build precise address with landmarks
        const addressParts = [
          result.name,
          result.street,
          result.district,
          result.city,
        ].filter(Boolean);
        addressText = addressParts.join(', ');
        
        // Create landmark text
        if (result.name) {
          landmarkText = result.name;
        }
      }

      setUserLocation({
        address: addressText,
        landmark: landmarkText,
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const vehicleOptions: VehicleOption[] = [
    { 
      id: 'chota-hathi', 
      title: 'Chota Hathi', 
      loadType: 'Heavy Goods' 
    },
    { 
      id: 'truck', 
      title: 'Truck', 
      loadType: 'Construction Materials' 
    },
  ];

  const handleVehicleSelect = (vehicle: VehicleOption): void => {
    navigation.navigate('Booking', { 
      serviceType: vehicle.id,
      serviceTitle: vehicle.title,
      loadType: vehicle.loadType,
      city: userLocation?.address || 'Unknown'
    });
  };

  const bottomTabs = [
    { id: 'Home', icon: '🏠', label: 'Home' },
    { id: 'Orders', icon: '🕐', label: 'Orders' },
    { id: 'Payments', icon: '💳', label: 'Payments' },
    { id: 'Account', icon: '👤', label: 'Account' },
  ];

  // Live driver deliveries data
  const driverDeliveries = [
    { id: 1, driver: 'Ramu', vehicle: 'Chota Hathi', item: 'Tiles', from: 'Dharamshala', to: 'Palampur', km: 35 },
    { id: 2, driver: 'Shyam', vehicle: 'Truck', item: 'Cement', from: 'Kangra', to: 'Baijnath', km: 28 },
    { id: 3, driver: 'Vijay', vehicle: 'Chota Hathi', item: 'Furniture', from: 'McLeodganj', to: 'Nagrota', km: 18 },
    { id: 4, driver: 'Anil', vehicle: 'Truck', item: 'Steel/Iron', from: 'Jawali', to: 'Nurpur', km: 22 },
    { id: 5, driver: 'Suresh', vehicle: 'Chota Hathi', item: 'Electronics', from: 'Gaggal', to: 'Shahpur', km: 15 },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;
  const tickerRef = useRef<ScrollView>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => {
        const next = (prev + 1) % driverDeliveries.length;
        tickerRef.current?.scrollTo({ x: next * 280, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'Orders') {
      navigation.navigate('OrdersList');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Curved Header Background */}
        <View style={styles.headerContainer}>
          <View style={styles.headerBackground}>
            {/* Wave decorations */}
            <View style={styles.waveDecoration1} />
            <View style={styles.waveDecoration2} />
          </View>
          <View style={styles.headerCurve} />
        </View>

        {/* Pick up from Card */}
        <View style={styles.pickupCardContainer}>
          <TouchableOpacity 
            style={styles.pickupCard}
            onPress={getUserLocation}
            activeOpacity={0.9}
          >
            <View style={styles.pickupIconContainer}>
              <View style={styles.greenPin}>
                <Text style={styles.pinDot}>●</Text>
              </View>
            </View>
            
            <View style={styles.pickupTextContainer}>
              <Text style={styles.pickupLabel}>Pick up from</Text>
              {locationLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#1a237e" />
                  <Text style={styles.loadingText}>Getting GPS location...</Text>
                </View>
              ) : locationError ? (
                <Text style={styles.errorText}>Tap to enable location</Text>
              ) : (
                <Text style={styles.pickupAddress} numberOfLines={1}>
                  {userLocation?.address || 'Tap to get location'}
                </Text>
              )}
            </View>
            
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Options */}
        <View style={styles.vehicleSection}>
          <View style={styles.vehicleGrid}>
            {vehicleOptions.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => handleVehicleSelect(vehicle)}
                activeOpacity={0.8}
              >
                <View style={styles.vehicleHeader}>
                  <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
                  <Text style={styles.vehicleArrow}>›</Text>
                </View>
                <View style={styles.vehicleImageContainer}>
                  <Text style={styles.vehicleEmoji}>
                    {vehicle.id === 'chota-hathi' ? '🚛' : '🏍️'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Deliveries Section */}
        <View style={styles.liveDeliveriesSection}>
          <View style={styles.liveHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTitle}>Live Deliveries</Text>
          </View>
          <ScrollView
            ref={tickerRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEventThrottle={16}
            style={styles.tickerScroll}
          >
            {driverDeliveries.map((delivery) => (
              <View key={delivery.id} style={styles.deliveryCard}>
                <View style={styles.deliveryTop}>
                  <View style={styles.driverInfo}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverInitial}>{delivery.driver[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.driverName}>{delivery.driver}</Text>
                      <Text style={styles.vehicleType}>{delivery.vehicle === 'Chota Hathi' ? '🚛' : '🚚'} {delivery.vehicle}</Text>
                    </View>
                  </View>
                  <View style={styles.kmBadge}>
                    <Text style={styles.kmText}>{delivery.km} km</Text>
                  </View>
                </View>
                <View style={styles.deliveryRoute}>
                  <Text style={styles.deliveryItem}>📦 {delivery.item}</Text>
                  <View style={styles.routeFlow}>
                    <Text style={styles.locationFrom}>{delivery.from}</Text>
                    <Text style={styles.routeArrow}>→</Text>
                    <Text style={styles.locationTo}>{delivery.to}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {driverDeliveries.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, tickerIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* Tagline Section */}
        <View style={styles.taglineSection}>
          <Text style={styles.taglineLight}>Delivery hai?</Text>
          <Text style={styles.taglineBold}>Ho Jayega!</Text>
          
          {/* Decorative clouds */}
          <View style={styles.cloudContainer}>
            <Text style={styles.cloud}>☁️</Text>
            <Text style={[styles.cloud, styles.cloudRight]}>☁️</Text>
            <Text style={[styles.cloud, styles.cloudBottom]}>☁️</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[
              styles.navIcon,
              activeTab === tab.id && styles.navIconActive
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.navLabel,
              activeTab === tab.id && styles.navLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    height: 160,
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: '#1a237e',
    overflow: 'hidden',
  },
  waveDecoration1: {
    position: 'absolute',
    top: 30,
    left: -50,
    right: -50,
    height: 100,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'transparent',
  },
  waveDecoration2: {
    position: 'absolute',
    top: 50,
    left: -30,
    right: -30,
    height: 80,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'transparent',
  },
  headerCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#f5f7fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  pickupCardContainer: {
    paddingHorizontal: 16,
    marginTop: -60,
  },
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickupIconContainer: {
    marginRight: 12,
  },
  greenPin: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    fontSize: 24,
    color: '#22c55e',
  },
  pickupTextContainer: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  pickupAddress: {
    fontSize: 13,
    color: '#666',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  vehicleSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  vehicleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 140,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vehicleArrow: {
    fontSize: 20,
    color: '#999',
  },
  vehicleImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  vehicleEmoji: {
    fontSize: 56,
  },
  liveDeliveriesSection: {
    paddingTop: 28,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  liveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tickerScroll: {
    paddingLeft: 16,
  },
  deliveryCard: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deliveryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  driverInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vehicleType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  kmBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kmText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  deliveryRoute: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  deliveryItem: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  routeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationFrom: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  routeArrow: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  locationTo: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#9ca3af',
  },
  taglineSection: {
    backgroundColor: '#e8f4fd',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 32,
    paddingBottom: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  taglineLight: {
    fontSize: 32,
    fontWeight: '300',
    color: '#94a3b8',
  },
  taglineBold: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: -4,
  },
  cloudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloud: {
    position: 'absolute',
    fontSize: 40,
    opacity: 0.3,
    right: 20,
    top: 20,
  },
  cloudRight: {
    right: 60,
    top: 60,
    fontSize: 30,
  },
  cloudBottom: {
    left: 30,
    bottom: 20,
    fontSize: 35,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
