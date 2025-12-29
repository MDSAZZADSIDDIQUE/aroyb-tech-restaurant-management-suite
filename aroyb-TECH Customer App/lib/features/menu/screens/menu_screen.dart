import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/menu_item.dart';
import '../../../domain/providers/menu_provider.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../shared/widgets/dietary_chips.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../widgets/item_detail_sheet.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabController;
  String? _selectedCategoryId;
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _tabController?.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(menuCategoriesProvider);
    final allItemsAsync = ref.watch(allMenuItemsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Menu'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search menu...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.surfaceVariant,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide: BorderSide.none,
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
        ),
      ),
      body: categoriesAsync.when(
        data: (categories) {
          if (_tabController == null ||
              _tabController!.length != categories.length) {
            _tabController?.dispose();
            _tabController = TabController(
              length: categories.length,
              vsync: this,
            );
          }

          return Column(
            children: [
              // Category tabs
              Container(
                color: AppColors.surface,
                child: TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  tabs: categories
                      .map((c) => Tab(
                            child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              child: Text(c.name),
                            ),
                          ))
                      .toList(),
                  onTap: (index) {
                    setState(() => _selectedCategoryId = categories[index].id);
                  },
                ),
              ),

              // Menu items
              Expanded(
                child: allItemsAsync.when(
                  data: (allItems) {
                    // Filter items
                    List<MenuItem> filteredItems = allItems;

                    // Apply search filter
                    if (_searchQuery.isNotEmpty) {
                      final query = _searchQuery.toLowerCase();
                      filteredItems = filteredItems.where((item) {
                        return item.name.toLowerCase().contains(query) ||
                            item.description.toLowerCase().contains(query);
                      }).toList();
                    }

                    return TabBarView(
                      controller: _tabController,
                      children: categories.map((category) {
                        final categoryItems = filteredItems
                            .where((item) => item.categoryId == category.id)
                            .toList();

                        if (categoryItems.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 48,
                                  color: AppColors.textTertiary,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _searchQuery.isNotEmpty
                                      ? 'No items match your search'
                                      : 'No items in this category',
                                  style: AppTheme.bodyMedium.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }

                        return ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: categoryItems.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            return _MenuItemCard(
                              item: categoryItems[index],
                              onTap: () =>
                                  _showItemDetail(categoryItems[index]),
                            );
                          },
                        );
                      }).toList(),
                    );
                  },
                  loading: () => const SkeletonList(),
                  error: (e, _) => Center(child: Text('Error: $e')),
                ),
              ),
            ],
          );
        },
        loading: () => const SkeletonList(),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  void _showItemDetail(MenuItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ItemDetailSheet(item: item),
    );
  }
}

class _MenuItemCard extends ConsumerWidget {
  final MenuItem item;
  final VoidCallback onTap;

  const _MenuItemCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFavourite =
        ref.watch(userProvider).favouriteItemIds.contains(item.id);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        side: BorderSide(color: AppColors.surfaceVariant),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image
              Hero(
                tag: 'menu_item_${item.id}',
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Text(_getItemEmoji(item.categoryId),
                            style: const TextStyle(fontSize: 40)),
                      ),
                      if (item.isPopular)
                        Positioned(
                          top: 4,
                          left: 4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star,
                                    size: 10, color: Colors.white),
                                const SizedBox(width: 2),
                                Text(
                                  'Popular',
                                  style: AppTheme.labelSmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 8,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
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
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.name,
                                style: AppTheme.titleSmall,
                              ),
                              if (item.isNew) ...[
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.secondary,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    'NEW',
                                    style: AppTheme.labelSmall.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(userProvider.notifier)
                                .toggleFavourite(item.id);
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(4),
                            child: Icon(
                              isFavourite
                                  ? Icons.favorite
                                  : Icons.favorite_border,
                              color: isFavourite
                                  ? AppColors.error
                                  : AppColors.textTertiary,
                              size: 22,
                            ),
                          ),
                        ),
                      ],
                    ),
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
                    // Tags row
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        if (item.dietaryTags.isNotEmpty)
                          ...item.dietaryTags.take(3).map(
                                (tag) => DietaryChip(tag: tag, compact: true),
                              ),
                        if (item.spiceLevel > 0)
                          SpiceLevelIndicator(level: item.spiceLevel, size: 14),
                        if (item.calories > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${item.calories} cal',
                              style: AppTheme.labelSmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Price and add button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '£${item.price.toStringAsFixed(2)}',
                          style: AppTheme.titleMedium.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: onTap,
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Add'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            minimumSize: Size.zero,
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
