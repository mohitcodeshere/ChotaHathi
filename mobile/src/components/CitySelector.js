import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

const CITIES = [
  'Delhi',
  'Dharamshala',
  'Kangra',
  'Palampur',
  'Mcleodganj',
  'Baijnath',
];

export default function CitySelector({ selectedCity, onCityChange }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCitySelect = (city) => {
    onCityChange(city);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        {/* Pink Pin Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.pinIcon}>📍</Text>
        </View>
        
        {/* City Text */}
        <View style={styles.textContainer}>
          <Text style={styles.label}>Your City</Text>
          <Text style={styles.city}>{selectedCity}</Text>
        </View>
        
        {/* Dropdown Arrow */}
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select City</Text>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    item === selectedCity && styles.cityItemSelected
                  ]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={[
                    styles.cityItemText,
                    item === selectedCity && styles.cityItemTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    marginTop: -30, // Overlap with hero section
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Larger radius like Figma
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 24,
    color: '#E91E63', // Pink color for pin
  },
  textContainer: {
    flex: 1,
  },
  label:  {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  city:  {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  arrow:  {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor:  '#fff',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom:  20,
    textAlign: 'center',
  },
  cityItem: {
    padding: 16,
    borderBottomWidth:  1,
    borderBottomColor: '#F0F0F0',
  },
  cityItemSelected: {
    backgroundColor: '#FFF3F0',
  },
  cityItemText: {
    fontSize:  16,
    color: '#333',
  },
  cityItemTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color:  '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});