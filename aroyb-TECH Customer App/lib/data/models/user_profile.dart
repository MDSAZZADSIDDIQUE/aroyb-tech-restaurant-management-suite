import 'package:flutter/foundation.dart';
import 'order.dart';

/// User profile model
@immutable
class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? avatarUrl;
  final List<DeliveryAddress> addresses;
  final List<String> favouriteItemIds;
  final int loyaltyPoints;
  final int loyaltyStamps;
  final String referralCode;
  final List<String> appliedReferralCodes;
  final int referralCount;
  final DateTime? lastOrderDate;
  final double totalSpent;
  final int orderCount;
  final bool pushNotificationsEnabled;
  final bool marketingEnabled;
  final DateTime createdAt;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl,
    this.addresses = const [],
    this.favouriteItemIds = const [],
    this.loyaltyPoints = 0,
    this.loyaltyStamps = 0,
    required this.referralCode,
    this.appliedReferralCodes = const [],
    this.referralCount = 0,
    this.lastOrderDate,
    this.totalSpent = 0,
    this.orderCount = 0,
    this.pushNotificationsEnabled = false,
    this.marketingEnabled = true,
    required this.createdAt,
  });

  /// Get the default address
  DeliveryAddress? get defaultAddress {
    try {
      return addresses.firstWhere((a) => a.isDefault);
    } catch (_) {
      return addresses.isNotEmpty ? addresses.first : null;
    }
  }

  /// Check if user is a lapsed customer (hasn't ordered in X days)
  bool isLapsed({int days = 7}) {
    if (lastOrderDate == null) return false;
    return DateTime.now().difference(lastOrderDate!).inDays >= days;
  }

  /// Check if user is a new customer
  bool get isNewCustomer => orderCount == 0;

  /// Check if user is a high spender
  bool isHighSpender({double threshold = 100}) => totalSpent >= threshold;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      addresses: (json['addresses'] as List<dynamic>?)
              ?.map((e) => DeliveryAddress.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      favouriteItemIds: (json['favouriteItemIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      loyaltyPoints: json['loyaltyPoints'] as int? ?? 0,
      loyaltyStamps: json['loyaltyStamps'] as int? ?? 0,
      referralCode: json['referralCode'] as String? ?? '',
      appliedReferralCodes: (json['appliedReferralCodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      referralCount: json['referralCount'] as int? ?? 0,
      lastOrderDate: json['lastOrderDate'] != null
          ? DateTime.parse(json['lastOrderDate'] as String)
          : null,
      totalSpent: (json['totalSpent'] as num?)?.toDouble() ?? 0,
      orderCount: json['orderCount'] as int? ?? 0,
      pushNotificationsEnabled:
          json['pushNotificationsEnabled'] as bool? ?? false,
      marketingEnabled: json['marketingEnabled'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'addresses': addresses.map((e) => e.toJson()).toList(),
      'favouriteItemIds': favouriteItemIds,
      'loyaltyPoints': loyaltyPoints,
      'loyaltyStamps': loyaltyStamps,
      'referralCode': referralCode,
      'appliedReferralCodes': appliedReferralCodes,
      'referralCount': referralCount,
      'lastOrderDate': lastOrderDate?.toIso8601String(),
      'totalSpent': totalSpent,
      'orderCount': orderCount,
      'pushNotificationsEnabled': pushNotificationsEnabled,
      'marketingEnabled': marketingEnabled,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    List<DeliveryAddress>? addresses,
    List<String>? favouriteItemIds,
    int? loyaltyPoints,
    int? loyaltyStamps,
    String? referralCode,
    List<String>? appliedReferralCodes,
    int? referralCount,
    DateTime? lastOrderDate,
    double? totalSpent,
    int? orderCount,
    bool? pushNotificationsEnabled,
    bool? marketingEnabled,
    DateTime? createdAt,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      addresses: addresses ?? this.addresses,
      favouriteItemIds: favouriteItemIds ?? this.favouriteItemIds,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      loyaltyStamps: loyaltyStamps ?? this.loyaltyStamps,
      referralCode: referralCode ?? this.referralCode,
      appliedReferralCodes: appliedReferralCodes ?? this.appliedReferralCodes,
      referralCount: referralCount ?? this.referralCount,
      lastOrderDate: lastOrderDate ?? this.lastOrderDate,
      totalSpent: totalSpent ?? this.totalSpent,
      orderCount: orderCount ?? this.orderCount,
      pushNotificationsEnabled:
          pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      marketingEnabled: marketingEnabled ?? this.marketingEnabled,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

/// Demo user profile for testing
class DemoUserProfile {
  static UserProfile get demoUser => UserProfile(
        id: 'demo_user_1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+44 7700 900123',
        referralCode: 'JOHN2024',
        loyaltyPoints: 250,
        loyaltyStamps: 7,
        totalSpent: 156.50,
        orderCount: 8,
        lastOrderDate: DateTime.now().subtract(const Duration(days: 3)),
        pushNotificationsEnabled: true,
        marketingEnabled: true,
        createdAt: DateTime.now().subtract(const Duration(days: 60)),
        addresses: [
          const DeliveryAddress(
            id: 'addr_1',
            label: 'Home',
            addressLine1: '42 Baker Street',
            city: 'London',
            postcode: 'NW1 6XE',
            isDefault: true,
            deliveryInstructions: 'Ring the doorbell twice',
          ),
          const DeliveryAddress(
            id: 'addr_2',
            label: 'Work',
            addressLine1: 'Flat 12, The Towers',
            addressLine2: '100 Commercial Road',
            city: 'London',
            postcode: 'E1 1LB',
            flatNumber: '12',
            floor: '3rd',
            gateCode: '1234',
            isDefault: false,
          ),
        ],
        favouriteItemIds: ['item_1', 'item_5', 'item_12'],
      );
}
