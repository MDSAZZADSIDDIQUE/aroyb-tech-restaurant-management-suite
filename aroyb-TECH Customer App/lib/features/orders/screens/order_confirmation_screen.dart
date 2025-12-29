import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/providers/order_provider.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../shared/widgets/demo_banner.dart';

class OrderConfirmationScreen extends ConsumerWidget {
  final String orderId;

  const OrderConfirmationScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(activeOrderProvider);
    final user = ref.watch(userProvider);

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Confirmation')),
        body: const Center(child: Text('Order not found')),
      );
    }

    return Scaffold(
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const SizedBox(height: 20),

                    // Success animation
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        gradient: AppColors.successGradient,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.success.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 60,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                          begin: const Offset(0.5, 0.5),
                          end: const Offset(1.0, 1.0),
                          duration: 400.ms,
                          curve: Curves.elasticOut,
                        ),

                    const SizedBox(height: 32),

                    Text(
                      'Order Placed!',
                      style: AppTheme.headlineMedium.copyWith(
                        color: AppColors.success,
                      ),
                    ).animate().fadeIn(delay: 200.ms, duration: 300.ms),

                    const SizedBox(height: 8),

                    Text(
                      'Order #${order.orderNumber}',
                      style: AppTheme.titleMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ).animate().fadeIn(delay: 300.ms, duration: 300.ms),

                    const SizedBox(height: 32),

                    // Estimated time
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.access_time,
                              color: AppColors.primary),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                order.isDelivery
                                    ? 'Estimated Delivery'
                                    : 'Ready for Pickup',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              Text(
                                order.estimatedDeliveryTime != null
                                    ? _formatTime(order.estimatedDeliveryTime!)
                                    : '~35 minutes',
                                style: AppTheme.titleLarge.copyWith(
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 400.ms, duration: 300.ms),

                    const SizedBox(height: 24),

                    // Loyalty points earned
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: AppColors.accentGradient,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.stars,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'You earned ${order.loyaltyPointsEarned} points!',
                                  style: AppTheme.titleSmall.copyWith(
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  'Total: ${user.loyaltyPoints} points',
                                  style: AppTheme.bodySmall.copyWith(
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => context.push(AppRoutes.loyalty),
                            child: Text(
                              'View Rewards',
                              style: AppTheme.labelMedium.copyWith(
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 500.ms, duration: 300.ms),

                    const SizedBox(height: 24),

                    // Referral prompt
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        border: Border.all(color: AppColors.surfaceVariant),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.card_giftcard,
                                  color: AppColors.secondary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Share with friends',
                                      style: AppTheme.titleSmall,
                                    ),
                                    Text(
                                      'They get £5 off, you get £5 off!',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceVariant,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    user.referralCode,
                                    style: AppTheme.titleSmall.copyWith(
                                      letterSpacing: 2,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              IconButton(
                                onPressed: () {
                                  Share.share(
                                    'Get £5 off your first order at Aroyb with my code: ${user.referralCode}',
                                  );
                                },
                                icon: const Icon(Icons.share),
                                style: IconButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 600.ms, duration: 300.ms),

                    const SizedBox(height: 32),

                    // Action buttons
                    ElevatedButton.icon(
                      onPressed: () => context.push(
                        '${AppRoutes.orderTracking}?orderId=${order.id}',
                      ),
                      icon: const Icon(Icons.location_on_outlined),
                      label: const Text('Track Order'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 52),
                      ),
                    ).animate().fadeIn(delay: 700.ms, duration: 300.ms),

                    const SizedBox(height: 12),

                    OutlinedButton(
                      onPressed: () => context.go(AppRoutes.home),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 52),
                      ),
                      child: const Text('Back to Home'),
                    ).animate().fadeIn(delay: 800.ms, duration: 300.ms),
                  ],
                ),
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
