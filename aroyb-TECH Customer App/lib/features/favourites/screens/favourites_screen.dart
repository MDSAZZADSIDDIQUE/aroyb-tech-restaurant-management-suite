import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../domain/providers/menu_provider.dart';
import '../../../shared/widgets/demo_banner.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../menu/widgets/item_detail_sheet.dart';

class FavouritesScreen extends ConsumerWidget {
  const FavouritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favouriteIds = ref.watch(favouriteItemIdsProvider);
    final allItemsAsync = ref.watch(allMenuItemsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Favourites'),
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: favouriteIds.isEmpty
                ? EmptyFavouritesState(
                    onBrowseMenu: () => context.go(AppRoutes.menu),
                  )
                : allItemsAsync.when(
                    data: (allItems) {
                      final favourites = allItems
                          .where((item) => favouriteIds.contains(item.id))
                          .toList();

                      if (favourites.isEmpty) {
                        return EmptyFavouritesState(
                          onBrowseMenu: () => context.go(AppRoutes.menu),
                        );
                      }

                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: favourites.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = favourites[index];
                          return _FavouriteItemCard(
                            item: item,
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (context) =>
                                    ItemDetailSheet(item: item),
                              );
                            },
                            onRemove: () {
                              ref
                                  .read(userProvider.notifier)
                                  .toggleFavourite(item.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                      '${item.name} removed from favourites'),
                                  action: SnackBarAction(
                                    label: 'Undo',
                                    onPressed: () {
                                      ref
                                          .read(userProvider.notifier)
                                          .toggleFavourite(item.id);
                                    },
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text('Error: $e')),
                  ),
          ),
        ],
      ),
    );
  }
}

class _FavouriteItemCard extends StatelessWidget {
  final dynamic item;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  const _FavouriteItemCard({
    required this.item,
    required this.onTap,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Center(
                  child: Text(_getItemEmoji(item.categoryId),
                      style: const TextStyle(fontSize: 36)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: AppTheme.titleSmall),
                    const SizedBox(height: 4),
                    Text(
                      item.description,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '£${item.price.toStringAsFixed(2)}',
                          style: AppTheme.titleSmall.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              onPressed: onRemove,
                              icon: const Icon(Icons.favorite,
                                  color: AppColors.error),
                              iconSize: 20,
                              visualDensity: VisualDensity.compact,
                            ),
                            ElevatedButton(
                              onPressed: onTap,
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                              ),
                              child: const Text('Add'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
