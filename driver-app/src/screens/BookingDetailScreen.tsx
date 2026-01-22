import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { driverSocketService } from '../services/socket';

type BookingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

// Driver info - in production would come from auth/profile
const driverInfo = {
  id: 'driver_001',
  name: 'Rajesh Kumar',
  phone: '9876543210',
  vehicle_number: 'HP 01 AB 1234',
};

export default function BookingDetailScreen({ route, navigation }: BookingDetailScreenProps): React.JSX.Element {
  const { booking } = route.params;
  const [accepting, setAccepting] = useState(false);

  const handleAccept = () => {
    setAccepting(true);
    
    // Emit acceptance via socket
    driverSocketService.acceptBooking(booking.id, driverInfo);
    
    setTimeout(() => {
      setAccepting(false);
      Alert.alert(
        '🎉 Booking Accepted!',
        'Navigate to pickup location to start the delivery.',
        [
          {
            text: 'Start Navigation',
            onPress: () => navigation.navigate('ActiveOrder', {
              order: {
                ...booking,
                status: 'accepted',
              },
            }),
          },
        ]
      );
    }, 500);
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Booking?',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            driverSocketService.rejectBooking(booking.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL(`tel:${booking.customer_phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fare Card */}
        <View style={styles.fareCard}>
          <View style={styles.fareTop}>
            <Text style={styles.fareLabel}>Offered Fare</Text>
            <Text style={styles.fareValue}>₹{booking.fare}</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareBottom}>
            <View style={styles.fareInfo}>
              <Text style={styles.fareInfoIcon}>📍</Text>
              <Text style={styles.fareInfoText}>{booking.distance}</Text>
            </View>
            <View style={styles.fareInfo}>
              <Text style={styles.fareInfoIcon}>📦</Text>
              <Text style={styles.fareInfoText}>{booking.load_type}</Text>
            </View>
          </View>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeMarkers}>
              <View style={styles.dotGreen} />
              <View style={styles.routeLine} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress}>{booking.pickup_location}</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>DROP</Text>
                <Text style={styles.routeAddress}>{booking.drop_location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>
          
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {booking.customer_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{booking.customer_name}</Text>
              <Text style={styles.customerPhone}>+91 {booking.customer_phone}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Info</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={styles.infoValue}>#{booking.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Posted</Text>
            <Text style={styles.infoValue}>{booking.created_at}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={handleReject}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.acceptButton, accepting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={accepting}
        >
          <Text style={styles.acceptButtonText}>
            {accepting ? 'Accepting...' : 'Accept Booking'}
          </Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fareCard: {
    backgroundColor: '#22c55e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  fareTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  fareValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  fareDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  fareBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  fareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fareInfoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  fareInfoText: {
    fontSize: 14,
    fontWeight: '600',
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
  routeContainer: {
    flexDirection: 'row',
  },
  routeMarkers: {
    alignItems: 'center',
    marginRight: 16,
  },
  dotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
  },
  routeLine: {
    width: 3,
    height: 50,
    backgroundColor: '#d1d5db',
    marginVertical: 4,
  },
  dotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeItem: {
    marginBottom: 16,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
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
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bottomSpacer: {
    height: 100,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
