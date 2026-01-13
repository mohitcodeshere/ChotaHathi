import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { orderAPI, Order } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

type OrderDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';

interface DetailRowProps {
  label: string;
  value: string;
}

// Helper component for detail rows
function DetailRow({ label, value }: DetailRowProps): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function OrderDetailScreen({ route }: OrderDetailScreenProps): React.JSX.Element {
  // Receives orderId from OrdersListScreen
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // Fetch single order details
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
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<OrderStatus, string> = {
      pending: '#FFA500',
      accepted: '#4CAF50',
      in_transit: '#2196F3',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status as OrderStatus] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: getStatusColor(order.status) }]}>
        <Text style={styles.statusText}>Status: {order.status.toUpperCase()}</Text>
      </View>

      {/* Load Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Load Details</Text>
        <DetailRow label="Load Type" value={order.load_type} />
        {order.load_weight_kg && (
          <DetailRow label="Weight" value={`${order.load_weight_kg} kg`} />
        )}
      </View>

      {/* Location Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Location Details</Text>
        <DetailRow label="Pickup" value={order.pickup_location} />
        <DetailRow label="Drop" value={order.drop_location} />
      </View>

      {/* Order Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Order Information</Text>
        <DetailRow label="Order ID" value={order._id} />
        <DetailRow label="Vendor ID" value={order.vendor_id} />
        <DetailRow 
          label="Created At" 
          value={new Date(order.createdAt).toLocaleString('en-IN')} 
        />
        <DetailRow 
          label="Updated At" 
          value={new Date(order.updatedAt).toLocaleString('en-IN')} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusHeader: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});
