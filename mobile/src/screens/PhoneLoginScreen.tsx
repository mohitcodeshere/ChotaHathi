import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';

interface PhoneLoginScreenProps {
  navigation: any;
}

export default function PhoneLoginScreen({ navigation }: PhoneLoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [locationGranted, setLocationGranted] = useState<boolean>(false);

  // Request location permission on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationGranted(true);
        console.log('✅ Location permission granted');
      } else {
        Alert.alert(
          'Location Permission Required',
          'ChotaHathi needs your location to show nearby services and accurate delivery addresses.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestLocationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const handleContinue = (): void => {
    // Validate phone number
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Check location permission
    if (!locationGranted) {
      Alert.alert(
        'Location Required',
        'Please enable location to continue',
        [{ text: 'Enable', onPress: requestLocationPermission }]
      );
      return;
    }

    // Navigate to OTP screen
    navigation.navigate('OTPVerification', { 
      phoneNumber: countryCode + phoneNumber 
    });
  };

  const isValidNumber = phoneNumber.length === 10;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>CHOTAHATHI</Text>
          <Text style={styles.logoPin}>📍</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>🚚</Text>
          <View style={styles.iconGrid}>
            <Text style={styles.smallIcon}>📦</Text>
            <Text style={styles.smallIcon}>🗺️</Text>
            <Text style={styles.smallIcon}>🛵</Text>
            <Text style={styles.smallIcon}>🚛</Text>
          </View>
          <Text style={styles.illustrationSubtext}>
            Your Logistics Partner
          </Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            With a valid number, you can access deliveries, and our other services
          </Text>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            {/* Country Code Selector */}
            <TouchableOpacity style={styles.countryCodeBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Phone Number Input */}
            <TextInput
              style={styles. phoneInput}
              placeholder="7018300409"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus={false}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              isValidNumber && locationGranted && styles.continueButtonActive
            ]}
            onPress={handleContinue}
            disabled={!isValidNumber || ! locationGranted}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Location Status */}
          {locationGranted ?  (
            <View style={styles.statusContainer}>
              <Text style={styles.locationStatusSuccess}>
                ✅ Location enabled
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.statusContainer}
              onPress={requestLocationPermission}
            >
              <Text style={styles.locationStatusWarning}>
                ⚠️ Location required - Tap to enable
              </Text>
            </TouchableOpacity>
          )}

          {/* Terms & Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:  1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom:  40,
    position: 'relative',
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 2,
  },
  logoPin: {
    fontSize: 20,
    position: 'absolute',
    right: '26%',
    top: -4,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 40,
  },
  illustration:  {
    fontSize: 100,
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:  'center',
    marginBottom: 16,
    gap: 12,
  },
  smallIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  illustrationSubtext: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  welcomeContainer: {
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  phoneInputContainer: {
    flexDirection:  'row',
    marginBottom: 20,
    gap: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical:  16,
    minWidth: 110,
  },
  flag:  {
    fontSize: 24,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#D0D0D0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonActive: {
    backgroundColor:  '#FF6B35',
  },
  continueButtonText:  {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  locationStatusSuccess: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationStatusWarning: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});