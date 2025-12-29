import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../data/models/order.dart';
import '../../../domain/providers/cart_provider.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../domain/providers/order_provider.dart';
import '../../../shared/widgets/demo_banner.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _currentStep = 0;
  String _fulfillmentType = 'delivery';
  DeliveryAddress? _selectedAddress;
  DateTime _scheduledTime = DateTime.now().add(const Duration(minutes: 45));
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _instructionsController = TextEditingController();
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(userProvider);
      _nameController.text = user.name;
      _phoneController.text = user.phone;
      _selectedAddress = user.defaultAddress;
      setState(() {});
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final restaurant = ref.watch(selectedRestaurantProvider);
    final addresses = ref.watch(addressesProvider);

    final params = (
      deliveryFee: _fulfillmentType == 'delivery'
          ? (restaurant?.deliveryFee ?? 2.99)
          : 0.0,
      serviceCharge: restaurant?.serviceCharge ?? 0.0,
      minimumOrder: restaurant?.minimumOrder ?? 10.0,
    );
    final totals = ref.watch(cartTotalsProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: Stepper(
              currentStep: _currentStep,
              onStepContinue: () {
                if (_currentStep < 3) {
                  setState(() => _currentStep++);
                } else {
                  _placeOrder();
                }
              },
              onStepCancel: () {
                if (_currentStep > 0) {
                  setState(() => _currentStep--);
                }
              },
              onStepTapped: (step) => setState(() => _currentStep = step),
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed:
                            _isPlacingOrder ? null : details.onStepContinue,
                        child: _isPlacingOrder && _currentStep == 3
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(_currentStep == 3
                                ? 'Place Order (Demo)'
                                : 'Continue'),
                      ),
                      if (_currentStep > 0 && !_isPlacingOrder) ...[
                        const SizedBox(width: 12),
                        TextButton(
                          onPressed: details.onStepCancel,
                          child: const Text('Back'),
                        ),
                      ],
                    ],
                  ),
                );
              },
              steps: [
                // Step 1: Fulfillment Type
                Step(
                  title: const Text('Delivery Method'),
                  subtitle: Text(_fulfillmentType == 'delivery'
                      ? 'Delivery'
                      : 'Collection'),
                  isActive: _currentStep >= 0,
                  state:
                      _currentStep > 0 ? StepState.complete : StepState.indexed,
                  content: Column(
                    children: [
                      _FulfillmentOption(
                        title: 'Delivery',
                        subtitle:
                            '${restaurant?.estimatedDeliveryMinutes ?? 35} min  •  £${restaurant?.deliveryFee.toStringAsFixed(2) ?? '2.99'}',
                        icon: Icons.delivery_dining,
                        isSelected: _fulfillmentType == 'delivery',
                        onTap: () =>
                            setState(() => _fulfillmentType = 'delivery'),
                      ),
                      const SizedBox(height: 12),
                      _FulfillmentOption(
                        title: 'Collection',
                        subtitle:
                            '${restaurant?.estimatedCollectionMinutes ?? 15} min  •  Free',
                        icon: Icons.store,
                        isSelected: _fulfillmentType == 'collection',
                        onTap: () =>
                            setState(() => _fulfillmentType = 'collection'),
                      ),
                    ],
                  ),
                ),

                // Step 2: Address / Collection Point
                Step(
                  title: Text(_fulfillmentType == 'delivery'
                      ? 'Delivery Address'
                      : 'Collection Point'),
                  subtitle: Text(_fulfillmentType == 'delivery'
                      ? (_selectedAddress?.addressLine1 ?? 'Select address')
                      : restaurant?.address ?? ''),
                  isActive: _currentStep >= 1,
                  state:
                      _currentStep > 1 ? StepState.complete : StepState.indexed,
                  content: _fulfillmentType == 'delivery'
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ...addresses.map((addr) => _AddressOption(
                                  address: addr,
                                  isSelected: _selectedAddress?.id == addr.id,
                                  onTap: () =>
                                      setState(() => _selectedAddress = addr),
                                )),
                            const SizedBox(height: 12),
                            OutlinedButton.icon(
                              onPressed: () =>
                                  context.push(AppRoutes.addressForm),
                              icon: const Icon(Icons.add),
                              label: const Text('Add New Address'),
                            ),
                            // Smart delivery note prompts
                            if (_selectedAddress != null) ...[
                              const SizedBox(height: 16),
                              if (_selectedAddress!.mightNeedFlatNumber)
                                _SmartPrompt(
                                  icon: Icons.apartment,
                                  text: 'Add flat number?',
                                  onTap: () {},
                                ),
                              if (_selectedAddress!.mightNeedGateCode)
                                _SmartPrompt(
                                  icon: Icons.lock_outline,
                                  text: 'Add gate code?',
                                  onTap: () {},
                                ),
                            ],
                          ],
                        )
                      : Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.store,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          restaurant?.name ?? 'Restaurant',
                                          style: AppTheme.titleSmall,
                                        ),
                                        Text(
                                          restaurant?.address ?? '',
                                          style: AppTheme.bodySmall.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                ),

                // Step 3: Time & Contact
                Step(
                  title: const Text('Time & Contact'),
                  subtitle: Text('${_formatTime(_scheduledTime)}'),
                  isActive: _currentStep >= 2,
                  state:
                      _currentStep > 2 ? StepState.complete : StepState.indexed,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Delivery Time', style: AppTheme.titleSmall),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _TimeOption(
                            label: 'ASAP',
                            subtitle:
                                '~${restaurant?.estimatedDeliveryMinutes ?? 35} min',
                            isSelected: _scheduledTime
                                    .difference(DateTime.now())
                                    .inMinutes <
                                60,
                            onTap: () => setState(() {
                              _scheduledTime = DateTime.now()
                                  .add(const Duration(minutes: 45));
                            }),
                          ),
                          _TimeOption(
                            label: 'Later Today',
                            subtitle: 'Schedule',
                            isSelected: _scheduledTime
                                    .difference(DateTime.now())
                                    .inMinutes >=
                                60,
                            onTap: () async {
                              final time = await showTimePicker(
                                context: context,
                                initialTime:
                                    TimeOfDay.fromDateTime(_scheduledTime),
                              );
                              if (time != null) {
                                setState(() {
                                  _scheduledTime = DateTime(
                                    DateTime.now().year,
                                    DateTime.now().month,
                                    DateTime.now().day,
                                    time.hour,
                                    time.minute,
                                  );
                                });
                              }
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text('Contact Details', style: AppTheme.titleSmall),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Name',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Phone',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _instructionsController,
                        decoration: const InputDecoration(
                          labelText: 'Delivery Instructions (optional)',
                          prefixIcon: Icon(Icons.note_outlined),
                        ),
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),

                // Step 4: Review & Pay
                Step(
                  title: const Text('Review & Pay'),
                  subtitle: Text('Total: £${totals.total.toStringAsFixed(2)}'),
                  isActive: _currentStep >= 3,
                  state: StepState.indexed,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Order items summary
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Order Summary', style: AppTheme.titleSmall),
                            const SizedBox(height: 12),
                            ...cart.items.map((item) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    children: [
                                      Text('${item.quantity}x',
                                          style: AppTheme.labelLarge),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(item.menuItem.name)),
                                      Text(
                                          '£${item.totalPrice.toStringAsFixed(2)}'),
                                    ],
                                  ),
                                )),
                            const Divider(),
                            _SummaryRow('Subtotal',
                                '£${totals.subtotal.toStringAsFixed(2)}'),
                            if (_fulfillmentType == 'delivery')
                              _SummaryRow('Delivery',
                                  '£${totals.deliveryFee.toStringAsFixed(2)}'),
                            if (totals.tip > 0)
                              _SummaryRow(
                                  'Tip', '£${totals.tip.toStringAsFixed(2)}'),
                            if (totals.promoDiscount > 0)
                              _SummaryRow('Discount',
                                  '-£${totals.promoDiscount.toStringAsFixed(2)}',
                                  color: AppColors.success),
                            const Divider(),
                            _SummaryRow(
                                'Total', '£${totals.total.toStringAsFixed(2)}',
                                isBold: true),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Demo payment notice
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.infoLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline,
                                color: AppColors.info, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Demo Mode: No real payment will be processed',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.info,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
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

  Future<void> _placeOrder() async {
    if (_isPlacingOrder) return;

    setState(() => _isPlacingOrder = true);

    final cart = ref.read(cartProvider);
    final restaurant = ref.read(selectedRestaurantProvider);

    final params = (
      deliveryFee: _fulfillmentType == 'delivery'
          ? (restaurant?.deliveryFee ?? 2.99)
          : 0.0,
      serviceCharge: restaurant?.serviceCharge ?? 0.0,
      minimumOrder: restaurant?.minimumOrder ?? 10.0,
    );
    final totals = ref.read(cartTotalsProvider(params));

    try {
      // Create order
      final order = await ref.read(activeOrderProvider.notifier).createOrder(
            restaurantId: restaurant?.id ?? '',
            restaurantName: restaurant?.name ?? 'Aroyb Grill & Curry',
            items: cart.items,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            serviceCharge: totals.serviceCharge,
            tip: totals.tip,
            discount: totals.promoDiscount,
            total: totals.total,
            fulfillmentType: _fulfillmentType,
            deliveryAddress: _selectedAddress,
            scheduledTime: _scheduledTime,
            contactName: _nameController.text,
            contactPhone: _phoneController.text,
            specialInstructions: _instructionsController.text,
          );

      // Update user stats
      await ref.read(userProvider.notifier).updateAfterOrder(totals.total);
      await ref
          .read(userProvider.notifier)
          .addLoyaltyPoints(totals.total.floor());

      // Clear cart
      await ref.read(cartProvider.notifier).clearCart();

      // Navigate to confirmation
      if (mounted) {
        context.go('${AppRoutes.orderConfirmation}?orderId=${order.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPlacingOrder = false);
      }
    }
  }
}

