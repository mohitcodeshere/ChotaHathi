import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { driverSocketService } from '../services/socket';

type ActiveOrderScreenProps = NativeStackScreenProps<RootStackParamList, 'ActiveOrder'>;

export default function ActiveOrderScreen({ route, navigation }: ActiveOrderScreenProps): React.JSX.Element {
  const { order } = route.params;
  const [currentStatus, setCurrentStatus] = useState<'accepted' | 'reached_pickup' | 'in_transit' | 'delivered'>('accepted');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const statusSteps = [
    { key: 'accepted', label: 'Going to Pickup', icon: '🚛' },
    { key: 'reached_pickup', label: 'At Pickup', icon: '📍' },
    { key: 'in_transit', label: 'In Transit', icon: '📦' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
  ];

  // Start location tracking
  useEffect(() => {
    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for GPS tracking');
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const coords = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };
        setCurrentLocation(coords);
        driverSocketService.sendLocation(order.id, coords);

        // Watch location changes
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or every 10 meters
          },
          (location) => {
            const newCoords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setCurrentLocation(newCoords);
            driverSocketService.sendLocation(order.id, newCoords);
          }
        );
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [order.id]);

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const handleStatusUpdate = () => {
    const currentIndex = getStatusIndex(currentStatus);
    
    if (currentIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentIndex + 1].key as typeof currentStatus;
      
      if (nextStatus === 'delivered') {
        Alert.alert(
          'Complete Delivery',
          'Confirm that you have delivered the goods?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Confirm',
              onPress: () => {
                setCurrentStatus('delivered');
                driverSocketService.updateTripStatus(order.id, 'delivered');
                
                // Stop location tracking
                if (locationSubscription.current) {
                  locationSubscription.current.remove();
                }
                
                setTimeout(() => {
                  Alert.alert(
                    '🎉 Delivery Complete!',
                    `You earned ₹${order.fare} for this trip.`,
                    [
                      { text: 'Back to Home', onPress: () => navigation.navigate('Home') }
                    ]
                  );
                }, 500);
              },
            },
          ]
        );
      } else {
        setLoading(true);
        setTimeout(() => {
          setCurrentStatus(nextStatus);
          driverSocketService.updateTripStatus(order.id, nextStatus);
          setLoading(false);
        }, 1000);
      }
    }
  };

  const getButtonText = () => {
    switch (currentStatus) {
      case 'accepted':
        return '📍 Mark Reached at Pickup';
      case 'reached_pickup':
        return '📦 Start Delivery - Go to Drop';
      case 'in_transit':
        return '✅ Mark as Delivered';
      case 'delivered':
        return 'Completed ✓';
      default:
        return 'Update Status';
    }
  };

  const getNavigationTarget = () => {
    // Show pickup location until reached, then show drop location
    if (currentStatus === 'accepted' || currentStatus === 'reached_pickup') {
      return { label: 'Pickup Location', address: order.pickup_location };
    }
    return { label: 'Drop Location', address: order.drop_location };
  };

  const handleCall = () => {
    Linking.openURL(`tel:${order.customer_phone}`);
  };

  const handleNavigate = (location: string) => {
    const query = encodeURIComponent(location);
    // Open in Google Maps with navigation
    if (Platform.OS === 'ios') {
      Linking.openURL(`maps://app?daddr=${query}`);
    } else {
      Linking.openURL(`google.navigation:q=${query}`);
    }
  };

  const navTarget = getNavigationTarget();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Leave Active Order?',
              'You can come back to this order from your active orders list.',
              [
                { text: 'Stay', style: 'cancel' },
                { text: 'Leave', onPress: () => navigation.navigate('Home') },
              ]
            );
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressContainer}>
            {statusSteps.map((step, index) => {
              const isCompleted = getStatusIndex(currentStatus) >= index;
              const isCurrent = currentStatus === step.key;
              
              return (
                <View key={step.key} style={styles.progressStep}>
                  <View style={[
                    styles.progressDot,
                    isCompleted && styles.progressDotCompleted,
                    isCurrent && styles.progressDotCurrent,
                  ]}>
                    <Text style={styles.progressIcon}>
                      {isCompleted ? step.icon : '○'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.progressLabel,
                    isCompleted && styles.progressLabelCompleted,
                  ]}>
                    {step.label}
                  </Text>
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.progressLine,
                      isCompleted && styles.progressLineCompleted,
                    ]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Fare Banner */}
        <View style={styles.fareBanner}>
          <View>
            <Text style={styles.fareLabel}>Trip Earnings</Text>
            <Text style={styles.fareValue}>₹{order.fare}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {currentStatus.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* GPS Navigation Card - Prominent */}
        {currentStatus !== 'delivered' && (
          <TouchableOpacity 
            style={styles.gpsCard}
            onPress={() => handleNavigate(navTarget.address)}
          >
            <View style={styles.gpsIconContainer}>
              <Text style={styles.gpsIcon}>🧭</Text>
            </View>
            <View style={styles.gpsInfo}>
              <Text style={styles.gpsLabel}>Navigate to {navTarget.label}</Text>
              <Text style={styles.gpsAddress} numberOfLines={2}>{navTarget.address}</Text>
              {currentLocation && (
                <Text style={styles.gpsCoords}>
                  📍 Your location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              )}
            </View>
            <View style={styles.gpsArrow}>
              <Text style={styles.gpsArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route</Text>
          
          {/* Pickup */}
          <TouchableOpacity 
            style={styles.locationRow}
            onPress={() => handleNavigate(order.pickup_location)}
          >
            <View style={styles.dotGreen} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <Text style={styles.locationAddress}>{order.pickup_location}</Text>
            </View>
            <View style={styles.navButton}>
              <Text style={styles.navIcon}>🧭</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.routeLine} />

          {/* Drop */}
          <TouchableOpacity 
            style={styles.locationRow}
            onPress={() => handleNavigate(order.drop_location)}
          >
            <View style={styles.dotRed} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>DROP</Text>
              <Text style={styles.locationAddress}>{order.drop_location}</Text>
            </View>
            <View style={styles.navButton}>
              <Text style={styles.navIcon}>🧭</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {order.customer_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.customer_name}</Text>
              <Text style={styles.customerPhone}>+91 {order.customer_phone}</Text>
            </View>
            <TouchableOpacity style={styles.customerCallButton} onPress={handleCall}>
              <Text style={styles.customerCallIcon}>📞</Text>
              <Text style={styles.customerCallText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Load Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Load Information</Text>
          <View style={styles.loadRow}>
            <Text style={styles.loadIcon}>📦</Text>
            <Text style={styles.loadText}>{order.load_type}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Button */}
      {currentStatus !== 'delivered' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.buttonDisabled]}
            onPress={handleStatusUpdate}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Updating...' : getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a237e',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotCompleted: {
    backgroundColor: '#dcfce7',
  },
  progressDotCurrent: {
    backgroundColor: '#22c55e',
  },
  progressIcon: {
    fontSize: 18,
  },
  progressLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  progressLabelCompleted: {
    color: '#22c55e',
    fontWeight: '600',
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: '60%',
    right: '-40%',
    height: 3,
    backgroundColor: '#e5e7eb',
    zIndex: -1,
  },
  progressLineCompleted: {
    backgroundColor: '#22c55e',
  },
  fareBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  fareValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    marginRight: 14,
  },
  dotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
    marginRight: 14,
  },
  routeLine: {
    width: 3,
    height: 30,
    backgroundColor: '#d1d5db',
    marginLeft: 5.5,
    marginVertical: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 18,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  customerCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  customerCallIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  customerCallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  loadText: {
    fontSize: 16,
    color: '#374151',
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gpsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gpsIcon: {
    fontSize: 24,
  },
  gpsInfo: {
    flex: 1,
  },
  gpsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  gpsAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  gpsCoords: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  gpsArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  gpsArrowText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 100,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
