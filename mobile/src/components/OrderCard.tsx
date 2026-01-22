import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order } from '../services/api';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';

export default function OrderCard({ order, onPress }: OrderCardProps): React.JSX.Element {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(order)} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.loadInfo}>
          <Text style={styles.loadType}>{order.load_type}</Text>
          {order.load_weight_kg && (
            <Text style={styles.weight}>{order.load_weight_kg} kg</Text>
          )}
        </View>
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
            {order.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.routeIcons}>
          <View style={styles.dotGreen} />
          <View style={styles.lineVertical} />
          <View style={styles.dotRed} />
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.locationText} numberOfLines={1}>{order.pickup_location}</Text>
          <Text style={styles.locationText} numberOfLines={1}>{order.drop_location}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.viewDetails}>View Details ›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadInfo: {
    flex: 1,
  },
  loadType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  weight: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeIcons: {
    alignItems: 'center',
    marginRight: 12,
    width: 16,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  lineVertical: {
    width: 2,
    height: 14,
    backgroundColor: '#d1d5db',
    marginVertical: 2,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewDetails: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
});
