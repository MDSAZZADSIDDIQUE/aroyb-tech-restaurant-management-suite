import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/order.dart';
import '../models/cart_item.dart';
import '../models/notification.dart';
import '../../core/constants/app_constants.dart';

/// Repository for managing orders
class OrderRepository {
  static const _boxName = 'orders_data';
  static const _ordersKey = 'orders';
  static const _activeOrderKey = 'active_order';
  static const _ticketsKey = 'support_tickets';

  Box get _box => Hive.box(_boxName);

  /// Get all orders
  List<Order> getOrders() {
    final ordersJson = _box.get(_ordersKey, defaultValue: '[]') as String;
    final ordersList = json.decode(ordersJson) as List<dynamic>;
    return ordersList
        .map((e) => Order.fromJson(e as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  /// Get order by ID
  Order? getOrderById(String orderId) {
    final orders = getOrders();
    try {
      return orders.firstWhere((o) => o.id == orderId);
    } catch (_) {
      return null;
    }
  }

  /// Get active order (most recent non-completed order)
  Order? getActiveOrder() {
    final activeOrderJson = _box.get(_activeOrderKey) as String?;
    if (activeOrderJson == null) return null;
    return Order.fromJson(json.decode(activeOrderJson) as Map<String, dynamic>);
  }

  /// Create a new order
  Future<Order> createOrder({
    required String restaurantId,
    required String restaurantName,
    required List<CartItem> items,
    required double subtotal,
    required double deliveryFee,
    required double serviceCharge,
    required double tip,
    required double discount,
    required double total,
    required String fulfillmentType,
    required DeliveryAddress? deliveryAddress,
    String? collectionNote,
    required DateTime scheduledTime,
    required String contactName,
    required String contactPhone,
    String specialInstructions = '',
    String? appliedReferralCode,
  }) async {
    final uuid = const Uuid();
    final orderId = uuid.v4();
    final orderNumber =
        'ARB${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

    final order = Order(
      id: orderId,
      orderNumber: orderNumber,
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      serviceCharge: serviceCharge,
      tip: tip,
      discount: discount,
      total: total,
      fulfillmentType: fulfillmentType,
      deliveryAddress: deliveryAddress,
      collectionNote: collectionNote,
      scheduledTime: scheduledTime,
      createdAt: DateTime.now(),
      status: 'placed',
      statusHistory: [
        OrderStatusUpdate(
          status: 'placed',
          timestamp: DateTime.now(),
          note: 'Order placed successfully',
        ),
      ],
      contactName: contactName,
      contactPhone: contactPhone,
      specialInstructions: specialInstructions,
      loyaltyPointsEarned: total.floor(),
      appliedReferralCode: appliedReferralCode,
    );

    // Save to orders list
    final orders = getOrders();
    orders.insert(0, order);
    await _box.put(
        _ordersKey, json.encode(orders.map((e) => e.toJson()).toList()));

    // Set as active order
    await _box.put(_activeOrderKey, json.encode(order.toJson()));

    return order;
  }

  /// Update order status
  Future<Order?> updateOrderStatus(String orderId, String newStatus,
      {String? note}) async {
    final orders = getOrders();
    final index = orders.indexWhere((o) => o.id == orderId);
    if (index == -1) return null;

    final order = orders[index];
    final updatedHistory = [
      ...order.statusHistory,
      OrderStatusUpdate(
        status: newStatus,
        timestamp: DateTime.now(),
        note: note,
      ),
    ];

    final updatedOrder = order.copyWith(
      status: newStatus,
      statusHistory: updatedHistory,
    );

    orders[index] = updatedOrder;
    await _box.put(
        _ordersKey, json.encode(orders.map((e) => e.toJson()).toList()));

    // Update active order if it's the same
    final activeOrder = getActiveOrder();
    if (activeOrder?.id == orderId) {
      await _box.put(_activeOrderKey, json.encode(updatedOrder.toJson()));
    }

    return updatedOrder;
  }

  /// Clear active order
  Future<void> clearActiveOrder() async {
    await _box.delete(_activeOrderKey);
  }

  /// Get recent orders for reorder
  List<Order> getRecentOrders({int limit = 5}) {
    return getOrders().take(limit).toList();
  }

  /// Submit support ticket
  Future<SupportTicket> submitSupportTicket({
    required String orderId,
    required String orderNumber,
    required String issueType,
    required String description,
    required List<String> affectedItemIds,
    required List<String> photoUrls,
    required String suggestedResolution,
  }) async {
    final uuid = const Uuid();
    final ticket = SupportTicket(
      id: uuid.v4(),
      orderId: orderId,
      orderNumber: orderNumber,
      issueType: issueType,
      description: description,
      affectedItemIds: affectedItemIds,
      photoUrls: photoUrls,
      suggestedResolution: suggestedResolution,
      createdAt: DateTime.now(),
    );

    final ticketsJson = _box.get(_ticketsKey, defaultValue: '[]') as String;
    final tickets = json.decode(ticketsJson) as List<dynamic>;
    tickets.add(ticket.toJson());
    await _box.put(_ticketsKey, json.encode(tickets));

    return ticket;
  }

  /// Get support tickets
  List<SupportTicket> getSupportTickets() {
    final ticketsJson = _box.get(_ticketsKey, defaultValue: '[]') as String;
    final tickets = json.decode(ticketsJson) as List<dynamic>;
    return tickets
        .map((e) => SupportTicket.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Get next order status for demo auto-advance
  String getNextStatus(String currentStatus, bool isDelivery) {
    final statusFlow = isDelivery
        ? [
            'placed',
            'accepted',
            'preparing',
            'ready',
            'out_for_delivery',
            'completed'
          ]
        : ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'completed'];

    final index = statusFlow.indexOf(currentStatus);
    if (index == -1 || index >= statusFlow.length - 1) return currentStatus;
    return statusFlow[index + 1];
  }
}

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepository();
});
