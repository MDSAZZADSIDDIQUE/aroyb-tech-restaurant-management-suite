import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/splash/screens/splash_screen.dart';
import '../../features/splash/screens/restaurant_selector_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/menu/screens/menu_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/checkout/screens/checkout_screen.dart';
import '../../features/orders/screens/orders_screen.dart';
import '../../features/orders/screens/order_confirmation_screen.dart';
import '../../features/orders/screens/order_tracking_screen.dart';
import '../../features/orders/screens/issue_assistant_screen.dart';
import '../../features/favourites/screens/favourites_screen.dart';
import '../../features/addresses/screens/addresses_screen.dart';
import '../../features/addresses/screens/address_form_screen.dart';
import '../../features/loyalty/screens/loyalty_screen.dart';
import '../../features/offers/screens/offers_screen.dart';
import '../../features/referrals/screens/referrals_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../shared/widgets/main_shell.dart';

/// Route paths
class AppRoutes {
  static const String splash = '/';
  static const String restaurantSelector = '/restaurant-selector';
  static const String home = '/home';
  static const String menu = '/menu';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String orderConfirmation = '/order-confirmation';
  static const String orderTracking = '/order-tracking';
  static const String issueAssistant = '/issue-assistant';
  static const String favourites = '/favourites';
  static const String addresses = '/addresses';
  static const String addressForm = '/address-form';
  static const String loyalty = '/loyalty';
  static const String offers = '/offers';
  static const String referrals = '/referrals';
  static const String notifications = '/notifications';
  static const String profile = '/profile';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    routes: [
      // Splash screen
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Restaurant selector
      GoRoute(
        path: AppRoutes.restaurantSelector,
        builder: (context, state) => const RestaurantSelectorScreen(),
      ),

      // Main shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.menu,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: MenuScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.orders,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: OrdersScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // Cart
      GoRoute(
        path: AppRoutes.cart,
        builder: (context, state) => const CartScreen(),
      ),

      // Checkout
      GoRoute(
        path: AppRoutes.checkout,
        builder: (context, state) => const CheckoutScreen(),
      ),

      // Order confirmation
      GoRoute(
        path: AppRoutes.orderConfirmation,
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'] ?? '';
          return OrderConfirmationScreen(orderId: orderId);
        },
      ),

      // Order tracking
      GoRoute(
        path: AppRoutes.orderTracking,
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'] ?? '';
          return OrderTrackingScreen(orderId: orderId);
        },
      ),

      // Issue assistant
      GoRoute(
        path: AppRoutes.issueAssistant,
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'] ?? '';
          return IssueAssistantScreen(orderId: orderId);
        },
      ),

      // Favourites
      GoRoute(
        path: AppRoutes.favourites,
        builder: (context, state) => const FavouritesScreen(),
      ),

      // Addresses
      GoRoute(
        path: AppRoutes.addresses,
        builder: (context, state) => const AddressesScreen(),
      ),

      // Address form
      GoRoute(
        path: AppRoutes.addressForm,
        builder: (context, state) {
          final addressId = state.uri.queryParameters['addressId'];
          return AddressFormScreen(addressId: addressId);
        },
      ),

      // Loyalty
      GoRoute(
        path: AppRoutes.loyalty,
        builder: (context, state) => const LoyaltyScreen(),
      ),

      // Offers
      GoRoute(
        path: AppRoutes.offers,
        builder: (context, state) => const OffersScreen(),
      ),

      // Referrals
      GoRoute(
        path: AppRoutes.referrals,
        builder: (context, state) => const ReferralsScreen(),
      ),

      // Notifications
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});
