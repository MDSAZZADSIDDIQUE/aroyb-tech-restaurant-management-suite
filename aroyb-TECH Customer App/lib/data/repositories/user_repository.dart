import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/user_profile.dart';
import '../models/order.dart';

/// Repository for managing user data
class UserRepository {
  static const _boxName = 'user_data';
  static const _profileKey = 'user_profile';
  static const _selectedRestaurantKey = 'selected_restaurant';

  Box get _box => Hive.box(_boxName);

  /// Get user profile (creates demo profile if none exists)
  UserProfile getProfile() {
    final profileJson = _box.get(_profileKey) as String?;
    if (profileJson == null) {
      final demoProfile = DemoUserProfile.demoUser;
      _box.put(_profileKey, json.encode(demoProfile.toJson()));
      return demoProfile;
    }
    return UserProfile.fromJson(
        json.decode(profileJson) as Map<String, dynamic>);
  }

  /// Save user profile
  Future<void> saveProfile(UserProfile profile) async {
    await _box.put(_profileKey, json.encode(profile.toJson()));
  }

  /// Update user profile
  Future<UserProfile> updateProfile({
    String? name,
    String? email,
    String? phone,
    bool? pushNotificationsEnabled,
    bool? marketingEnabled,
  }) async {
    final profile = getProfile();
    final updated = profile.copyWith(
      name: name,
      email: email,
      phone: phone,
      pushNotificationsEnabled: pushNotificationsEnabled,
      marketingEnabled: marketingEnabled,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Add to favourites
  Future<UserProfile> addToFavourites(String itemId) async {
    final profile = getProfile();
    if (profile.favouriteItemIds.contains(itemId)) return profile;

    final updated = profile.copyWith(
      favouriteItemIds: [...profile.favouriteItemIds, itemId],
    );
    await saveProfile(updated);
    return updated;
  }

  /// Remove from favourites
  Future<UserProfile> removeFromFavourites(String itemId) async {
    final profile = getProfile();
    final updated = profile.copyWith(
      favouriteItemIds:
          profile.favouriteItemIds.where((id) => id != itemId).toList(),
    );
    await saveProfile(updated);
    return updated;
  }

  /// Check if item is favourite
  bool isFavourite(String itemId) {
    return getProfile().favouriteItemIds.contains(itemId);
  }

  /// Add address
  Future<UserProfile> addAddress(DeliveryAddress address) async {
    final profile = getProfile();
    final addresses = [...profile.addresses];

    // If setting as default, remove default from others
    if (address.isDefault) {
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i].isDefault) {
          addresses[i] = addresses[i].copyWith(isDefault: false);
        }
      }
    }

    addresses.add(address);
    final updated = profile.copyWith(addresses: addresses);
    await saveProfile(updated);
    return updated;
  }

  /// Update address
  Future<UserProfile> updateAddress(DeliveryAddress address) async {
    final profile = getProfile();
    final addresses = [...profile.addresses];
    final index = addresses.indexWhere((a) => a.id == address.id);

    if (index == -1) return profile;

    // If setting as default, remove default from others
    if (address.isDefault) {
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i].isDefault && i != index) {
          addresses[i] = addresses[i].copyWith(isDefault: false);
        }
      }
    }

    addresses[index] = address;
    final updated = profile.copyWith(addresses: addresses);
    await saveProfile(updated);
    return updated;
  }

  /// Delete address
  Future<UserProfile> deleteAddress(String addressId) async {
    final profile = getProfile();
    final updated = profile.copyWith(
      addresses: profile.addresses.where((a) => a.id != addressId).toList(),
    );
    await saveProfile(updated);
    return updated;
  }

  /// Set default address
  Future<UserProfile> setDefaultAddress(String addressId) async {
    final profile = getProfile();
    final addresses = profile.addresses.map((a) {
      return a.copyWith(isDefault: a.id == addressId);
    }).toList();
    final updated = profile.copyWith(addresses: addresses);
    await saveProfile(updated);
    return updated;
  }

  /// Add loyalty points
  Future<UserProfile> addLoyaltyPoints(int points) async {
    final profile = getProfile();
    final updated = profile.copyWith(
      loyaltyPoints: profile.loyaltyPoints + points,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Add loyalty stamp
  Future<UserProfile> addLoyaltyStamp() async {
    final profile = getProfile();
    final updated = profile.copyWith(
      loyaltyStamps: profile.loyaltyStamps + 1,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Spend loyalty points
  Future<UserProfile> spendLoyaltyPoints(int points) async {
    final profile = getProfile();
    if (profile.loyaltyPoints < points) {
      throw Exception('Insufficient points');
    }
    final updated = profile.copyWith(
      loyaltyPoints: profile.loyaltyPoints - points,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Spend loyalty stamps
  Future<UserProfile> spendLoyaltyStamps(int stamps) async {
    final profile = getProfile();
    if (profile.loyaltyStamps < stamps) {
      throw Exception('Insufficient stamps');
    }
    final updated = profile.copyWith(
      loyaltyStamps: profile.loyaltyStamps - stamps,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Apply referral code
  Future<UserProfile> applyReferralCode(String code) async {
    final profile = getProfile();
    if (profile.appliedReferralCodes.contains(code)) {
      throw Exception('Code already used');
    }
    final updated = profile.copyWith(
      appliedReferralCodes: [...profile.appliedReferralCodes, code],
    );
    await saveProfile(updated);
    return updated;
  }

  /// Update after order
  Future<UserProfile> updateAfterOrder(double orderTotal) async {
    final profile = getProfile();
    final updated = profile.copyWith(
      totalSpent: profile.totalSpent + orderTotal,
      orderCount: profile.orderCount + 1,
      lastOrderDate: DateTime.now(),
      loyaltyStamps: profile.loyaltyStamps + 1,
    );
    await saveProfile(updated);
    return updated;
  }

  /// Get selected restaurant ID
  String? getSelectedRestaurantId() {
    return _box.get(_selectedRestaurantKey) as String?;
  }

  /// Set selected restaurant
  Future<void> setSelectedRestaurant(String restaurantId) async {
    await _box.put(_selectedRestaurantKey, restaurantId);
  }

  /// Reset user data (for demo)
  Future<void> resetUserData() async {
    await _box.clear();
  }
}

final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository();
});
