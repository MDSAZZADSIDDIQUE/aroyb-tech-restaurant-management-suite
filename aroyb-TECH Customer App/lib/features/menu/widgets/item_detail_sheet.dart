import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/menu_item.dart';
import '../../../data/models/cart_item.dart';
import '../../../domain/providers/cart_provider.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../shared/widgets/dietary_chips.dart';

class ItemDetailSheet extends ConsumerStatefulWidget {
  final MenuItem item;

  const ItemDetailSheet({super.key, required this.item});

  @override
  ConsumerState<ItemDetailSheet> createState() => _ItemDetailSheetState();
}

class _ItemDetailSheetState extends ConsumerState<ItemDetailSheet> {
  int _quantity = 1;
  int _selectedSpiceLevel = 0;
  final Map<String, List<String>> _selectedModifiers = {};
  final _instructionsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedSpiceLevel = widget.item.spiceLevel;

    // Initialize default modifiers
    for (final group in widget.item.modifierGroups) {
      _selectedModifiers[group.id] = [];
      for (final modifier in group.modifiers) {
        if (modifier.isDefault) {
          _selectedModifiers[group.id]!.add(modifier.id);
        }
      }
    }
  }

  @override
  void dispose() {
    _instructionsController.dispose();
    super.dispose();
  }

  double get _totalPrice {
    double price = widget.item.price;

    for (final group in widget.item.modifierGroups) {
      for (final modifier in group.modifiers) {
        if (_selectedModifiers[group.id]?.contains(modifier.id) ?? false) {
          price += modifier.price;
        }
      }
    }

    return price * _quantity;
  }

  bool get _isValid {
    for (final group in widget.item.modifierGroups) {
      if (group.isRequired) {
        final selected = _selectedModifiers[group.id]?.length ?? 0;
        if (selected < group.minSelections) return false;
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final isFavourite =
        ref.watch(userProvider).favouriteItemIds.contains(widget.item.id);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius:
            BorderRadius.vertical(top: Radius.circular(AppTheme.radiusXl)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textTertiary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image and favourite
                  Stack(
                    children: [
                      Hero(
                        tag: 'menu_item_${widget.item.id}',
                        child: Container(
                          height: 180,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius:
                                BorderRadius.circular(AppTheme.radiusLg),
                          ),
                          child: Center(
                            child: Text(
                              _getItemEmoji(widget.item.categoryId),
                              style: const TextStyle(fontSize: 80),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 12,
                        right: 12,
                        child: GestureDetector(
                          onTap: () {
                            ref
                                .read(userProvider.notifier)
                                .toggleFavourite(widget.item.id);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: Icon(
                              isFavourite
                                  ? Icons.favorite
                                  : Icons.favorite_border,
                              color: isFavourite
                                  ? AppColors.error
                                  : AppColors.textSecondary,
                              size: 24,
                            ),
                          ),
                        ),
                      ),
                      if (widget.item.isPopular)
                        Positioned(
                          top: 12,
                          left: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star,
                                    size: 14, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  'Popular',
                                  style: AppTheme.labelSmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Name and price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          widget.item.name,
                          style: AppTheme.headlineSmall,
                        ),
                      ),
                      Text(
                        '£${widget.item.price.toStringAsFixed(2)}',
                        style: AppTheme.titleLarge.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Description
                  Text(
                    widget.item.description,
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Tags
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ...widget.item.dietaryTags
                          .map((tag) => DietaryChip(tag: tag)),
                      if (widget.item.calories > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${widget.item.calories} cal',
                            style: AppTheme.labelMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      if (widget.item.preparationTime > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.access_time,
                                  size: 14, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.item.preparationTime} min',
                                style: AppTheme.labelMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),

                  // Spice level selector
                  if (widget.item.spiceLevel > 0) ...[
                    const SizedBox(height: 24),
                    _buildSectionTitle('Spice Level'),
                    const SizedBox(height: 12),
                    Row(
                      children: List.generate(4, (index) {
                        final level = index + 1;
                        final isSelected = _selectedSpiceLevel >= level;
                        return GestureDetector(
                          onTap: () =>
                              setState(() => _selectedSpiceLevel = level),
                          child: Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.spiceLevels[index]
                                        .withOpacity(0.2)
                                    : AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.spiceLevels[index]
                                      : Colors.transparent,
                                  width: 2,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text('🌶️' * level,
                                      style: const TextStyle(fontSize: 12)),
                                  const SizedBox(width: 4),
                                  Text(
                                    _getSpiceLabel(level),
                                    style: AppTheme.labelSmall.copyWith(
                                      color: isSelected
                                          ? AppColors.spiceLevels[index]
                                          : AppColors.textSecondary,
                                      fontWeight: isSelected
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  ],

                  // Modifier groups
                  ...widget.item.modifierGroups
                      .map((group) => _buildModifierGroup(group)),

                  // Special instructions
                  const SizedBox(height: 24),
                  _buildSectionTitle('Special Instructions'),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _instructionsController,
                    maxLines: 2,
                    maxLength: 200,
                    decoration: InputDecoration(
                      hintText: 'Any allergies or preferences? Let us know...',
                      filled: true,
                      fillColor: AppColors.surfaceVariant,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // Bottom bar
          Container(
            padding: const EdgeInsets.all(20),
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
              top: false,
              child: Row(
                children: [
                  // Quantity selector
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: _quantity > 1
                              ? () => setState(() => _quantity--)
                              : null,
                          icon: const Icon(Icons.remove),
                          color: _quantity > 1
                              ? AppColors.primary
                              : AppColors.textTertiary,
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Text(
                            '$_quantity',
                            style: AppTheme.titleMedium,
                          ),
                        ),
                        IconButton(
                          onPressed: () => setState(() => _quantity++),
                          icon: const Icon(Icons.add),
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 16),

                  // Add to cart button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isValid ? _addToCart : null,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(
                        'Add to Cart  •  £${_totalPrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, {bool isRequired = false}) {
    return Row(
      children: [
        Text(
          title,
          style: AppTheme.titleSmall,
        ),
        if (isRequired) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              'Required',
              style: AppTheme.labelSmall.copyWith(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildModifierGroup(ModifierGroup group) {
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(
            group.name,
            isRequired: group.isRequired,
          ),
          if (group.maxSelections > 1)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                'Choose up to ${group.maxSelections}',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          const SizedBox(height: 12),
          ...group.modifiers.map((modifier) {
            final isSelected =
                _selectedModifiers[group.id]?.contains(modifier.id) ?? false;

            return GestureDetector(
              onTap: modifier.isAvailable
                  ? () => _toggleModifier(group, modifier)
                  : null,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary.withOpacity(0.1)
                      : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color:
                            isSelected ? AppColors.primary : Colors.transparent,
                        shape: group.maxSelections == 1
                            ? BoxShape.circle
                            : BoxShape.rectangle,
                        borderRadius: group.maxSelections > 1
                            ? BorderRadius.circular(4)
                            : null,
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.textTertiary,
                          width: 2,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(Icons.check,
                              size: 16, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        modifier.name,
                        style: AppTheme.bodyMedium.copyWith(
                          color: modifier.isAvailable
                              ? AppColors.textPrimary
                              : AppColors.textTertiary,
                          decoration: modifier.isAvailable
                              ? null
                              : TextDecoration.lineThrough,
                        ),
                      ),
                    ),
                    if (modifier.price != 0)
                      Text(
                        modifier.price > 0
                            ? '+£${modifier.price.toStringAsFixed(2)}'
                            : '-£${modifier.price.abs().toStringAsFixed(2)}',
                        style: AppTheme.labelLarge.copyWith(
                          color: modifier.price > 0
                              ? AppColors.textSecondary
                              : AppColors.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  void _toggleModifier(ModifierGroup group, Modifier modifier) {
    setState(() {
      final selected = _selectedModifiers[group.id] ?? [];

      if (group.maxSelections == 1) {
        // Single selection
        _selectedModifiers[group.id] = [modifier.id];
      } else {
        // Multiple selection
        if (selected.contains(modifier.id)) {
          selected.remove(modifier.id);
        } else if (selected.length < group.maxSelections) {
          selected.add(modifier.id);
        }
        _selectedModifiers[group.id] = selected;
      }
    });
  }

  void _addToCart() {
    final modifiers = <SelectedModifier>[];

    for (final group in widget.item.modifierGroups) {
      for (final modifier in group.modifiers) {
        if (_selectedModifiers[group.id]?.contains(modifier.id) ?? false) {
          modifiers.add(SelectedModifier(
            groupId: group.id,
            groupName: group.name,
            modifierId: modifier.id,
            name: modifier.name,
            price: modifier.price,
          ));
        }
      }
    }

    ref.read(cartProvider.notifier).addItem(
          widget.item,
          quantity: _quantity,
          modifiers: modifiers,
          specialInstructions: _instructionsController.text,
          spiceLevel: _selectedSpiceLevel,
        );

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.item.name} added to cart'),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'View Cart',
          onPressed: () {
            // Navigate to cart
          },
        ),
      ),
    );
  }

  String _getSpiceLabel(int level) {
    switch (level) {
      case 1:
        return 'Mild';
      case 2:
        return 'Medium';
      case 3:
        return 'Hot';
      case 4:
        return 'X Hot';
      default:
        return '';
    }
  }

  String _getItemEmoji(String categoryId) {
    switch (categoryId) {
      case 'starters':
        return '🥗';
      case 'mains':
        return '🍛';
      case 'curries':
        return '🍲';
      case 'grills':
        return '🥩';
      case 'sides':
        return '🍚';
      case 'desserts':
        return '🍮';
      case 'drinks':
        return '🥤';
      default:
        return '🍽️';
    }
  }
}
