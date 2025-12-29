import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/order.dart';
import '../../data/models/cart_item.dart';
import '../../data/repositories/order_repository.dart';
import '../../data/repositories/notification_repository.dart';
import '../../core/constants/app_constants.dart';

/// Active order state notifier with auto-advancing status
class ActiveOrderNotifier extends StateNotifier<Order?> {
  final OrderRepository _orderRepository;
  final NotificationRepository _notificationRepository;
  Timer? _statusTimer;

  ActiveOrderNotifier(this._orderRepository, this._notificationRepository)
      : super(null) {
    _loadActiveOrder();
  }

  void _loadActiveOrder() {
    state = _orderRepository.getActiveOrder();
    if (state != null && state!.isActive) {
      _startStatusTimer();
    }
  }

  void _startStatusTimer() {
    _statusTimer?.cancel();
    _statusTimer = Timer.periodic(
      AppConstants.orderStatusAdvanceInterval,
      (_) => _advanceStatus(),
    );
  }

  Future<void> _advanceStatus() async {
    if (state == null || state!.isCompleted) {
      _statusTimer?.cancel();
      return;
    }

    final nextStatus = _orderRepository.getNextStatus(
      state!.status,
      state!.isDelivery,
    );

    if (nextStatus != state!.status) {
      final updatedOrder = await _orderRepository.updateOrderStatus(
        state!.id,
        nextStatus,
      );

      if (updatedOrder != null) {
        state = updatedOrder;

        // Add notification for status change
        final statusEnum = updatedOrder.orderStatus;
        await _notificationRepository.addOrderStatusNotification(
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: nextStatus,
          statusDescription: statusEnum.description,
        );
      }

      if (nextStatus == 'completed') {
        _statusTimer?.cancel();
      }
    }
  }

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
    final order = await _orderRepository.createOrder(
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
      contactName: contactName,
      contactPhone: contactPhone,
      specialInstructions: specialInstructions,
      appliedReferralCode: appliedReferralCode,
    );

    state = order;

    // Add order placed notification
    await _notificationRepository.addOrderStatusNotification(
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'placed',
      statusDescription: 'Your order has been placed successfully!',
    );

    _startStatusTimer();
    return order;
  }

  void setActiveOrder(Order order) {
    state = order;
    if (order.isActive) {
      _startStatusTimer();
    }
  }

  void clearActiveOrder() {
    _statusTimer?.cancel();
    _orderRepository.clearActiveOrder();
    state = null;
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }
}

final activeOrderProvider =
    StateNotifierProvider<ActiveOrderNotifier, Order?>((ref) {
  final orderRepo = ref.watch(orderRepositoryProvider);
  final notificationRepo = ref.watch(notificationRepositoryProvider);
  return ActiveOrderNotifier(orderRepo, notificationRepo);
});

/// All orders provider
final ordersProvider = Provider<List<Order>>((ref) {
  final orderRepo = ref.watch(orderRepositoryProvider);
  return orderRepo.getOrders();
});

/// Recent orders for reorder
final recentOrdersProvider = Provider<List<Order>>((ref) {
  final orderRepo = ref.watch(orderRepositoryProvider);
  return orderRepo.getRecentOrders(limit: 5);
});
