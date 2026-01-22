import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationPickerProps {
  label: string;
  placeholder: string;
  value: string;
  onLocationSelect: (address: string, coordinates?: { lat: number; lng: number }, plusCode?: string) => void;
}

// Plus Code generation helper (Open Location Code algorithm simplified)
const generatePlusCode = (lat: number, lng: number): string => {
  const ALPHABET = '23456789CFGHJMPQRVWX';
  
  // Normalize longitude
  let longitude = lng;
  while (longitude < -180) longitude += 360;
  while (longitude >= 180) longitude -= 360;
  
  // Normalize latitude
  let latitude = Math.min(90, Math.max(-90, lat));
  
  // Encode to plus code
  latitude += 90;
  longitude += 180;
  
  let code = '';
  let latVal = latitude;
  let lngVal = longitude;
  
  // First 4 pairs (8 characters)
  for (let i = 0; i < 4; i++) {
    const latDigit = Math.floor(latVal / (20 / Math.pow(20, i)));
    const lngDigit = Math.floor(lngVal / (20 / Math.pow(20, i)));
    code += ALPHABET[Math.min(19, latDigit % 20)];
    code += ALPHABET[Math.min(19, lngDigit % 20)];
    latVal = (latVal * 20) % 20;
    lngVal = (lngVal * 20) % 20;
  }
  
  // Insert + after 8 characters
  code = code.substring(0, 8) + '+' + code.substring(8);
  
  // Add refinement for more precision
  const refineLat = Math.floor((latVal * 5) % 5);
  const refineLng = Math.floor((lngVal * 4) % 4);
  const refineIndex = refineLat * 4 + refineLng;
  code += ALPHABET[Math.min(19, refineIndex)];
  
  return code.substring(0, 8) + '+' + code.substring(9, 12);
};

