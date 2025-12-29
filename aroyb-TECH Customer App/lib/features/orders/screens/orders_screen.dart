import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/models/order.dart';
import '../../../domain/providers/order_provider.dart';
import '../../../domain/providers/cart_provider.dart';
import '../../../shared/widgets/empty_state.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeOrder = ref.watch(activeOrderProvider);
    final orders = ref.watch(ordersProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Orders'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Active'),
              Tab(text: 'Past Orders'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Active Order Tab
            activeOrder != null && activeOrder.isActive
                ? _ActiveOrderView(order: activeOrder)
                : Center(
                    child: EmptyState(
                      icon: Icons.receipt_long_outlined,
                      title: 'No Active Orders',
                      subtitle: 'Your current orders will appear here',
                      actionLabel: 'Browse Menu',
                      onAction: () => context.go(AppRoutes.menu),
                    ),
                  ),

            // Past Orders Tab
            orders.isEmpty
                ? EmptyOrdersState(onOrderNow: () => context.go(AppRoutes.menu))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: orders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _OrderCard(
                        order: order,
                        onTap: () => context.push(
                          '${AppRoutes.orderTracking}?orderId=${order.id}',
                        ),
                        onReorder: () => _reorder(context, ref, order),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  void _reorder(BuildContext context, WidgetRef ref, Order order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reorder'),
        content: const Text('Add all items from this order to your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(cartProvider.notifier).reorder(order.items);
              Navigator.pop(context);
              context.push(AppRoutes.cart);
            },
            child: const Text('Add to Cart'),
          ),
        ],
      ),
    );
  }
}

class _ActiveOrderView extends StatelessWidget {
  final Order order;

  const _ActiveOrderView({required this.order});

  @override
  Widget build(BuildContext context) {
    final status = order.orderStatus;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Status card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  status.color.withOpacity(0.1),
                  status.color.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
              border: Border.all(color: status.color.withOpacity(0.2)),
            ),
            child: Column(
              children: [
                Icon(
                  status.icon,
                  size: 64,
                  color: status.color,
                ),
                const SizedBox(height: 16),
                Text(
                  status.displayName,
                  style: AppTheme.headlineSmall.copyWith(
                    color: status.color,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  status.description,
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                if (order.estimatedDeliveryTime != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.access_time, size: 16, color: status.color),
                        const SizedBox(width: 8),
                        Text(
                          'Est. ${_formatTime(order.estimatedDeliveryTime!)}',
                          style: AppTheme.labelLarge.copyWith(
                            color: status.color,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Order progress
          _OrderProgress(order: order),

          const SizedBox(height: 24),

          // Order details
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Order #${order.orderNumber}',
                        style: AppTheme.titleSmall),
                    Text(
                      '£${order.total.toStringAsFixed(2)}',
                      style: AppTheme.titleSmall.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),
                ...order.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Text('${item.quantity}x',
                              style: AppTheme.labelMedium),
                          const SizedBox(width: 8),
                          Expanded(child: Text(item.menuItem.name)),
                        ],
                      ),
                    )),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push(
                    '${AppRoutes.issueAssistant}?orderId=${order.id}',
                  ),
                  icon: const Icon(Icons.support_agent),
                  label: const Text('Report Issue'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.push(
                    '${AppRoutes.orderTracking}?orderId=${order.id}',
                  ),
                  icon: const Icon(Icons.map_outlined),
                  label: const Text('Track Order'),
                ),
              ),
            ],
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

class _OrderProgress extends StatelessWidget {
  final Order order;

  const _OrderProgress({required this.order});

  @override
  Widget build(BuildContext context) {
    final steps = order.isDelivery
        ? ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered']
        : ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Collected'];

    final statusMap = order.isDelivery
        ? {
            'placed': 0,
            'accepted': 1,
            'preparing': 2,
            'ready': 2,
            'out_for_delivery': 3,
            'completed': 4
          }
        : {
            'placed': 0,
            'accepted': 1,
            'preparing': 2,
            'ready_for_pickup': 3,
            'completed': 4
          };

    final currentIndex = statusMap[order.status] ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        children: List.generate(steps.length, (index) {
          final isCompleted = index <= currentIndex;
          final isCurrent = index == currentIndex;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? AppColors.primary
                          : AppColors.surfaceVariant,
                      shape: BoxShape.circle,
                    ),
                    child: isCompleted
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : null,
                  ),
                  if (index < steps.length - 1)
                    Container(
                      width: 2,
                      height: 32,
                      color: isCompleted
                          ? AppColors.primary
                          : AppColors.surfaceVariant,
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        steps[index],
                        style: AppTheme.labelLarge.copyWith(
                          color: isCurrent
                              ? AppColors.primary
                              : (isCompleted
                                  ? AppColors.textPrimary
                                  : AppColors.textTertiary),
                          fontWeight:
                              isCurrent ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      if (isCurrent && order.statusHistory.isNotEmpty)
                        Text(
                          _formatTimeAgo(order.statusHistory.last.timestamp),
                          style: AppTheme.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  String _formatTimeAgo(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    return '${diff.inHours}h ago';
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;
  final VoidCallback onReorder;

  const _OrderCard({
    required this.order,
    required this.onTap,
    required this.onReorder,
  });

  @override
  Widget build(BuildContext context) {
    final status = order.orderStatus;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(order.restaurantName, style: AppTheme.titleSmall),
                      const SizedBox(height: 4),
                      Text(
                        'Order #${order.orderNumber}',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: status.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      status.displayName,
                      style: AppTheme.labelSmall.copyWith(
                        color: status.color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              // Items preview
              Text(
                order.items
                    .map((i) => '${i.quantity}x ${i.menuItem.name}')
                    .join(', '),
                style:
                    AppTheme.bodySmall.copyWith(color: AppColors.textSecondary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatDate(order.createdAt),
                    style: AppTheme.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        '£${order.total.toStringAsFixed(2)}',
                        style: AppTheme.titleSmall.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      if (order.isCompleted)
                        TextButton.icon(
                          onPressed: onReorder,
                          icon: const Icon(Icons.replay, size: 16),
                          label: const Text('Reorder'),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';

    return '${date.day}/${date.month}/${date.year}';
  }
}
