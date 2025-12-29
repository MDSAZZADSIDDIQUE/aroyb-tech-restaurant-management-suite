import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/restaurant.dart';

/// Repository for accessing restaurant data
class RestaurantRepository {
  List<Restaurant>? _restaurants;

  Future<void> _loadData() async {
    if (_restaurants != null) return;

    final jsonString =
        await rootBundle.loadString('assets/data/restaurants.json');
    final data = json.decode(jsonString) as Map<String, dynamic>;

    _restaurants = (data['restaurants'] as List<dynamic>)
        .map((e) => Restaurant.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Restaurant>> getAllRestaurants() async {
    await _loadData();
    return _restaurants!;
  }

  Future<Restaurant?> getRestaurantById(String id) async {
    await _loadData();
    try {
      return _restaurants!.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<Restaurant?> getDefaultRestaurant() async {
    await _loadData();
    return _restaurants!.isNotEmpty ? _restaurants!.first : null;
  }
}

final restaurantRepositoryProvider = Provider<RestaurantRepository>((ref) {
  return RestaurantRepository();
});
