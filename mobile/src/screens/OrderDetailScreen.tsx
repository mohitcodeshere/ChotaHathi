import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { orderAPI, Order } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

type OrderDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';

interface DetailRowProps {
  label: string;
  value: string;
  icon?: string;
}

function DetailRow({ label, value, icon }: DetailRowProps): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{icon} {label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function OrderDetailScreen({ route, navigation }: OrderDetailScreenProps): React.JSX.Element {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async (): Promise<void> => {
    try {
      const data = await orderAPI.getOrderById(orderId);
      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<OrderStatus, string> = {
      pending: '#f59e0b',
      accepted: '#22c55e',
      in_transit: '#3b82f6',
      delivered: '#22c55e',
      cancelled: '#ef4444',
    };
    return colors[status as OrderStatus] || '#6b7280';
  };

  const getStatusBgColor = (status: string): string => {
    const colors: Record<OrderStatus, string> = {
      pending: '#fef3c7',
      accepted: '#dcfce7',
      in_transit: '#dbeafe',
      delivered: '#dcfce7',
      cancelled: '#fee2e2',
    };
    return colors[status as OrderStatus] || '#f3f4f6';
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusBgColor(order.status) }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(order.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(order.status) }
            ]}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</Text>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeIcons}>
              <View style={styles.dotGreen} />
              <View style={styles.lineVertical} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddress}>{order.pickup_location}</Text>
              </View>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Drop</Text>
                <Text style={styles.routeAddress}>{order.drop_location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Load Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Load Details</Text>
          <DetailRow icon="📦" label="Type" value={order.load_type} />
          {order.load_weight_kg && (
            <DetailRow icon="⚖️" label="Weight" value={`${order.load_weight_kg} kg`} />
          )}
        </View>

        {/* Order Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Information</Text>
          <DetailRow 
            icon="📅" 
            label="Created" 
            value={new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} 
          />
          <DetailRow 
            icon="🔄" 
            label="Updated" 
            value={new Date(order.updatedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} 
          />
        </View>

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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 13,
    color: '#6b7280',
  },
  card: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
  },
  routeIcons: {
    alignItems: 'center',
    marginRight: 16,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  lineVertical: {
    width: 2,
    height: 50,
    backgroundColor: '#e5e7eb',
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  routeDetails: {
    flex: 1,
  },
  routeItem: {
    marginBottom: 24,
  },
  routeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  bottomSpacer: {
    height: 40,
  },
});
