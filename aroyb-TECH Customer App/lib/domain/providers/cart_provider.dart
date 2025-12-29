import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../../data/models/cart_item.dart';
import '../../data/models/menu_item.dart';

/// Cart state notifier
class CartNotifier extends StateNotifier<Cart> {
  static const _boxName = 'cart_data';
  static const _cartKey = 'cart';

  CartNotifier() : super(const Cart()) {
    _loadCart();
  }

  Box get _box => Hive.box(_boxName);

  void _loadCart() {
    final cartJson = _box.get(_cartKey) as String?;
    if (cartJson != null) {
      state = Cart.fromJson(json.decode(cartJson) as Map<String, dynamic>);
    }
  }

  Future<void> _saveCart() async {
    await _box.put(_cartKey, json.encode(state.toJson()));
  }

  /// Add item to cart
  Future<void> addItem(
    MenuItem menuItem, {
    int quantity = 1,
    List<SelectedModifier> modifiers = const [],
    String specialInstructions = '',
    int spiceLevel = 0,
  }) async {
    final uuid = const Uuid();
    final cartItem = CartItem(
      id: uuid.v4(),
      menuItem: menuItem,
      quantity: quantity,
      selectedModifiers: modifiers,
      specialInstructions: specialInstructions,
      spiceLevel: spiceLevel,
    );

    state = state.copyWith(items: [...state.items, cartItem]);
    await _saveCart();
  }

  /// Update item quantity
  Future<void> updateQuantity(String cartItemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    final items = state.items.map((item) {
      if (item.id == cartItemId) {
        return item.copyWith(quantity: quantity);
      }
      return item;
    }).toList();

    state = state.copyWith(items: items);
    await _saveCart();
  }

  /// Update item modifiers
  Future<void> updateModifiers(
    String cartItemId,
    List<SelectedModifier> modifiers,
  ) async {
    final items = state.items.map((item) {
      if (item.id == cartItemId) {
        return item.copyWith(selectedModifiers: modifiers);
      }
      return item;
    }).toList();

    state = state.copyWith(items: items);
    await _saveCart();
  }

  /// Update item special instructions
  Future<void> updateSpecialInstructions(
    String cartItemId,
    String instructions,
  ) async {
    final items = state.items.map((item) {
      if (item.id == cartItemId) {
        return item.copyWith(specialInstructions: instructions);
      }
      return item;
    }).toList();

    state = state.copyWith(items: items);
    await _saveCart();
  }

  /// Remove item from cart
  Future<void> removeItem(String cartItemId) async {
    state = state.copyWith(
      items: state.items.where((item) => item.id != cartItemId).toList(),
    );
    await _saveCart();
  }

  /// Set tip amount
  Future<void> setTip(double tip) async {
    state = state.copyWith(tip: tip);
    await _saveCart();
  }

  /// Apply promo code
  Future<void> applyPromoCode(String code, double discount) async {
    state = state.copyWith(
      promoCode: code,
      promoDiscount: discount,
    );
    await _saveCart();
  }

  /// Remove promo code
  Future<void> removePromoCode() async {
    state = state.copyWith(
      promoCode: '',
      promoDiscount: 0,
    );
    await _saveCart();
  }

  /// Set cart-level special instructions
  Future<void> setSpecialInstructions(String instructions) async {
    state = state.copyWith(specialInstructions: instructions);
    await _saveCart();
  }

  /// Clear cart
  Future<void> clearCart() async {
    state = const Cart();
    await _saveCart();
  }

  /// Add items from previous order (reorder)
  Future<void> reorder(List<CartItem> items) async {
    final uuid = const Uuid();
    final newItems = items
        .map((item) => CartItem(
              id: uuid.v4(),
              menuItem: item.menuItem,
              quantity: item.quantity,
              selectedModifiers: item.selectedModifiers,
              specialInstructions: item.specialInstructions,
              spiceLevel: item.spiceLevel,
            ))
        .toList();

    state = Cart(items: newItems);
    await _saveCart();
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, Cart>((ref) {
  return CartNotifier();
});

/// Calculated cart totals
class CartTotals {
  final double subtotal;
  final double deliveryFee;
  final double serviceCharge;
  final double tip;
  final double promoDiscount;
  final double total;
  final bool meetsMinimum;
  final double minimumOrder;

  CartTotals({
    required this.subtotal,
    required this.deliveryFee,
    required this.serviceCharge,
    required this.tip,
    required this.promoDiscount,
    required this.total,
    required this.meetsMinimum,
    required this.minimumOrder,
  });
}

final cartTotalsProvider = Provider.family<
    CartTotals,
    ({
      double deliveryFee,
      double serviceCharge,
      double minimumOrder
    })>((ref, params) {
  final cart = ref.watch(cartProvider);

  final subtotal = cart.subtotal;
  final total = subtotal +
      params.deliveryFee +
      params.serviceCharge +
      cart.tip -
      cart.promoDiscount;

  return CartTotals(
    subtotal: subtotal,
    deliveryFee: params.deliveryFee,
    serviceCharge: params.serviceCharge,
    tip: cart.tip,
    promoDiscount: cart.promoDiscount,
    total: total > 0 ? total : 0,
    meetsMinimum: subtotal >= params.minimumOrder,
    minimumOrder: params.minimumOrder,
  );
});
