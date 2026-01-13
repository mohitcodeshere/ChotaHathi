import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { orderAPI } from '../services/api';

export default function BookingScreen({ route, navigation }) {
  // Receives service info from HomeScreen
  const { serviceType, serviceTitle, loadType, city } = route.params;
  
  const [formData, setFormData] = useState({
    vendor_id: '507f1f77bcf86cd799439011', // Dummy vendor ID for now
    pickup_location: city || 'Dharamshala',
    drop_location: '',
    load_type: loadType,
    load_weight_kg: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.pickup_location || !formData.drop_location) {
      Alert.alert('Error', 'Please fill pickup and drop locations');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        load_weight_kg: formData.load_weight_kg ?  parseFloat(formData.load_weight_kg) : undefined,
      };

      // Call backend API to create order
      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        Alert.alert('Success', '✅ Order created successfully!', [
          { 
            text: 'View Orders', 
            onPress: () => navigation.navigate('OrdersList')
          },
          { 
            text:  'Book Another', 
            onPress:  () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles. container}>
      {/* Service Header */}
      <View style={styles.header}>
        <Text style={styles.serviceIcon}>
          {serviceType === 'truck' ?  '🚛' : serviceType === 'two-wheeler' ? '🛵' : '📦'}
        </Text>
        <Text style={styles. serviceTitle}>{serviceTitle}</Text>
        <Text style={styles.serviceSubtitle}>{loadType}</Text>
      </View>

      {/* Booking Form */}
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>📍 Pickup Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup address"
            value={formData. pickup_location}
            onChangeText={(text) => setFormData({ ...formData, pickup_location: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>🎯 Drop Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter drop address"
            value={formData.drop_location}
            onChangeText={(text) => setFormData({ ...formData, drop_location: text })}
          />
        </View>

        <View style={styles. formGroup}>
          <Text style={styles.label}>📦 Load Type</Text>
          <TextInput
            style={styles. input}
            placeholder="e.g., Furniture, Electronics"
            value={formData.load_type}
            onChangeText={(text) => setFormData({ ...formData, load_type: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>⚖️ Weight (kg) - Optional</Text>
          <TextInput
            style={styles. input}
            placeholder="Approximate weight"
            keyboardType="numeric"
            value={formData.load_weight_kg}
            onChangeText={(text) => setFormData({ ... formData, load_weight_kg: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ?  'Booking...' : '🚀 Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:  1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 24,
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  serviceSubtitle:  {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label:  {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bookButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});