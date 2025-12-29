import 'package:flutter/foundation.dart';

/// Loyalty reward model
@immutable
class Reward {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final int pointsCost;
  final int stampsCost;
  final String rewardType; // 'discount', 'free_item', 'free_delivery'
  final double discountAmount;
  final double discountPercentage;
  final String? freeItemId;
  final String? freeItemName;
  final bool isAvailable;
  final DateTime? expiresAt;

  const Reward({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl = '',
    this.pointsCost = 0,
    this.stampsCost = 0,
    required this.rewardType,
    this.discountAmount = 0,
    this.discountPercentage = 0,
    this.freeItemId,
    this.freeItemName,
    this.isAvailable = true,
    this.expiresAt,
  });

  bool get isPointsReward => pointsCost > 0;
  bool get isStampsReward => stampsCost > 0;
  bool get isDiscountReward => rewardType == 'discount';
  bool get isFreeItemReward => rewardType == 'free_item';
  bool get isFreeDeliveryReward => rewardType == 'free_delivery';

  String get valueText {
    if (discountAmount > 0) {
      return '£${discountAmount.toStringAsFixed(2)} off';
    } else if (discountPercentage > 0) {
      return '${discountPercentage.toInt()}% off';
    } else if (freeItemName != null) {
      return 'Free $freeItemName';
    } else if (isFreeDeliveryReward) {
      return 'Free delivery';
    }
    return '';
  }

  factory Reward.fromJson(Map<String, dynamic> json) {
    return Reward(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      pointsCost: json['pointsCost'] as int? ?? 0,
      stampsCost: json['stampsCost'] as int? ?? 0,
      rewardType: json['rewardType'] as String? ?? 'discount',
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
      discountPercentage: (json['discountPercentage'] as num?)?.toDouble() ?? 0,
      freeItemId: json['freeItemId'] as String?,
      freeItemName: json['freeItemName'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'pointsCost': pointsCost,
      'stampsCost': stampsCost,
      'rewardType': rewardType,
      'discountAmount': discountAmount,
      'discountPercentage': discountPercentage,
      'freeItemId': freeItemId,
      'freeItemName': freeItemName,
      'isAvailable': isAvailable,
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}

/// Redeemed reward record
@immutable
class RedeemedReward {
  final String id;
  final String rewardId;
  final String rewardTitle;
  final String code;
  final DateTime redeemedAt;
  final DateTime expiresAt;
  final bool isUsed;
  final DateTime? usedAt;

  const RedeemedReward({
    required this.id,
    required this.rewardId,
    required this.rewardTitle,
    required this.code,
    required this.redeemedAt,
    required this.expiresAt,
    this.isUsed = false,
    this.usedAt,
  });

  bool get isValid => !isUsed && DateTime.now().isBefore(expiresAt);

  factory RedeemedReward.fromJson(Map<String, dynamic> json) {
    return RedeemedReward(
      id: json['id'] as String,
      rewardId: json['rewardId'] as String,
      rewardTitle: json['rewardTitle'] as String? ?? '',
      code: json['code'] as String,
      redeemedAt: DateTime.parse(json['redeemedAt'] as String),
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      isUsed: json['isUsed'] as bool? ?? false,
      usedAt: json['usedAt'] != null
          ? DateTime.parse(json['usedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'rewardId': rewardId,
      'rewardTitle': rewardTitle,
      'code': code,
      'redeemedAt': redeemedAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'isUsed': isUsed,
      'usedAt': usedAt?.toIso8601String(),
    };
  }
}
