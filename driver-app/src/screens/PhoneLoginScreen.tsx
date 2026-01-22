import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type PhoneLoginScreenProps = NativeStackScreenProps<RootStackParamList, 'PhoneLogin'>;

export default function PhoneLoginScreen({ navigation }: PhoneLoginScreenProps): React.JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleContinue = () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    navigation.navigate('OTPVerification', { phoneNumber });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.truckIcon}>🚛</Text>
        <Text style={styles.appName}>ChotaHathi</Text>
        <Text style={styles.driverBadge}>DRIVER</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome, Driver!</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to start accepting bookings
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.code}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, phoneNumber.length !== 10 && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={phoneNumber.length !== 10}
          >
            <Text style={styles.buttonText}>Get OTP</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why drive with ChotaHathi?</Text>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>Earn more with every delivery</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>⏰</Text>
            <Text style={styles.benefitText}>Flexible working hours</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>📍</Text>
            <Text style={styles.benefitText}>Get bookings in Kangra region</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  truckIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  driverBadge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
  },
});
