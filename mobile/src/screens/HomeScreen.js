import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import HeroSection from '../components/HeroSection';
import CitySelector from '../components/CitySelector';
import ServiceCard from '../components/ServiceCard';

export default function HomeScreen({ navigation }) {
  const [selectedCity, setSelectedCity] = useState('Delhi');

  const services = [
    { id: 'truck', icon: '🚛', title: 'Truck', loadType: 'Heavy Goods' },
    { id: 'two-wheeler', icon: '🛵', title: 'Two Wheeler', loadType: 'Small Parcels' },
    { id:  'packers', icon: '📦', title: 'Packers', loadType: 'Home Shifting' },
  ];

  const handleServiceSelect = (service) => {
    navigation.navigate('Booking', { 
      serviceType: service.id,
      serviceTitle: service.title,
      loadType: service.loadType,
      city: selectedCity
    });
  };

  return (
    <ScrollView style={styles.container}>
      <HeroSection city={selectedCity} />
      
      <CitySelector 
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />

      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesGrid}>
          {services. map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              onPress={() => handleServiceSelect(service)}
            />
          ))}
        </View>
      </View>

      <View style={styles.enterpriseSection}>
        <View style={styles.enterpriseCard}>
          <Text style={styles.enterpriseTitle}>For Enterprises</Text>
          <Text style={styles.enterpriseSubtitle}>
            Manage logistics needs of your business with ChotaHathi Enterprise
          </Text>
          <TouchableOpacity style={styles.enterpriseButton}>
            <Text style={styles.enterpriseButtonText}>Get in Touch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.viewOrdersButton}
          onPress={() => navigation.navigate('OrdersList')}
        >
          <Text style={styles.viewOrdersText}>📋 View My Orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  servicesSection: {
    padding: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  enterpriseSection: {
    padding: 20,
    paddingTop: 12,
  },
  enterpriseCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 28,
    alignItems: 'flex-start',
  },
  enterpriseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  enterpriseSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  enterpriseButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 32,
    paddingVertical:  14,
    borderRadius: 12,
  },
  enterpriseButtonText:  {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
  },
  viewOrdersButton: {
    backgroundColor:  '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  viewOrdersText: {
    fontSize:  16,
    fontWeight:  '600',
    color: '#FF6B35',
  },
});