import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/menu_item.dart';
import '../../data/repositories/menu_repository.dart';

/// Menu categories provider
final menuCategoriesProvider = FutureProvider<List<MenuCategory>>((ref) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getCategories();
});

/// All menu items provider
final allMenuItemsProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getAllItems();
});

/// Menu items by category provider
final menuItemsByCategoryProvider =
    FutureProvider.family<List<MenuItem>, String>((ref, categoryId) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getItemsByCategory(categoryId);
});

/// Popular items provider
final popularItemsProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getPopularItems();
});

/// New items provider
final newItemsProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getNewItems();
});

/// Search items provider
final searchItemsProvider =
    FutureProvider.family<List<MenuItem>, String>((ref, query) async {
  if (query.isEmpty) return [];
  final repository = ref.watch(menuRepositoryProvider);
  return repository.searchItems(query);
});

/// Single item provider
final menuItemProvider =
    FutureProvider.family<MenuItem?, String>((ref, itemId) async {
  final repository = ref.watch(menuRepositoryProvider);
  return repository.getItemById(itemId);
});

/// Favourite items provider
final favouriteMenuItemsProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repository = ref.watch(menuRepositoryProvider);
  // We'll need to get favourite IDs from user provider
  // For now, return popular items as placeholder
  return repository.getPopularItems();
});
