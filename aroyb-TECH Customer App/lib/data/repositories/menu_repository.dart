import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/menu_item.dart';

/// Repository for accessing menu data
class MenuRepository {
  List<MenuCategory>? _categories;
  List<MenuItem>? _items;

  Future<void> _loadData() async {
    if (_categories != null && _items != null) return;

    final jsonString = await rootBundle.loadString('assets/data/menu.json');
    final data = json.decode(jsonString) as Map<String, dynamic>;

    _categories = (data['categories'] as List<dynamic>)
        .map((e) => MenuCategory.fromJson(e as Map<String, dynamic>))
        .toList();

    _items = (data['items'] as List<dynamic>)
        .map((e) => MenuItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<MenuCategory>> getCategories() async {
    await _loadData();
    return _categories!.where((c) => c.isAvailable).toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
  }

  Future<List<MenuItem>> getAllItems() async {
    await _loadData();
    return _items!.where((i) => i.isAvailable).toList();
  }

  Future<List<MenuItem>> getItemsByCategory(String categoryId) async {
    await _loadData();
    return _items!
        .where((i) => i.categoryId == categoryId && i.isAvailable)
        .toList();
  }

  Future<MenuItem?> getItemById(String itemId) async {
    await _loadData();
    try {
      return _items!.firstWhere((i) => i.id == itemId);
    } catch (_) {
      return null;
    }
  }

  Future<List<MenuItem>> getPopularItems() async {
    await _loadData();
    return _items!.where((i) => i.isPopular && i.isAvailable).toList();
  }

  Future<List<MenuItem>> getNewItems() async {
    await _loadData();
    return _items!.where((i) => i.isNew && i.isAvailable).toList();
  }

  Future<List<MenuItem>> searchItems(String query) async {
    await _loadData();
    final lowerQuery = query.toLowerCase();
    return _items!.where((i) {
      return i.isAvailable &&
          (i.name.toLowerCase().contains(lowerQuery) ||
              i.description.toLowerCase().contains(lowerQuery) ||
              i.categoryName.toLowerCase().contains(lowerQuery));
    }).toList();
  }

  Future<List<MenuItem>> getItemsByDietaryTag(String tag) async {
    await _loadData();
    return _items!
        .where((i) => i.isAvailable && i.dietaryTags.contains(tag))
        .toList();
  }

  Future<List<MenuItem>> getItemsByIds(List<String> itemIds) async {
    await _loadData();
    return _items!.where((i) => itemIds.contains(i.id)).toList();
  }
}

final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  return MenuRepository();
});
