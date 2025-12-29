import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

/// Empty state widget
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.1),
                    AppColors.secondary.withOpacity(0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 56,
                color: AppColors.primary.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: AppTheme.titleLarge.copyWith(
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Empty cart state
class EmptyCartState extends StatelessWidget {
  final VoidCallback? onBrowseMenu;

  const EmptyCartState({super.key, this.onBrowseMenu});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.shopping_bag_outlined,
      title: 'Your cart is empty',
      subtitle: 'Browse our menu and add some delicious items',
      actionLabel: 'Browse Menu',
      onAction: onBrowseMenu,
    );
  }
}

/// Empty orders state
class EmptyOrdersState extends StatelessWidget {
  final VoidCallback? onOrderNow;

  const EmptyOrdersState({super.key, this.onOrderNow});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.receipt_long_outlined,
      title: 'No orders yet',
      subtitle: 'Start your first order and it will appear here',
      actionLabel: 'Order Now',
      onAction: onOrderNow,
    );
  }
}

/// Empty favourites state
class EmptyFavouritesState extends StatelessWidget {
  final VoidCallback? onBrowseMenu;

  const EmptyFavouritesState({super.key, this.onBrowseMenu});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.favorite_border,
      title: 'No favourites yet',
      subtitle: 'Tap the heart on items you love to save them here',
      actionLabel: 'Browse Menu',
      onAction: onBrowseMenu,
    );
  }
}

/// Empty addresses state
class EmptyAddressesState extends StatelessWidget {
  final VoidCallback? onAddAddress;

  const EmptyAddressesState({super.key, this.onAddAddress});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.location_on_outlined,
      title: 'No saved addresses',
      subtitle: 'Add an address to make checkout faster',
      actionLabel: 'Add Address',
      onAction: onAddAddress,
    );
  }
}

/// Empty notifications state
class EmptyNotificationsState extends StatelessWidget {
  const EmptyNotificationsState({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.notifications_none,
      title: 'No notifications',
      subtitle: 'You\'re all caught up!',
    );
  }
}

/// Empty search results state
class EmptySearchState extends StatelessWidget {
  final String query;

  const EmptySearchState({super.key, required this.query});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.search_off,
      title: 'No results found',
      subtitle: 'We couldn\'t find anything matching "$query"',
    );
  }
}
