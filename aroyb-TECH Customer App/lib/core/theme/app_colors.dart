import 'package:flutter/material.dart';

/// Aroyb brand color palette - matching SiteBuilder warm orange theme
class AppColors {
  AppColors._();

  // Primary Brand Colors - Warm Orange (SiteBuilder primary)
  static const Color primary = Color(0xFFED7424); // Warm Orange
  static const Color primaryDark = Color(0xFFDE5A1A);
  static const Color primaryLight = Color(0xFFF19048);

  // Secondary Colors - Curry Gold (SiteBuilder secondary)
  static const Color secondary = Color(0xFFE1AC13); // Curry Gold
  static const Color secondaryDark = Color(0xFFC2850D);
  static const Color secondaryLight = Color(0xFFF1C520);

  // Accent Colors - Deep Burgundy (SiteBuilder accent)
  static const Color accent = Color(0xFFCC3232); // Burgundy Red
  static const Color accentDark = Color(0xFFAB2727);
  static const Color accentLight = Color(0xFFED7A7A);

  // Neutral Colors - Warm Stone (SiteBuilder neutral)
  static const Color background = Color(0xFFFAFAF9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F4);
  static const Color cardBackground = Color(0xFFFFFFFF);

  // Text Colors - Warm grays
  static const Color textPrimary = Color(0xFF1C1917);
  static const Color textSecondary = Color(0xFF57534E);
  static const Color textTertiary = Color(0xFF78716C);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnSecondary = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFFE8F5E9);
  static const Color warning = Color(0xFFE1AC13); // Curry gold
  static const Color warningLight = Color(0xFFFEF7EE);
  static const Color error = Color(0xFFCC3232); // Burgundy
  static const Color errorLight = Color(0xFFFDF3F3);
  static const Color info = Color(0xFFED7424); // Primary orange
  static const Color infoLight = Color(0xFFFEF7EE);

  // Order Status Colors - Warm tones
  static const Color statusPlaced = Color(0xFFA8A29E); // Neutral 400
  static const Color statusAccepted = Color(0xFFED7424); // Primary
  static const Color statusPreparing = Color(0xFFE1AC13); // Secondary
  static const Color statusReady = Color(0xFF4CAF50); // Green
  static const Color statusOutForDelivery = Color(0xFFAB2727); // Accent dark
  static const Color statusCompleted = Color(0xFF4CAF50);

  // Dietary Tag Colors
  static const Color vegetarian = Color(0xFF4CAF50);
  static const Color vegan = Color(0xFF8BC34A);
  static const Color glutenFree = Color(0xFFF6B77D); // Primary 300
  static const Color dairyFree = Color(0xFF64B5F6);
  static const Color nutFree = Color(0xFFBA68C8);
  static const Color halal = Color(0xFF26A69A);
  static const Color spicy = Color(0xFFCC3232); // Accent

  // Demo Banner - Orange gradient
  static const Color demoBanner = Color(0xFFED7424);

  // Gradient Colors - Warm orange to gold
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [secondary, Color(0xFFF6D94D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF1C1917), Color(0xFF292524)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [success, Color(0xFF66BB6A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Hero gradient - matching SiteBuilder
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xE6ED7424), Color(0xF2762F19)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Spice Level Colors - Warm progression
  static const List<Color> spiceLevels = [
    Color(0xFF4CAF50), // Mild
    Color(0xFFE1AC13), // Medium (curry gold)
    Color(0xFFED7424), // Hot (primary)
    Color(0xFFCC3232), // Extra Hot (accent)
  ];
}

/// Dark theme colors - Warm dark tones
class AppColorsDark {
  AppColorsDark._();

  static const Color background = Color(0xFF0C0A09); // Neutral 950
  static const Color surface = Color(0xFF1C1917); // Neutral 900
  static const Color surfaceVariant = Color(0xFF292524); // Neutral 800
  static const Color cardBackground = Color(0xFF292524);

  static const Color textPrimary = Color(0xFFFAFAF9);
  static const Color textSecondary = Color(0xFFD6D3D1);
  static const Color textTertiary = Color(0xFFA8A29E);
}
