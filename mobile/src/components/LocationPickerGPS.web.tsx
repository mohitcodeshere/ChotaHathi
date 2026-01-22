import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity 
} from 'react-native';

interface LocationPickerProps {
  label: string;
  placeholder: string;
  value: string;
  onLocationSelect: (address: string, coordinates?: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ 
  label, 
  placeholder, 
  value, 
  onLocationSelect 
}: LocationPickerProps): React.JSX.Element {
  const [address, setAddress] = useState(value);

  const handleAddressChange = (text: string) => {
    setAddress(text);
    onLocationSelect(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={handleAddressChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
      />
      <Text style={styles.note}>
        Note: Map view is only available on mobile devices
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
