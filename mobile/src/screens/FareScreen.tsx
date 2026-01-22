import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type FareScreenProps = NativeStackScreenProps<RootStackParamList, 'Fare'>;

export default function FareScreen({ route, navigation }: FareScreenProps): React.JSX.Element {
  const { bookingData } = route.params;
  const [fare, setFare] = useState(500);
  const minFare = 500;
  const step = 50;

  const increaseFare = () => {
    setFare(prev => prev + step);
  };

  const decreaseFare = () => {
    setFare(prev => Math.max(minFare, prev - step));
  };

  const handleConfirmFare = () => {
    navigation.navigate('WaitingForDriver', {
      bookingData: {
        ...bookingData,
        fare: fare,
      },
    });
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
        <Text style={styles.headerTitle}>Set Your Fare</Text>
      </View>

      <View style={styles.content}>
        {/* Trip Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeRow}>
              <View style={styles.dotGreen} />
              <Text style={styles.locationText} numberOfLines={1}>
                {bookingData.pickup_location}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={styles.dotRed} />
              <Text style={styles.locationText} numberOfLines={1}>
                {bookingData.drop_location}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Load Type:</Text>
            <Text style={styles.detailValue}>{bookingData.load_type}</Text>
          </View>
        </View>

        {/* Fare Selection */}
        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>Your Offer</Text>
          
          <View style={styles.fareControls}>
            <TouchableOpacity 
              style={[styles.fareButton, fare <= minFare && styles.fareButtonDisabled]}
              onPress={decreaseFare}
              disabled={fare <= minFare}
            >
              <Text style={styles.fareButtonText}>−</Text>
            </TouchableOpacity>
            
            <View style={styles.fareDisplay}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.fareAmount}>{fare}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.fareButton}
              onPress={increaseFare}
            >
              <Text style={styles.fareButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fareHint}>
            Minimum fare: ₹{minFare} • Tap +/- to adjust by ₹{step}
          </Text>

          {/* Quick fare options */}
          <View style={styles.quickFares}>
            {[500, 600, 750, 1000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickFareChip,
                  fare === amount && styles.quickFareChipActive,
                ]}
                onPress={() => setFare(amount)}
              >
                <Text style={[
                  styles.quickFareText,
                  fare === amount && styles.quickFareTextActive,
                ]}>
                  ₹{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Higher fare increases chances of finding a driver quickly
          </Text>
        </View>
      </View>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmFare}
        >
          <Text style={styles.confirmButtonText}>Find Drivers at ₹{fare}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    marginRight: 12,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d5db',
    marginLeft: 5,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  fareCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 20,
  },
  fareControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  fareButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  fareDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a237e',
  },
  fareAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a237e',
    marginLeft: 4,
  },
  fareHint: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickFares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  quickFareChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  quickFareChipActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#1a237e',
  },
  quickFareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  quickFareTextActive: {
    color: '#1a237e',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
