import 'package:flutter/foundation.dart';
import 'menu_item.dart';

/// Cart item with selected modifiers and quantity
@immutable
class CartItem {
  final String id;
  final MenuItem menuItem;
  final int quantity;
  final List<SelectedModifier> selectedModifiers;
  final String specialInstructions;
  final int spiceLevel;

  const CartItem({
    required this.id,
    required this.menuItem,
    this.quantity = 1,
    this.selectedModifiers = const [],
    this.specialInstructions = '',
    this.spiceLevel = 0,
  });

  /// Calculate the total price for this cart item
  double get totalPrice {
    double basePrice = menuItem.price;
    double modifiersPrice = selectedModifiers.fold(
      0.0,
      (sum, mod) => sum + mod.price,
    );
    return (basePrice + modifiersPrice) * quantity;
  }

  /// Get a summary of selected modifiers
  String get modifiersSummary {
    if (selectedModifiers.isEmpty) return '';
    return selectedModifiers.map((m) => m.name).join(', ');
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as String,
      menuItem: MenuItem.fromJson(json['menuItem'] as Map<String, dynamic>),
      quantity: json['quantity'] as int? ?? 1,
      selectedModifiers: (json['selectedModifiers'] as List<dynamic>?)
              ?.map((e) => SelectedModifier.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      specialInstructions: json['specialInstructions'] as String? ?? '',
      spiceLevel: json['spiceLevel'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menuItem': menuItem.toJson(),
      'quantity': quantity,
      'selectedModifiers': selectedModifiers.map((e) => e.toJson()).toList(),
      'specialInstructions': specialInstructions,
      'spiceLevel': spiceLevel,
    };
  }

  CartItem copyWith({
    String? id,
    MenuItem? menuItem,
    int? quantity,
    List<SelectedModifier>? selectedModifiers,
    String? specialInstructions,
    int? spiceLevel,
  }) {
    return CartItem(
      id: id ?? this.id,
      menuItem: menuItem ?? this.menuItem,
      quantity: quantity ?? this.quantity,
      selectedModifiers: selectedModifiers ?? this.selectedModifiers,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      spiceLevel: spiceLevel ?? this.spiceLevel,
    );
  }
}

/// Selected modifier option in cart
@immutable
class SelectedModifier {
  final String groupId;
  final String groupName;
  final String modifierId;
  final String name;
  final double price;

  const SelectedModifier({
    required this.groupId,
    required this.groupName,
    required this.modifierId,
    required this.name,
    this.price = 0,
  });

  factory SelectedModifier.fromJson(Map<String, dynamic> json) {
    return SelectedModifier(
      groupId: json['groupId'] as String,
      groupName: json['groupName'] as String? ?? '',
      modifierId: json['modifierId'] as String,
      name: json['name'] as String,
      price: (json['price'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'groupId': groupId,
      'groupName': groupName,
      'modifierId': modifierId,
      'name': name,
      'price': price,
    };
  }
}

/// Shopping cart state
@immutable
class Cart {
  final List<CartItem> items;
  final double tip;
  final String promoCode;
  final double promoDiscount;
  final String specialInstructions;

  const Cart({
    this.items = const [],
    this.tip = 0,
    this.promoCode = '',
    this.promoDiscount = 0,
    this.specialInstructions = '',
  });

  /// Calculate subtotal (items only)
  double get subtotal => items.fold(0.0, (sum, item) => sum + item.totalPrice);

  /// Total item count
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  /// Check if cart is empty
  bool get isEmpty => items.isEmpty;

  /// Check if cart is not empty
  bool get isNotEmpty => items.isNotEmpty;

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => CartItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tip: (json['tip'] as num?)?.toDouble() ?? 0,
      promoCode: json['promoCode'] as String? ?? '',
      promoDiscount: (json['promoDiscount'] as num?)?.toDouble() ?? 0,
      specialInstructions: json['specialInstructions'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'items': items.map((e) => e.toJson()).toList(),
      'tip': tip,
      'promoCode': promoCode,
      'promoDiscount': promoDiscount,
      'specialInstructions': specialInstructions,
    };
  }

  Cart copyWith({
    List<CartItem>? items,
    double? tip,
    String? promoCode,
    double? promoDiscount,
    String? specialInstructions,
  }) {
    return Cart(
      items: items ?? this.items,
      tip: tip ?? this.tip,
      promoCode: promoCode ?? this.promoCode,
      promoDiscount: promoDiscount ?? this.promoDiscount,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}
