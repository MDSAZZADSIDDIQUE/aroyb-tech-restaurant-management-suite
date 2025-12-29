import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/notification.dart';

/// Repository for managing notifications
class NotificationRepository {
  static const _boxName = 'notifications_data';
  static const _notificationsKey = 'notifications';
  static const _pushEnabledKey = 'push_enabled';

  Box get _box => Hive.box(_boxName);

  /// Get all notifications
  List<AppNotification> getNotifications() {
    final notificationsJson =
        _box.get(_notificationsKey, defaultValue: '[]') as String;
    final notifications = json.decode(notificationsJson) as List<dynamic>;
    return notifications
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  /// Get unread notifications count
  int getUnreadCount() {
    return getNotifications().where((n) => !n.isRead).length;
  }

  /// Add notification
  Future<AppNotification> addNotification({
    required String title,
    required String body,
    required String type,
    String? orderId,
    String? imageUrl,
    Map<String, dynamic>? data,
  }) async {
    final uuid = const Uuid();
    final notification = AppNotification(
      id: uuid.v4(),
      title: title,
      body: body,
      type: type,
      orderId: orderId,
      imageUrl: imageUrl,
      data: data,
      createdAt: DateTime.now(),
    );

    final notifications = getNotifications();
    notifications.insert(0, notification);

    // Keep only last 50 notifications
    final trimmed = notifications.take(50).toList();
    await _box.put(_notificationsKey,
        json.encode(trimmed.map((e) => e.toJson()).toList()));

    return notification;
  }

  /// Add order status notification
  Future<AppNotification> addOrderStatusNotification({
    required String orderId,
    required String orderNumber,
    required String status,
    required String statusDescription,
  }) async {
    return addNotification(
      title: 'Order #$orderNumber',
      body: statusDescription,
      type: 'order_status',
      orderId: orderId,
    );
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    final notifications = getNotifications();
    final index = notifications.indexWhere((n) => n.id == notificationId);
    if (index == -1) return;

    notifications[index] = notifications[index].copyWith(isRead: true);
    await _box.put(_notificationsKey,
        json.encode(notifications.map((e) => e.toJson()).toList()));
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    final notifications = getNotifications();
    final updated = notifications.map((n) => n.copyWith(isRead: true)).toList();
    await _box.put(_notificationsKey,
        json.encode(updated.map((e) => e.toJson()).toList()));
  }

  /// Delete notification
  Future<void> deleteNotification(String notificationId) async {
    final notifications = getNotifications();
    final filtered =
        notifications.where((n) => n.id != notificationId).toList();
    await _box.put(_notificationsKey,
        json.encode(filtered.map((e) => e.toJson()).toList()));
  }

  /// Clear all notifications
  Future<void> clearAll() async {
    await _box.put(_notificationsKey, '[]');
  }

  /// Get push enabled status
  bool isPushEnabled() {
    return _box.get(_pushEnabledKey, defaultValue: false) as bool;
  }

  /// Set push enabled status
  Future<void> setPushEnabled(bool enabled) async {
    await _box.put(_pushEnabledKey, enabled);
  }

  /// Add demo marketing notifications
  Future<void> addDemoMarketingNotifications() async {
    await addNotification(
      title: '🔥 Weekend Special!',
      body: 'Get 20% off all grills this weekend. Use code GRILL20',
      type: 'marketing',
    );

    await addNotification(
      title: '⭐ You\'ve earned points!',
      body: 'You have 250 loyalty points. Redeem them for free items!',
      type: 'loyalty',
    );

    await addNotification(
      title: '🎉 Refer a friend',
      body: 'Share your code JOHN2024 and both get £5 off!',
      type: 'referral',
    );
  }
}

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});
