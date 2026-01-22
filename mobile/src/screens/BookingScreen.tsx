import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import LocationPicker from '../components/LocationPickerGPS';

type BookingScreenProps = NativeStackScreenProps<RootStackParamList, 'Booking'>;

interface FormData {
  vendor_id: string;
  pickup_location: string;
  drop_location: string;
  load_type: string;
  load_weight_kg: string;
}

export default function BookingScreen({ route, navigation }: BookingScreenProps): React.JSX.Element {
  const { serviceType, serviceTitle, loadType, city } = route.params;
  
  const [formData, setFormData] = useState<FormData>({
    vendor_id: '507f1f77bcf86cd799439011',
    pickup_location: city || '',
    drop_location: '',
    load_type: loadType,
    load_weight_kg: '',
  });


  const handleSubmit = async (): Promise<void> => {
    if (!formData.pickup_location || !formData.drop_location) {
      Alert.alert('Error', 'Please fill pickup and drop locations');
      return;
    }

    // Navigate to Fare screen instead of creating order directly
    navigation.navigate('Fare', {
      bookingData: {
        vendor_id: formData.vendor_id,
        pickup_location: formData.pickup_location,
        drop_location: formData.drop_location,
        load_type: formData.load_type,
        load_weight_kg: formData.load_weight_kg ? parseFloat(formData.load_weight_kg) : 0,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.serviceIcon}>
            {serviceType === 'chota-hathi' ? '🚛' : '🚚'}
          </Text>
          <View>
            <Text style={styles.serviceTitle}>{serviceTitle}</Text>
            <Text style={styles.serviceSubtitle}>{loadType}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Route Details</Text>
          </View>
          
          <View style={styles.routeContainer}>
            {/* Route Flow Indicator */}
            <View style={styles.routeIndicator}>
              <View style={styles.dotGreen} />
              <View style={styles.lineVertical} />
              <View style={styles.dotRed} />
            </View>

            {/* Location Inputs */}
            <View style={styles.locationsContainer}>
              {/* Pickup Location */}
              <LocationPicker
                label="Pickup Location"
                placeholder="Select pickup address"
                value={formData.pickup_location}
                onLocationSelect={(address) => setFormData({ ...formData, pickup_location: address })}
              />

              {/* Drop Location */}
              <LocationPicker
                label="Drop Location"
                placeholder="Select drop address"
                value={formData.drop_location}
                onLocationSelect={(address) => setFormData({ ...formData, drop_location: address })}
              />
            </View>
          </View>
        </View>

        {/* Load Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Load Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>What are you moving?</Text>
            <View style={styles.loadTypeOptions}>
              {(serviceType === 'chota-hathi' 
                ? ['Furniture', 'Construction Items', 'Electronics', 'Other']
                : ['Steel/Iron', 'Marvels/Tiles', 'Cement', 'Ply Wood', 'Other']
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.loadTypeChip,
                    formData.load_type === option && styles.loadTypeChipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, load_type: option })}
                >
                  <Text style={[
                    styles.loadTypeChipText,
                    formData.load_type === option && styles.loadTypeChipTextSelected,
                  ]}>
                    {option === 'Furniture' ? '🪑' : 
                     option === 'Construction Items' ? '🧱' : 
                     option === 'Electronics' ? '📱' :
                     option === 'Steel/Iron' ? '🔩' :
                     option === 'Marvels/Tiles' ? '🪨' :
                     option === 'Cement' ? '🧱' :
                     option === 'Ply Wood' ? '🪵' : '📋'} {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formData.load_type === 'Other' && (
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Describe what you're moving"
                placeholderTextColor="#9ca3af"
                onChangeText={(text) => setFormData({ ...formData, load_type: `Other: ${text}` })}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Approximate Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={formData.load_weight_kg}
              onChangeText={(text) => setFormData({ ...formData, load_weight_kg: text })}
            />
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleSubmit}
        >
          <Text style={styles.bookButtonText}>Continue to Fare</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  serviceSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  routeCard: {
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
  routeHeader: {
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  routeContainer: {
    flexDirection: 'row',
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 32,
    width: 20,
  },
  locationsContainer: {
    flex: 1,
  },
  dotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#bbf7d0',
  },
  lineVertical: {
    width: 2,
    height: 60,
    backgroundColor: '#d1d5db',
    marginVertical: 4,
  },
  dotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: '#fecaca',
  },
  detailsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a1a',
  },
  loadTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  loadTypeChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  loadTypeChipSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: '#1a237e',
  },
  loadTypeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  loadTypeChipTextSelected: {
    color: '#1a237e',
    fontWeight: '600',
  },
  bookButton: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});