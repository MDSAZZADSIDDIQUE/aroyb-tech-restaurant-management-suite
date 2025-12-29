import 'package:flutter/material.dart';

/// Application-wide constants
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Aroyb Grill & Curry';
  static const String appVersion = '1.0.0';
  static const bool isDemoMode = true;

  // Demo Settings
  static const Duration orderStatusAdvanceInterval = Duration(seconds: 15);
  static const int lapsedUserDaysThreshold = 7;
  static const int highSpenderThreshold = 100; // in pounds

  // Order Settings
  static const double defaultDeliveryFee = 2.99;
  static const double defaultServiceCharge = 0.50;
  static const double minimumOrderAmount = 10.00;
  static const List<double> tipOptions = [0, 1, 2, 3, 5];
  static const List<int> tipPercentages = [0, 10, 15, 20];

  // Loyalty Settings
  static const int pointsPerPound = 1;
  static const int referralBonusPoints = 100;
  static const double referralDiscountAmount = 5.00;

  // Time Slots
  static const int deliverySlotDurationMinutes = 30;
  static const int collectionSlotDurationMinutes = 15;

  // AI Prediction Settings
  static const int mealTimeBreakfastStart = 6;
  static const int mealTimeBreakfastEnd = 11;
  static const int mealTimeLunchStart = 11;
  static const int mealTimeLunchEnd = 15;
  static const int mealTimeDinnerStart = 17;
  static const int mealTimeDinnerEnd = 23;

  // Validation
  static const int minPasswordLength = 8;
  static const int maxSpecialInstructionsLength = 200;
  static const int maxReviewLength = 500;

  // Hive Box Names
  static const String userDataBox = 'user_data';
  static const String cartDataBox = 'cart_data';
  static const String ordersDataBox = 'orders_data';
  static const String notificationsDataBox = 'notifications_data';

  // Asset Paths
  static const String restaurantsDataPath = 'assets/data/restaurants.json';
  static const String menuDataPath = 'assets/data/menu.json';
  static const String offersDataPath = 'assets/data/offers.json';
  static const String rewardsDataPath = 'assets/data/rewards.json';
}

/// Spice level enum
enum SpiceLevel {
  mild('Mild', 1),
  medium('Medium', 2),
  hot('Hot', 3),
  extraHot('Extra Hot', 4);

  const SpiceLevel(this.label, this.level);
  final String label;
  final int level;
}

/// Fulfillment type enum
enum FulfillmentType {
  delivery('Delivery'),
  collection('Collection');

  const FulfillmentType(this.label);
  final String label;
}

/// Order status enum
enum OrderStatus {
  placed('Placed', 'Your order has been placed'),
  accepted('Accepted', 'Restaurant has accepted your order'),
  preparing('In Kitchen', 'Your order is being prepared'),
  ready('Ready', 'Your order is ready'),
  outForDelivery('Out for Delivery', 'Your order is on its way'),
  readyForPickup('Ready for Pickup', 'Your order is ready to collect'),
  completed('Completed', 'Order completed');

  const OrderStatus(this.label, this.description);
  final String label;
  final String description;

  String get displayName => label;

  Color get color {
    switch (this) {
      case OrderStatus.placed:
        return const Color(0xFF9E9E9E);
      case OrderStatus.accepted:
        return const Color(0xFF2196F3);
      case OrderStatus.preparing:
        return const Color(0xFFFF9800);
      case OrderStatus.ready:
        return const Color(0xFF4CAF50);
      case OrderStatus.outForDelivery:
        return const Color(0xFF9C27B0);
      case OrderStatus.readyForPickup:
        return const Color(0xFF4CAF50);
      case OrderStatus.completed:
        return const Color(0xFF4CAF50);
    }
  }

  IconData get icon {
    switch (this) {
      case OrderStatus.placed:
        return Icons.receipt_long;
      case OrderStatus.accepted:
        return Icons.check_circle_outline;
      case OrderStatus.preparing:
        return Icons.restaurant;
      case OrderStatus.ready:
        return Icons.check_circle;
      case OrderStatus.outForDelivery:
        return Icons.delivery_dining;
      case OrderStatus.readyForPickup:
        return Icons.store;
      case OrderStatus.completed:
        return Icons.done_all;
    }
  }
}

/// Dietary tag enum
enum DietaryTag {
  vegetarian('Vegetarian', 'V', 0xFF4CAF50),
  vegan('Vegan', 'VG', 0xFF8BC34A),
  glutenFree('Gluten Free', 'GF', 0xFFFFB74D),
  dairyFree('Dairy Free', 'DF', 0xFF64B5F6),
  nutFree('Nut Free', 'NF', 0xFFBA68C8),
  halal('Halal', 'H', 0xFF26A69A),
  spicy('Spicy', '🌶️', 0xFFE53935);

  const DietaryTag(this.label, this.shortLabel, this.colorValue);
  final String label;
  final String shortLabel;
  final int colorValue;
}

/// Allergen enum
enum Allergen {
  gluten('Gluten'),
  dairy('Dairy'),
  eggs('Eggs'),
  fish('Fish'),
  shellfish('Shellfish'),
  treeNuts('Tree Nuts'),
  peanuts('Peanuts'),
  soy('Soy'),
  sesame('Sesame'),
  mustard('Mustard'),
  celery('Celery'),
  sulphites('Sulphites');

  const Allergen(this.label);
  final String label;
}