export default function LocationPicker({ 
  label, 
  placeholder, 
  value, 
  onLocationSelect 
}: LocationPickerProps): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 30.6762, // Default to Chandigarh area
    longitude: 76.7872,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [address, setAddress] = useState(value);
  const [plusCode, setPlusCode] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{id: string; name: string; address: string; lat: number; lng: number}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      setRegion(newRegion);
      
      // Generate plus code for current location
      const code = generatePlusCode(location.coords.latitude, location.coords.longitude);
      setPlusCode(code);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    
    // Generate plus code immediately
    const code = generatePlusCode(newRegion.latitude, newRegion.longitude);
    setPlusCode(code);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    setIsLoadingAddress(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const [result] = await Location.reverseGeocodeAsync({ 
          latitude: newRegion.latitude, 
          longitude: newRegion.longitude 
        });
        if (result) {
          const addressParts = [
            result.name,
            result.street,
            result.district,
            result.city,
          ].filter(Boolean);
          setAddress(addressParts.join(', '));
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setAddress(`${newRegion.latitude.toFixed(6)}, ${newRegion.longitude.toFixed(6)}`);
      } finally {
        setIsLoadingAddress(false);
      }
    }, 600);
  };

  const handleConfirm = () => {
    const fullAddress = `${plusCode}, ${address}`;
    onLocationSelect(fullAddress, {
      lat: region.latitude,
      lng: region.longitude,
    }, plusCode);
    setModalVisible(false);
  };

  // Kangra region popular locations for suggestions
  const kangraLocations = [
    { id: '1', name: 'Dharamshala', address: 'Dharamshala, Kangra, HP', lat: 32.2190, lng: 76.3234 },
    { id: '2', name: 'McLeodganj', address: 'McLeodganj, Dharamshala, HP', lat: 32.2426, lng: 76.3213 },
    { id: '3', name: 'Palampur', address: 'Palampur, Kangra, HP', lat: 32.1109, lng: 76.5363 },
    { id: '4', name: 'Kangra Town', address: 'Kangra, HP', lat: 32.0998, lng: 76.2691 },
    { id: '5', name: 'Baijnath', address: 'Baijnath, Kangra, HP', lat: 32.0505, lng: 76.6500 },
    { id: '6', name: 'Nagrota Bagwan', address: 'Nagrota Bagwan, Kangra, HP', lat: 32.0597, lng: 76.1986 },
    { id: '7', name: 'Jawali', address: 'Jawali, Kangra, HP', lat: 32.2333, lng: 76.0833 },
    { id: '8', name: 'Nurpur', address: 'Nurpur, Kangra, HP', lat: 32.3000, lng: 75.8833 },
    { id: '9', name: 'Gaggal', address: 'Gaggal, Kangra, HP', lat: 32.1647, lng: 76.2633 },
    { id: '10', name: 'Shahpur', address: 'Shahpur, Kangra, HP', lat: 32.2167, lng: 76.1667 },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    searchDebounceTimer.current = setTimeout(async () => {
      // Filter local Kangra locations
      const localResults = kangraLocations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.address.toLowerCase().includes(query.toLowerCase())
      );

      // Try geocoding for other locations
      try {
        const geocodeResults = await Location.geocodeAsync(query + ', Himachal Pradesh');
        const geocodeSuggestions = await Promise.all(
          geocodeResults.slice(0, 3).map(async (result, index) => {
            const [reverseResult] = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            const addressParts = [
              reverseResult?.name,
              reverseResult?.district,
              reverseResult?.city,
            ].filter(Boolean);
            return {
              id: `geo-${index}`,
              name: reverseResult?.name || query,
              address: addressParts.join(', '),
              lat: result.latitude,
              lng: result.longitude,
            };
          })
        );

        const allResults = [...localResults, ...geocodeSuggestions];
        const uniqueResults = allResults.filter((item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
        );
        
        setSuggestions(uniqueResults.slice(0, 5));
      } catch (error) {
        setSuggestions(localResults.slice(0, 5));
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSuggestionSelect = (suggestion: {id: string; name: string; address: string; lat: number; lng: number}) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setSearchQuery('');
    
    const newRegion = {
      latitude: suggestion.lat,
      longitude: suggestion.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    
    setRegion(newRegion);
    setAddress(suggestion.address);
    
    const code = generatePlusCode(suggestion.lat, suggestion.lng);
    setPlusCode(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.inputContent}>
          <View style={styles.pinIconContainer}>
            <Text style={styles.pinDot}>●</Text>
          </View>
          <Text style={value ? styles.inputText : styles.placeholderText} numberOfLines={1}>
            {value || placeholder}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
          
          {/* Header with Search */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search location..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {isSearching ? (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" color="#1a237e" />
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              ) : suggestions.length > 0 ? (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect(item)}
                    >
                      <Text style={styles.suggestionIcon}>📍</Text>
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionName}>{item.name}</Text>
                        <Text style={styles.suggestionAddress} numberOfLines={1}>{item.address}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : searchQuery.length >= 2 ? (
                <Text style={styles.noResultsText}>No locations found</Text>
              ) : null}
            </View>
          )}

          {/* Map */}
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton
            mapType="standard"
          />
          
          {/* Fixed center marker */}
          <View style={styles.centerMarkerContainer} pointerEvents="none">
            <Text style={styles.markerIcon}>📍</Text>
            <View style={styles.markerShadow} />
          </View>

          {/* Bottom Sheet */}
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            
            <View style={styles.addressContainer}>
              <View style={styles.addressIconContainer}>
                <Text style={styles.addressPinDot}>●</Text>
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.plusCodeText}>{plusCode}</Text>
                {isLoadingAddress ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#1a237e" />
                    <Text style={styles.loadingText}>Getting address...</Text>
                  </View>
                ) : (
                  <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm Pickup Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIconContainer: {
    marginRight: 12,
  },
  pinDot: {
    fontSize: 16,
    color: '#22c55e',
  },
  inputText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af',
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  suggestionAddress: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  noResultsText: {
    padding: 16,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  headerTooltip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
  },
  markerIcon: {
    fontSize: 40,
  },
  markerShadow: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -4,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  addressIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  addressPinDot: {
    fontSize: 20,
    color: '#22c55e',
  },
  addressTextContainer: {
    flex: 1,
  },
  plusCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});