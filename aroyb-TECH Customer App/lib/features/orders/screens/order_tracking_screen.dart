import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/providers/order_provider.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../shared/widgets/demo_banner.dart';

class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(activeOrderProvider);
    final orderRepo = ref.watch(orderRepositoryProvider);

    if (order == null) {
      // Try to find from order history
      final historicOrder = orderRepo.getOrderById(orderId);
      if (historicOrder == null) {
        return Scaffold(
          appBar: AppBar(title: const Text('Order Tracking')),
          body: const Center(child: Text('Order not found')),
        );
      }
    }

    final displayOrder = order ?? orderRepo.getOrderById(orderId)!;
    final status = displayOrder.orderStatus;

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${displayOrder.orderNumber}'),
        actions: [
          IconButton(
            onPressed: () {
              // Call restaurant (demo)
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Demo: Would call restaurant')),
              );
            },
            icon: const Icon(Icons.phone_outlined),
          ),
        ],
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Map placeholder
                  Container(
                    height: 250,
                    width: double.infinity,
                    color: AppColors.surfaceVariant,
                    child: Stack(
                      children: [
                        Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.map_outlined,
                                size: 48,
                                color: AppColors.textTertiary,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Live Map (Demo)',
                                style: AppTheme.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                displayOrder.isDelivery
                                    ? 'Driver location would appear here'
                                    : 'Restaurant location',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Demo: Simulated driver marker
                        if (displayOrder.status == 'out_for_delivery')
                          Positioned(
                            left: MediaQuery.of(context).size.width * 0.4,
                            top: 100,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withOpacity(0.3),
                                    blurRadius: 10,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.delivery_dining,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Status card
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: status.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      border: Border.all(color: status.color.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: status.color.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child:
                              Icon(status.icon, color: status.color, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                status.displayName,
                                style: AppTheme.titleMedium.copyWith(
                                  color: status.color,
                                ),
                              ),
                              Text(
                                status.description,
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (displayOrder.estimatedDeliveryTime != null)
                          Column(
                            children: [
                              Text(
                                _formatTime(
                                    displayOrder.estimatedDeliveryTime!),
                                style: AppTheme.titleLarge.copyWith(
                                  color: status.color,
                                ),
                              ),
                              Text(
                                'ETA',
                                style: AppTheme.labelSmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),

                  // Status timeline
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _StatusTimeline(order: displayOrder),
                  ),

                  const SizedBox(height: 16),

                  // Order details
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      border: Border.all(color: AppColors.surfaceVariant),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Order Details', style: AppTheme.titleSmall),
                        const Divider(height: 24),
                        _DetailRow(
                          icon: Icons.store_outlined,
                          label: 'Restaurant',
                          value: displayOrder.restaurantName,
                        ),
                        _DetailRow(
                          icon: displayOrder.isDelivery
                              ? Icons.location_on_outlined
                              : Icons.store_outlined,
                          label: displayOrder.isDelivery
                              ? 'Deliver to'
                              : 'Collect from',
                          value: displayOrder.isDelivery
                              ? displayOrder.deliveryAddress?.fullAddress ??
                                  'N/A'
                              : displayOrder.restaurantName,
                        ),
                        _DetailRow(
                          icon: Icons.person_outline,
                          label: 'Contact',
                          value: displayOrder.contactName,
                        ),
                        const Divider(height: 24),
                        ...displayOrder.items.map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceVariant,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Center(
                                      child: Text(
                                        '${item.quantity}',
                                        style: AppTheme.labelSmall,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(child: Text(item.menuItem.name)),
                                  Text(
                                      '£${item.totalPrice.toStringAsFixed(2)}'),
                                ],
                              ),
                            )),
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total', style: AppTheme.titleSmall),
                            Text(
                              '£${displayOrder.total.toStringAsFixed(2)}',
                              style: AppTheme.titleSmall.copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Report issue button
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: OutlinedButton.icon(
                      onPressed: () => context.push(
                        '${AppRoutes.issueAssistant}?orderId=${displayOrder.id}',
                      ),
                      icon: const Icon(Icons.support_agent),
                      label: const Text('Report an Issue'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

class _StatusTimeline extends StatelessWidget {
  final dynamic order;

  const _StatusTimeline({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Status History', style: AppTheme.titleSmall),
          const SizedBox(height: 16),
          ...order.statusHistory.reversed.take(5).map<Widget>((update) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          update.status.replaceAll('_', ' ').toUpperCase(),
                          style: AppTheme.labelMedium,
                        ),
                        if (update.note != null)
                          Text(
                            update.note!,
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Text(
                    _formatTimeAgo(update.timestamp),
                    style: AppTheme.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    return '${diff.inHours}h ago';
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTheme.labelSmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              Text(value, style: AppTheme.bodyMedium),
            ],
          ),
        ],
      ),
    );
  }
}
