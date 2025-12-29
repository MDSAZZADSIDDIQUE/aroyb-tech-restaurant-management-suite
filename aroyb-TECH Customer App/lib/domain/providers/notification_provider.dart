import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/notification.dart';
import '../../data/repositories/notification_repository.dart';

/// Notifications state notifier
class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  final NotificationRepository _repository;

  NotificationsNotifier(this._repository) : super([]) {
    _loadNotifications();
  }

  void _loadNotifications() {
    state = _repository.getNotifications();
  }

  Future<void> addNotification({
    required String title,
    required String body,
    required String type,
    String? orderId,
    String? imageUrl,
    Map<String, dynamic>? data,
  }) async {
    await _repository.addNotification(
      title: title,
      body: body,
      type: type,
      orderId: orderId,
      imageUrl: imageUrl,
      data: data,
    );
    _loadNotifications();
  }

  Future<void> markAsRead(String notificationId) async {
    await _repository.markAsRead(notificationId);
    _loadNotifications();
  }

  Future<void> markAllAsRead() async {
    await _repository.markAllAsRead();
    _loadNotifications();
  }

  Future<void> deleteNotification(String notificationId) async {
    await _repository.deleteNotification(notificationId);
    _loadNotifications();
  }

  Future<void> clearAll() async {
    await _repository.clearAll();
    _loadNotifications();
  }

  Future<void> addDemoNotifications() async {
    await _repository.addDemoMarketingNotifications();
    _loadNotifications();
  }

  void refresh() {
    _loadNotifications();
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, List<AppNotification>>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return NotificationsNotifier(repository);
});

/// Unread notifications count provider
final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => !n.isRead).length;
});

/// Push enabled state provider
final pushEnabledProvider = StateProvider<bool>((ref) {
  final repository = ref.watch(notificationRepositoryProvider);
  return repository.isPushEnabled();
});

/// Alias for unreadNotificationsCountProvider for convenience
final unreadCountProvider = unreadNotificationsCountProvider;
