import 'package:flutter/material.dart';

/// Aroyb brand color palette
class AppColors {
  AppColors._();

  // Primary Brand Colors
  static const Color primary = Color(0xFFE53935); // Vibrant Red
  static const Color primaryDark = Color(0xFFC62828);
  static const Color primaryLight = Color(0xFFFF6F60);

  // Secondary Colors
  static const Color secondary = Color(0xFFFF6B35); // Warm Orange
  static const Color secondaryDark = Color(0xFFE55A2B);
  static const Color secondaryLight = Color(0xFFFF8A5C);

  // Accent Colors
  static const Color accent = Color(0xFFFFC107); // Golden Yellow
  static const Color accentDark = Color(0xFFFFB300);
  static const Color accentLight = Color(0xFFFFD54F);

  // Neutral Colors
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color cardBackground = Color(0xFFFFFFFF);

  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textTertiary = Color(0xFF999999);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnSecondary = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFFE8F5E9);
  static const Color warning = Color(0xFFFF9800);
  static const Color warningLight = Color(0xFFFFF3E0);
  static const Color error = Color(0xFFF44336);
  static const Color errorLight = Color(0xFFFFEBEE);
  static const Color info = Color(0xFF2196F3);
  static const Color infoLight = Color(0xFFE3F2FD);

  // Order Status Colors
  static const Color statusPlaced = Color(0xFF9E9E9E);
  static const Color statusAccepted = Color(0xFF2196F3);
  static const Color statusPreparing = Color(0xFFFF9800);
  static const Color statusReady = Color(0xFF8BC34A);
  static const Color statusOutForDelivery = Color(0xFF673AB7);
  static const Color statusCompleted = Color(0xFF4CAF50);

  // Dietary Tag Colors
  static const Color vegetarian = Color(0xFF4CAF50);
  static const Color vegan = Color(0xFF8BC34A);
  static const Color glutenFree = Color(0xFFFFB74D);
  static const Color dairyFree = Color(0xFF64B5F6);
  static const Color nutFree = Color(0xFFBA68C8);
  static const Color halal = Color(0xFF26A69A);
  static const Color spicy = Color(0xFFE53935);

  // Demo Banner
  static const Color demoBanner = Color(0xFF6C63FF);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [secondary, accent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF1A1A1A), Color(0xFF2D2D2D)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [success, Color(0xFF66BB6A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Spice Level Colors
  static const List<Color> spiceLevels = [
    Color(0xFF4CAF50), // Mild
    Color(0xFFFFC107), // Medium
    Color(0xFFFF9800), // Hot
    Color(0xFFE53935), // Extra Hot
  ];
}

/// Dark theme colors
class AppColorsDark {
  AppColorsDark._();

  static const Color background = Color(0xFF121212);
  static const Color surface = Color(0xFF1E1E1E);
  static const Color surfaceVariant = Color(0xFF2D2D2D);
  static const Color cardBackground = Color(0xFF252525);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textTertiary = Color(0xFF808080);
}
