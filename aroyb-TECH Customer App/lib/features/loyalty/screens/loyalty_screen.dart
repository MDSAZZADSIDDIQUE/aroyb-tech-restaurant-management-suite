import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../domain/providers/offers_provider.dart';
import '../../../shared/widgets/demo_banner.dart';

class LoyaltyScreen extends ConsumerWidget {
  const LoyaltyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final rewardsAsync = ref.watch(allRewardsProvider);
    final availableRewardsAsync = ref.watch(availableRewardsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Loyalty Rewards'),
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Points card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.stars, color: Colors.white, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          '${user.loyaltyPoints}',
                          style: AppTheme.headlineLarge.copyWith(
                            color: Colors.white,
                            fontSize: 48,
                          ),
                        ),
                        Text(
                          'Loyalty Points',
                          style: AppTheme.titleMedium.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '1 point = £1 spent',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.white60,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Stamp card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      border: Border.all(color: AppColors.surfaceVariant),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Stamp Card', style: AppTheme.titleMedium),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.accent.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${user.loyaltyStamps}/10',
                                style: AppTheme.labelMedium.copyWith(
                                  color: AppColors.accent,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: List.generate(10, (index) {
                            final hasStamp = index < user.loyaltyStamps;
                            return Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: hasStamp
                                    ? AppColors.accent
                                    : AppColors.surfaceVariant,
                                shape: BoxShape.circle,
                              ),
                              child: hasStamp
                                  ? const Icon(Icons.check,
                                      color: Colors.white, size: 16)
                                  : null,
                            );
                          }),
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: Text(
                            user.loyaltyStamps >= 10
                                ? 'Claim your free meal!'
                                : '${10 - user.loyaltyStamps} more stamps to free meal',
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Available rewards
                  Text('Available Rewards', style: AppTheme.titleLarge),
                  const SizedBox(height: 12),

                  availableRewardsAsync.when(
                    data: (rewards) => rewards.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius:
                                  BorderRadius.circular(AppTheme.radiusMd),
                            ),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(Icons.lock_outline,
                                      size: 48, color: AppColors.textTertiary),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Keep earning points to unlock rewards!',
                                    style: AppTheme.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : Column(
                            children: rewards
                                .map((reward) => _RewardCard(
                                      reward: reward,
                                      canRedeem: true,
                                      onRedeem: () =>
                                          _redeemReward(context, ref, reward),
                                    ))
                                .toList(),
                          ),
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Error: $e'),
                  ),

                  const SizedBox(height: 24),

                  // All rewards
                  Text('All Rewards', style: AppTheme.titleLarge),
                  const SizedBox(height: 12),

                  rewardsAsync.when(
                    data: (rewards) => Column(
                      children: rewards.map((reward) {
                        final canRedeem = (reward.isPointsReward &&
                                user.loyaltyPoints >= reward.pointsCost) ||
                            (reward.isStampsReward &&
                                user.loyaltyStamps >= reward.stampsCost);
                        return _RewardCard(
                          reward: reward,
                          canRedeem: canRedeem,
                          onRedeem: canRedeem
                              ? () => _redeemReward(context, ref, reward)
                              : null,
                        );
                      }).toList(),
                    ),
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Error: $e'),
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _redeemReward(BuildContext context, WidgetRef ref, dynamic reward) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Redeem Reward'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Redeem "${reward.title}"?'),
            const SizedBox(height: 8),
            Text(
              reward.isPointsReward
                  ? 'This will use ${reward.pointsCost} points'
                  : 'This will use ${reward.stampsCost} stamps',
              style:
                  AppTheme.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Deduct points/stamps
              if (reward.isPointsReward) {
                await ref
                    .read(userProvider.notifier)
                    .spendLoyaltyPoints(reward.pointsCost);
              } else {
                await ref
                    .read(userProvider.notifier)
                    .spendLoyaltyStamps(reward.stampsCost);
              }

              Navigator.pop(context);

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Reward "${reward.title}" redeemed!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Redeem'),
          ),
        ],
      ),
    );
  }
}

class _RewardCard extends StatelessWidget {
  final dynamic reward;
  final bool canRedeem;
  final VoidCallback? onRedeem;

  const _RewardCard({
    required this.reward,
    required this.canRedeem,
    this.onRedeem,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: canRedeem
              ? AppColors.primary.withOpacity(0.3)
              : AppColors.surfaceVariant,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: canRedeem
                  ? AppColors.primary.withOpacity(0.1)
                  : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getRewardIcon(reward.rewardType),
              color: canRedeem ? AppColors.primary : AppColors.textTertiary,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reward.title,
                  style: AppTheme.titleSmall.copyWith(
                    color: canRedeem
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  ),
                ),
                Text(
                  reward.description,
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  reward.isPointsReward
                      ? '${reward.pointsCost} points'
                      : '${reward.stampsCost} stamps',
                  style: AppTheme.labelMedium.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          if (canRedeem)
            ElevatedButton(
              onPressed: onRedeem,
              style: ElevatedButton.styleFrom(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              child: const Text('Redeem'),
            )
          else
            Icon(Icons.lock_outline, color: AppColors.textTertiary),
        ],
      ),
    );
  }

  IconData _getRewardIcon(String type) {
    switch (type) {
      case 'free_item':
        return Icons.fastfood;
      case 'discount':
        return Icons.local_offer;
      case 'free_delivery':
        return Icons.delivery_dining;
      default:
        return Icons.card_giftcard;
    }
  }
}
