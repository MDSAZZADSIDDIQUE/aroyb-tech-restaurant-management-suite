import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';

/// Animated floating cart button with item count badge
class AnimatedCartBadge extends StatelessWidget {
  final int itemCount;
  final VoidCallback onTap;

  const AnimatedCartBadge({
    super.key,
    required this.itemCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: onTap,
      backgroundColor: AppColors.primary,
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.shopping_bag_outlined, color: Colors.white),
          Positioned(
            right: -8,
            top: -8,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AppColors.accent,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 18,
                minHeight: 18,
              ),
              child: Text(
                itemCount > 99 ? '99+' : '$itemCount',
                style: const TextStyle(
                  color: Colors.black,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            )
                .animate(onPlay: (c) => c.repeat())
                .scale(
                  duration: 300.ms,
                  curve: Curves.easeOut,
                )
                .then()
                .scale(
                  begin: const Offset(1.0, 1.0),
                  end: const Offset(1.0, 1.0),
                  duration: 2700.ms,
                ),
          ),
        ],
      ),
      label: const Text(
        'View Cart',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    ).animate().scale(
          begin: const Offset(0.8, 0.8),
          end: const Offset(1.0, 1.0),
          duration: 200.ms,
          curve: Curves.easeOut,
        );
  }
}

/// Simple cart icon badge for app bar
class CartIconBadge extends StatelessWidget {
  final int itemCount;
  final VoidCallback? onTap;
  final Color? iconColor;

  const CartIconBadge({
    super.key,
    required this.itemCount,
    this.onTap,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      icon: Badge(
        isLabelVisible: itemCount > 0,
        label: Text(
          itemCount > 99 ? '99+' : '$itemCount',
          style: const TextStyle(fontSize: 10),
        ),
        backgroundColor: AppColors.primary,
        child: Icon(
          Icons.shopping_bag_outlined,
          color: iconColor ?? AppColors.textPrimary,
        ),
      ),
    );
  }
}
