import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/providers/cart_provider.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../shared/widgets/demo_banner.dart';
import '../../../shared/widgets/empty_state.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final _promoController = TextEditingController();
  bool _isApplyingPromo = false;

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final restaurant = ref.watch(selectedRestaurantProvider);

    final params = (
      deliveryFee: restaurant?.deliveryFee ?? 2.99,
      serviceCharge: restaurant?.serviceCharge ?? 0.50,
      minimumOrder: restaurant?.minimumOrder ?? 10.0,
    );
    final totals = ref.watch(cartTotalsProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Cart'),
        actions: [
          if (cart.isNotEmpty)
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Clear Cart?'),
                    content: const Text('Remove all items from your cart?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).clearCart();
                          Navigator.pop(context);
                        },
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Clear'),
            ),
        ],
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: cart.isEmpty
                ? EmptyCartState(
                    onBrowseMenu: () => context.go(AppRoutes.menu),
                  )
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Restaurant info
                      if (restaurant != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius:
                                BorderRadius.circular(AppTheme.radiusMd),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Center(
                                  child: Text('🍛',
                                      style: TextStyle(fontSize: 24)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      restaurant.name,
                                      style: AppTheme.titleSmall,
                                    ),
                                    Text(
                                      '${restaurant.estimatedDeliveryMinutes} min delivery',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Cart items
                      ...cart.items.map((item) => _CartItemCard(
                            item: item,
                            onQuantityChanged: (qty) {
                              ref
                                  .read(cartProvider.notifier)
                                  .updateQuantity(item.id, qty);
                            },
                            onRemove: () {
                              ref
                                  .read(cartProvider.notifier)
                                  .removeItem(item.id);
                            },
                          )),

                      const SizedBox(height: 16),

                      // Promo code
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          border: Border.all(color: AppColors.surfaceVariant),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Promo Code',
                              style: AppTheme.titleSmall,
                            ),
                            const SizedBox(height: 12),
                            if (cart.promoCode.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.successLight,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.check_circle,
                                      color: AppColors.success,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            cart.promoCode,
                                            style: AppTheme.labelLarge.copyWith(
                                              color: AppColors.success,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Text(
                                            'Saving £${cart.promoDiscount.toStringAsFixed(2)}',
                                            style: AppTheme.bodySmall.copyWith(
                                              color: AppColors.success,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.close),
                                      onPressed: () {
                                        ref
                                            .read(cartProvider.notifier)
                                            .removePromoCode();
                                      },
                                    ),
                                  ],
                                ),
                              )
                            else
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _promoController,
                                      decoration: InputDecoration(
                                        hintText: 'Enter code',
                                        filled: true,
                                        fillColor: AppColors.surfaceVariant,
                                        border: OutlineInputBorder(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          borderSide: BorderSide.none,
                                        ),
                                        contentPadding:
                                            const EdgeInsets.symmetric(
                                          horizontal: 16,
                                          vertical: 12,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  ElevatedButton(
                                    onPressed: _isApplyingPromo
                                        ? null
                                        : () => _applyPromoCode(),
                                    child: _isApplyingPromo
                                        ? const SizedBox(
                                            width: 20,
                                            height: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                            ),
                                          )
                                        : const Text('Apply'),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Tips
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          border: Border.all(color: AppColors.surfaceVariant),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Add a tip',
                                  style: AppTheme.titleSmall,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '(optional)',
                                  style: AppTheme.bodySmall.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [0.0, 1.0, 2.0, 3.0, 5.0].map((tip) {
                                final isSelected = cart.tip == tip;
                                return GestureDetector(
                                  onTap: () {
                                    ref.read(cartProvider.notifier).setTip(tip);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 10,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppColors.primary
                                          : AppColors.surfaceVariant,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      tip == 0
                                          ? 'No tip'
                                          : '£${tip.toStringAsFixed(0)}',
                                      style: AppTheme.labelMedium.copyWith(
                                        color: isSelected
                                            ? Colors.white
                                            : AppColors.textPrimary,
                                        fontWeight: isSelected
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Order summary
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          border: Border.all(color: AppColors.surfaceVariant),
                        ),
                        child: Column(
                          children: [
                            _SummaryRow(
                              label: 'Subtotal',
                              value: '£${totals.subtotal.toStringAsFixed(2)}',
                            ),
                            _SummaryRow(
                              label: 'Delivery fee',
                              value:
                                  '£${totals.deliveryFee.toStringAsFixed(2)}',
                            ),
                            if (totals.serviceCharge > 0)
                              _SummaryRow(
                                label: 'Service charge',
                                value:
                                    '£${totals.serviceCharge.toStringAsFixed(2)}',
                              ),
                            if (totals.tip > 0)
                              _SummaryRow(
                                label: 'Tip',
                                value: '£${totals.tip.toStringAsFixed(2)}',
                              ),
                            if (totals.promoDiscount > 0)
                              _SummaryRow(
                                label: 'Discount',
                                value:
                                    '-£${totals.promoDiscount.toStringAsFixed(2)}',
                                valueColor: AppColors.success,
                              ),
                            const Divider(height: 24),
                            _SummaryRow(
                              label: 'Total',
                              value: '£${totals.total.toStringAsFixed(2)}',
                              isTotal: true,
                            ),
                          ],
                        ),
                      ),

                      // Minimum order warning
                      if (!totals.meetsMinimum) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.warningLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.info_outline,
                                color: AppColors.warning,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Add £${(totals.minimumOrder - totals.subtotal).toStringAsFixed(2)} more to reach the minimum order of £${totals.minimumOrder.toStringAsFixed(2)}',
                                  style: AppTheme.bodySmall.copyWith(
                                    color: AppColors.warning,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 100),
                    ],
                  ),
          ),
        ],
      ),
      bottomNavigationBar: cart.isNotEmpty
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: totals.meetsMinimum
                      ? () => context.push(AppRoutes.checkout)
                      : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text(
                    'Checkout  •  £${totals.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Future<void> _applyPromoCode() async {
    if (_promoController.text.isEmpty) return;

    setState(() => _isApplyingPromo = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    // Demo: Accept any code starting with specific patterns
    final code = _promoController.text.toUpperCase();
    double discount = 0;

    if (code.startsWith('WELCOME')) {
      discount = 5.0;
    } else if (code.contains('20')) {
      final cart = ref.read(cartProvider);
      discount = cart.subtotal * 0.2;
    } else if (code.contains('10')) {
      final cart = ref.read(cartProvider);
      discount = cart.subtotal * 0.1;
    } else {
      // Invalid code
      if (mounted) {
        setState(() => _isApplyingPromo = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Invalid promo code'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    ref.read(cartProvider.notifier).applyPromoCode(code, discount);
    _promoController.clear();

    if (mounted) {
      setState(() => _isApplyingPromo = false);
    }
  }
}

class _CartItemCard extends StatelessWidget {
  final dynamic item;
  final Function(int) onQuantityChanged;
  final VoidCallback onRemove;

  const _CartItemCard({
    required this.item,
    required this.onQuantityChanged,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text('🍛', style: TextStyle(fontSize: 32)),
              ),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          item.menuItem.name,
                          style: AppTheme.titleSmall,
                        ),
                      ),
                      Text(
                        '£${item.totalPrice.toStringAsFixed(2)}',
                        style: AppTheme.titleSmall.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  if (item.selectedModifiers.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.modifiersSummary,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                  if (item.specialInstructions.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Note: ${item.specialInstructions}',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textTertiary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Quantity controls
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              onPressed: () {
                                if (item.quantity > 1) {
                                  onQuantityChanged(item.quantity - 1);
                                } else {
                                  onRemove();
                                }
                              },
                              icon: Icon(
                                item.quantity > 1
                                    ? Icons.remove
                                    : Icons.delete_outline,
                                size: 18,
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 32,
                                minHeight: 32,
                              ),
                              padding: EdgeInsets.zero,
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                '${item.quantity}',
                                style: AppTheme.labelLarge,
                              ),
                            ),
                            IconButton(
                              onPressed: () =>
                                  onQuantityChanged(item.quantity + 1),
                              icon: const Icon(Icons.add, size: 18),
                              constraints: const BoxConstraints(
                                minWidth: 32,
                                minHeight: 32,
                              ),
                              padding: EdgeInsets.zero,
                            ),
                          ],
                        ),
                      ),
                      // Remove button
                      TextButton.icon(
                        onPressed: onRemove,
                        icon: const Icon(Icons.delete_outline, size: 18),
                        label: const Text('Remove'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isTotal = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? AppTheme.titleMedium
                : AppTheme.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
          ),
          Text(
            value,
            style: isTotal
                ? AppTheme.titleMedium.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  )
                : AppTheme.bodyMedium.copyWith(
                    color: valueColor ?? AppColors.textPrimary,
                  ),
          ),
        ],
      ),
    );
  }
}
