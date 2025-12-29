import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/providers/user_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            onPressed: () => context.push(AppRoutes.notifications),
            icon: const Icon(Icons.notifications_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: AppTheme.headlineMedium.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: AppTheme.titleLarge.copyWith(
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        user.email,
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    // Edit profile
                    _showEditProfileSheet(context, ref, user);
                  },
                  icon: const Icon(Icons.edit_outlined, color: Colors.white),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Loyalty summary
          GestureDetector(
            onTap: () => context.push(AppRoutes.loyalty),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppColors.accentGradient,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.stars, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${user.loyaltyPoints} Points',
                          style: AppTheme.titleMedium.copyWith(
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          '${user.loyaltyStamps}/10 stamps to free meal',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios,
                      color: Colors.white, size: 16),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Menu items
          _MenuSection(
            title: 'My Account',
            items: [
              _MenuItem(
                icon: Icons.favorite_outline,
                label: 'Favourites',
                onTap: () => context.push(AppRoutes.favourites),
              ),
              _MenuItem(
                icon: Icons.location_on_outlined,
                label: 'Saved Addresses',
                onTap: () => context.push(AppRoutes.addresses),
              ),
              _MenuItem(
                icon: Icons.receipt_long_outlined,
                label: 'Order History',
                onTap: () => context.go(AppRoutes.orders),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _MenuSection(
            title: 'Rewards & Offers',
            items: [
              _MenuItem(
                icon: Icons.stars_outlined,
                label: 'Loyalty Rewards',
                badge: user.loyaltyPoints > 50 ? 'Rewards available!' : null,
                onTap: () => context.push(AppRoutes.loyalty),
              ),
              _MenuItem(
                icon: Icons.local_offer_outlined,
                label: 'Special Offers',
                onTap: () => context.push(AppRoutes.offers),
              ),
              _MenuItem(
                icon: Icons.card_giftcard_outlined,
                label: 'Refer Friends',
                subtitle: 'Your code: ${user.referralCode}',
                onTap: () => context.push(AppRoutes.referrals),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _MenuSection(
            title: 'Settings',
            items: [
              _MenuItem(
                icon: Icons.notifications_outlined,
                label: 'Notifications',
                trailing: Switch(
                  value: user.pushNotificationsEnabled,
                  onChanged: (value) {
                    ref.read(userProvider.notifier).updateProfile(
                          pushNotificationsEnabled: value,
                        );
                  },
                ),
              ),
              _MenuItem(
                icon: Icons.mail_outlined,
                label: 'Marketing Emails',
                trailing: Switch(
                  value: user.marketingEnabled,
                  onChanged: (value) {
                    ref.read(userProvider.notifier).updateProfile(
                          marketingEnabled: value,
                        );
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _MenuSection(
            title: 'Support',
            items: [
              _MenuItem(
                icon: Icons.help_outline,
                label: 'Help & FAQ',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Demo: Help center')),
                  );
                },
              ),
              _MenuItem(
                icon: Icons.chat_bubble_outline,
                label: 'Contact Us',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Demo: Contact support')),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Demo controls
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.demoBanner.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.demoBanner.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.science,
                        color: AppColors.demoBanner, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Demo Controls',
                      style: AppTheme.titleSmall.copyWith(
                        color: AppColors.demoBanner,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          await ref.read(userProvider.notifier).resetUserData();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Demo data reset')),
                            );
                          }
                        },
                        child: const Text('Reset Data'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          context.go(AppRoutes.restaurantSelector);
                        },
                        child: const Text('Switch Restaurant'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 100),
        ],
      ),
    );
  }

  void _showEditProfileSheet(
      BuildContext context, WidgetRef ref, dynamic user) {
    final nameController = TextEditingController(text: user.name);
    final emailController = TextEditingController(text: user.email);
    final phoneController = TextEditingController(text: user.phone);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Edit Profile', style: AppTheme.titleLarge),
              const SizedBox(height: 20),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  ref.read(userProvider.notifier).updateProfile(
                        name: nameController.text,
                        email: emailController.text,
                        phone: phoneController.text,
                      );
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
                child: const Text('Save Changes'),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title,
            style: AppTheme.labelLarge.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: AppColors.surfaceVariant),
          ),
          child: Column(
            children: items.map((item) {
              final isLast = items.indexOf(item) == items.length - 1;
              return Column(
                children: [
                  item,
                  if (!isLast) const Divider(height: 1, indent: 56),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final String? badge;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    this.subtitle,
    this.badge,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary),
      title: Row(
        children: [
          Text(label),
          if (badge != null) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.secondary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                badge!,
                style: AppTheme.labelSmall.copyWith(
                  color: Colors.white,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ],
      ),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: trailing ??
          (onTap != null
              ? const Icon(Icons.arrow_forward_ios, size: 16)
              : null),
      onTap: onTap,
    );
  }
}