class _FulfillmentOption extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _FulfillmentOption({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.1)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color:
                    isSelected ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTheme.titleSmall),
                  Text(subtitle,
                      style: AppTheme.bodySmall
                          .copyWith(color: AppColors.textSecondary)),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _AddressOption extends StatelessWidget {
  final DeliveryAddress address;
  final bool isSelected;
  final VoidCallback onTap;

  const _AddressOption({
    required this.address,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.1)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(
              address.label == 'Home'
                  ? Icons.home_outlined
                  : Icons.work_outlined,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(address.label, style: AppTheme.labelLarge),
                  Text(
                    address.fullAddress,
                    style: AppTheme.bodySmall
                        .copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle,
                  color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}

class _TimeOption extends StatelessWidget {
  final String label;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _TimeOption({
    required this.label,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: AppTheme.labelLarge.copyWith(
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
            ),
            Text(
              subtitle,
              style: AppTheme.labelSmall.copyWith(
                color: isSelected ? Colors.white70 : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SmartPrompt extends StatelessWidget {
  final IconData icon;
  final String text;
  final VoidCallback onTap;

  const _SmartPrompt({
    required this.icon,
    required this.text,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.secondary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.secondary, size: 18),
            const SizedBox(width: 8),
            Text(
              text,
              style: AppTheme.bodySmall.copyWith(color: AppColors.secondary),
            ),
            const Spacer(),
            Icon(Icons.add_circle_outline,
                color: AppColors.secondary, size: 18),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  final bool isBold;

  const _SummaryRow(this.label, this.value, {this.color, this.isBold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: isBold ? AppTheme.titleSmall : AppTheme.bodySmall),
          Text(
            value,
            style: (isBold ? AppTheme.titleSmall : AppTheme.bodySmall).copyWith(
              color: color ?? (isBold ? AppColors.primary : null),
              fontWeight: isBold ? FontWeight.bold : null,
            ),
          ),
        ],
      ),
    );
  }
}
