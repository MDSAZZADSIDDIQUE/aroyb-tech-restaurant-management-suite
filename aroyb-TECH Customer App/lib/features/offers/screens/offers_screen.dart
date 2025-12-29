import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/providers/offers_provider.dart';
import '../../../domain/providers/cart_provider.dart';
import '../../../shared/widgets/demo_banner.dart';

class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offersAsync = ref.watch(allOffersProvider);
    final personalizedAsync = ref.watch(personalizedOffersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Special Offers'),
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
                  // Personalized offers section
                  personalizedAsync.when(
                    data: (offers) => offers.isNotEmpty
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      gradient: AppColors.accentGradient,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.auto_awesome,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('Just for You',
                                          style: AppTheme.titleLarge),
                                      Text(
                                        'Personalized offers based on your habits',
                                        style: AppTheme.bodySmall.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              ...offers.map((offer) => _OfferCard(
                                    offer: offer,
                                    isPersonalized: true,
                                    onApply: () =>
                                        _applyOffer(context, ref, offer),
                                  )),
                              const SizedBox(height: 24),
                            ],
                          )
                        : const SizedBox.shrink(),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),

                  // All offers
                  Text('All Offers', style: AppTheme.titleLarge),
                  const SizedBox(height: 16),

                  offersAsync.when(
                    data: (offers) => Column(
                      children: offers
                          .map((offer) => _OfferCard(
                                offer: offer,
                                onApply: () => _applyOffer(context, ref, offer),
                              ))
                          .toList(),
                    ),
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Error: $e'),
                  ),

                  const SizedBox(height: 24),

                  // Enter promo code
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Have a promo code?', style: AppTheme.titleSmall),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                decoration: const InputDecoration(
                                  hintText: 'Enter code',
                                  filled: true,
                                  fillColor: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Add items to cart first, then apply code at checkout'),
                                  ),
                                );
                              },
                              child: const Text('Apply'),
                            ),
                          ],
                        ),
                      ],
                    ),
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

  void _applyOffer(BuildContext context, WidgetRef ref, dynamic offer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(offer.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(offer.description),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    offer.code,
                    style: AppTheme.titleMedium.copyWith(
                      letterSpacing: 2,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.copy, size: 18),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Code copied!')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Min. order: £${offer.minimumOrder.toStringAsFixed(2)}',
              style:
                  AppTheme.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              final cart = ref.read(cartProvider);
              if (cart.isEmpty) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Add items to cart first')),
                );
              } else {
                final discount = offer.discountPercentage > 0
                    ? cart.subtotal * (offer.discountPercentage / 100)
                    : offer.discountAmount;
                ref
                    .read(cartProvider.notifier)
                    .applyPromoCode(offer.code, discount);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${offer.code} applied!'),
                    backgroundColor: AppColors.success,
                  ),
                );
              }
            },
            child: const Text('Apply to Cart'),
          ),
        ],
      ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  final dynamic offer;
  final bool isPersonalized;
  final VoidCallback onApply;

  const _OfferCard({
    required this.offer,
    this.isPersonalized = false,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: isPersonalized ? AppColors.primaryGradient : null,
        color: isPersonalized ? null : AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border:
            isPersonalized ? null : Border.all(color: AppColors.surfaceVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: isPersonalized
                    ? Colors.white.withOpacity(0.2)
                    : AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  offer.discountText.replaceAll(' OFF', ''),
                  style: AppTheme.titleSmall.copyWith(
                    color: isPersonalized ? Colors.white : AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    offer.title,
                    style: AppTheme.titleSmall.copyWith(
                      color:
                          isPersonalized ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    offer.description,
                    style: AppTheme.bodySmall.copyWith(
                      color: isPersonalized
                          ? Colors.white70
                          : AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (isPersonalized && offer.targetingReason != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.auto_awesome,
                          size: 12,
                          color: Colors.white60,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            offer.targetingReason!,
                            style: AppTheme.labelSmall.copyWith(
                              color: Colors.white60,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: onApply,
              style: isPersonalized
                  ? ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                    )
                  : null,
              child: const Text('Use'),
            ),
          ],
        ),
      ),
    );
  }
}
