import 'package:flutter/foundation.dart';
import 'cart_item.dart';
import '../../../core/constants/app_constants.dart';

/// Order model with status tracking
@immutable
class Order {
  final String id;
  final String orderNumber;
  final String restaurantId;
  final String restaurantName;
  final List<CartItem> items;
  final double subtotal;
  final double deliveryFee;
  final double serviceCharge;
  final double tip;
  final double discount;
  final double total;
  final String fulfillmentType; // 'delivery' or 'collection'
  final DeliveryAddress? deliveryAddress;
  final String? collectionNote;
  final DateTime scheduledTime;
  final DateTime createdAt;
  final String status;
  final List<OrderStatusUpdate> statusHistory;
  final String contactName;
  final String contactPhone;
  final String specialInstructions;
  final int loyaltyPointsEarned;
  final String? appliedReferralCode;
  final DateTime? estimatedDeliveryTime;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.restaurantId,
    required this.restaurantName,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    this.serviceCharge = 0,
    this.tip = 0,
    this.discount = 0,
    required this.total,
    required this.fulfillmentType,
    this.deliveryAddress,
    this.collectionNote,
    required this.scheduledTime,
    required this.createdAt,
    required this.status,
    this.statusHistory = const [],
    required this.contactName,
    required this.contactPhone,
    this.specialInstructions = '',
    this.loyaltyPointsEarned = 0,
    this.appliedReferralCode,
    this.estimatedDeliveryTime,
  });

  bool get isDelivery => fulfillmentType == 'delivery';
  bool get isCollection => fulfillmentType == 'collection';
  bool get isCompleted => status == 'completed';
  bool get isActive => !isCompleted && status != 'cancelled';

  OrderStatus get orderStatus {
    switch (status) {
      case 'placed':
        return OrderStatus.placed;
      case 'accepted':
        return OrderStatus.accepted;
      case 'preparing':
        return OrderStatus.preparing;
      case 'ready':
        return OrderStatus.ready;
      case 'out_for_delivery':
        return OrderStatus.outForDelivery;
      case 'ready_for_pickup':
        return OrderStatus.readyForPickup;
      case 'completed':
        return OrderStatus.completed;
      default:
        return OrderStatus.placed;
    }
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      restaurantId: json['restaurantId'] as String,
      restaurantName: json['restaurantName'] as String? ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => CartItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0,
      serviceCharge: (json['serviceCharge'] as num?)?.toDouble() ?? 0,
      tip: (json['tip'] as num?)?.toDouble() ?? 0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num).toDouble(),
      fulfillmentType: json['fulfillmentType'] as String,
      deliveryAddress: json['deliveryAddress'] != null
          ? DeliveryAddress.fromJson(
              json['deliveryAddress'] as Map<String, dynamic>)
          : null,
      collectionNote: json['collectionNote'] as String?,
      scheduledTime: DateTime.parse(json['scheduledTime'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      status: json['status'] as String,
      statusHistory: (json['statusHistory'] as List<dynamic>?)
              ?.map(
                  (e) => OrderStatusUpdate.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      contactName: json['contactName'] as String? ?? '',
      contactPhone: json['contactPhone'] as String? ?? '',
      specialInstructions: json['specialInstructions'] as String? ?? '',
      loyaltyPointsEarned: json['loyaltyPointsEarned'] as int? ?? 0,
      appliedReferralCode: json['appliedReferralCode'] as String?,
      estimatedDeliveryTime: json['estimatedDeliveryTime'] != null
          ? DateTime.parse(json['estimatedDeliveryTime'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'restaurantId': restaurantId,
      'restaurantName': restaurantName,
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'serviceCharge': serviceCharge,
      'tip': tip,
      'discount': discount,
      'total': total,
      'fulfillmentType': fulfillmentType,
      'deliveryAddress': deliveryAddress?.toJson(),
      'collectionNote': collectionNote,
      'scheduledTime': scheduledTime.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'status': status,
      'statusHistory': statusHistory.map((e) => e.toJson()).toList(),
      'contactName': contactName,
      'contactPhone': contactPhone,
      'specialInstructions': specialInstructions,
      'loyaltyPointsEarned': loyaltyPointsEarned,
      'appliedReferralCode': appliedReferralCode,
      'estimatedDeliveryTime': estimatedDeliveryTime?.toIso8601String(),
    };
  }

  Order copyWith({
    String? id,
    String? orderNumber,
    String? restaurantId,
    String? restaurantName,
    List<CartItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? serviceCharge,
    double? tip,
    double? discount,
    double? total,
    String? fulfillmentType,
    DeliveryAddress? deliveryAddress,
    String? collectionNote,
    DateTime? scheduledTime,
    DateTime? createdAt,
    String? status,
    List<OrderStatusUpdate>? statusHistory,
    String? contactName,
    String? contactPhone,
    String? specialInstructions,
    int? loyaltyPointsEarned,
    String? appliedReferralCode,
    DateTime? estimatedDeliveryTime,
  }) {
    return Order(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      restaurantId: restaurantId ?? this.restaurantId,
      restaurantName: restaurantName ?? this.restaurantName,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      serviceCharge: serviceCharge ?? this.serviceCharge,
      tip: tip ?? this.tip,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      fulfillmentType: fulfillmentType ?? this.fulfillmentType,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      collectionNote: collectionNote ?? this.collectionNote,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      statusHistory: statusHistory ?? this.statusHistory,
      contactName: contactName ?? this.contactName,
      contactPhone: contactPhone ?? this.contactPhone,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      loyaltyPointsEarned: loyaltyPointsEarned ?? this.loyaltyPointsEarned,
      appliedReferralCode: appliedReferralCode ?? this.appliedReferralCode,
      estimatedDeliveryTime:
          estimatedDeliveryTime ?? this.estimatedDeliveryTime,
    );
  }
}

/// Order status update entry
@immutable
class OrderStatusUpdate {
  final String status;
  final DateTime timestamp;
  final String? note;

  const OrderStatusUpdate({
    required this.status,
    required this.timestamp,
    this.note,
  });

  factory OrderStatusUpdate.fromJson(Map<String, dynamic> json) {
    return OrderStatusUpdate(
      status: json['status'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      note: json['note'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'note': note,
    };
  }
}

/// Delivery address model
@immutable
class DeliveryAddress {
  final String id;
  final String label;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String postcode;
  final String? flatNumber;
  final String? floor;
  final String? gateCode;
  final String? deliveryInstructions;
  final bool isDefault;
  final double? latitude;
  final double? longitude;

  const DeliveryAddress({
    required this.id,
    required this.label,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.postcode,
    this.flatNumber,
    this.floor,
    this.gateCode,
    this.deliveryInstructions,
    this.isDefault = false,
    this.latitude,
    this.longitude,
  });

  String get fullAddress {
    final parts = <String>[addressLine1];
    if (addressLine2 != null && addressLine2!.isNotEmpty) {
      parts.add(addressLine2!);
    }
    parts.add(city);
    parts.add(postcode);
    return parts.join(', ');
  }

  /// Check if address might need additional details
  bool get mightNeedFlatNumber {
    final lower = addressLine1.toLowerCase();
    return (lower.contains('flat') ||
            lower.contains('apartment') ||
            lower.contains('apt')) &&
        (flatNumber == null || flatNumber!.isEmpty);
  }

  bool get mightNeedGateCode {
    final lower = addressLine1.toLowerCase();
    return (lower.contains('gate') ||
            lower.contains('estate') ||
            lower.contains('complex')) &&
        (gateCode == null || gateCode!.isEmpty);
  }

  bool get mightNeedFloor {
    final lower = addressLine1.toLowerCase();
    return (lower.contains('floor') ||
            lower.contains('flat') ||
            lower.contains('apartment')) &&
        (floor == null || floor!.isEmpty);
  }

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      id: json['id'] as String,
      label: json['label'] as String,
      addressLine1: json['addressLine1'] as String,
      addressLine2: json['addressLine2'] as String?,
      city: json['city'] as String,
      postcode: json['postcode'] as String,
      flatNumber: json['flatNumber'] as String?,
      floor: json['floor'] as String?,
      gateCode: json['gateCode'] as String?,
      deliveryInstructions: json['deliveryInstructions'] as String?,
      isDefault: json['isDefault'] as bool? ?? false,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'postcode': postcode,
      'flatNumber': flatNumber,
      'floor': floor,
      'gateCode': gateCode,
      'deliveryInstructions': deliveryInstructions,
      'isDefault': isDefault,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  DeliveryAddress copyWith({
    String? id,
    String? label,
    String? addressLine1,
    String? addressLine2,
    String? city,
    String? postcode,
    String? flatNumber,
    String? floor,
    String? gateCode,
    String? deliveryInstructions,
    bool? isDefault,
    double? latitude,
    double? longitude,
  }) {
    return DeliveryAddress(
      id: id ?? this.id,
      label: label ?? this.label,
      addressLine1: addressLine1 ?? this.addressLine1,
      addressLine2: addressLine2 ?? this.addressLine2,
      city: city ?? this.city,
      postcode: postcode ?? this.postcode,
      flatNumber: flatNumber ?? this.flatNumber,
      floor: floor ?? this.floor,
      gateCode: gateCode ?? this.gateCode,
      deliveryInstructions: deliveryInstructions ?? this.deliveryInstructions,
      isDefault: isDefault ?? this.isDefault,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }
}
