import 'package:flutter/foundation.dart';

/// Promotional offer model
@immutable
class Offer {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final String code;
  final double discountAmount;
  final double discountPercentage;
  final double minimumOrder;
  final DateTime validFrom;
  final DateTime validUntil;
  final bool isActive;
  final OfferTargeting targeting;
  final String? targetingReason;
  final bool isUsed;
  final int usageLimit;
  final int usageCount;

  const Offer({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl = '',
    required this.code,
    this.discountAmount = 0,
    this.discountPercentage = 0,
    this.minimumOrder = 0,
    required this.validFrom,
    required this.validUntil,
    this.isActive = true,
    this.targeting = const OfferTargeting(),
    this.targetingReason,
    this.isUsed = false,
    this.usageLimit = 1,
    this.usageCount = 0,
  });

  bool get isValid {
    final now = DateTime.now();
    return isActive &&
        now.isAfter(validFrom) &&
        now.isBefore(validUntil) &&
        (usageLimit == 0 || usageCount < usageLimit);
  }

  bool get hasPercentageDiscount => discountPercentage > 0;
  bool get hasFixedDiscount => discountAmount > 0;

  String get discountText {
    if (hasPercentageDiscount) {
      return '${discountPercentage.toInt()}% off';
    } else if (hasFixedDiscount) {
      return '£${discountAmount.toStringAsFixed(2)} off';
    }
    return '';
  }

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      code: json['code'] as String,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
      discountPercentage: (json['discountPercentage'] as num?)?.toDouble() ?? 0,
      minimumOrder: (json['minimumOrder'] as num?)?.toDouble() ?? 0,
      validFrom: DateTime.parse(json['validFrom'] as String),
      validUntil: DateTime.parse(json['validUntil'] as String),
      isActive: json['isActive'] as bool? ?? true,
      targeting: json['targeting'] != null
          ? OfferTargeting.fromJson(json['targeting'] as Map<String, dynamic>)
          : const OfferTargeting(),
      targetingReason: json['targetingReason'] as String?,
      isUsed: json['isUsed'] as bool? ?? false,
      usageLimit: json['usageLimit'] as int? ?? 1,
      usageCount: json['usageCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'code': code,
      'discountAmount': discountAmount,
      'discountPercentage': discountPercentage,
      'minimumOrder': minimumOrder,
      'validFrom': validFrom.toIso8601String(),
      'validUntil': validUntil.toIso8601String(),
      'isActive': isActive,
      'targeting': targeting.toJson(),
      'targetingReason': targetingReason,
      'isUsed': isUsed,
      'usageLimit': usageLimit,
      'usageCount': usageCount,
    };
  }

  Offer copyWith({
    String? id,
    String? title,
    String? description,
    String? imageUrl,
    String? code,
    double? discountAmount,
    double? discountPercentage,
    double? minimumOrder,
    DateTime? validFrom,
    DateTime? validUntil,
    bool? isActive,
    OfferTargeting? targeting,
    String? targetingReason,
    bool? isUsed,
    int? usageLimit,
    int? usageCount,
  }) {
    return Offer(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      code: code ?? this.code,
      discountAmount: discountAmount ?? this.discountAmount,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      minimumOrder: minimumOrder ?? this.minimumOrder,
      validFrom: validFrom ?? this.validFrom,
      validUntil: validUntil ?? this.validUntil,
      isActive: isActive ?? this.isActive,
      targeting: targeting ?? this.targeting,
      targetingReason: targetingReason ?? this.targetingReason,
      isUsed: isUsed ?? this.isUsed,
      usageLimit: usageLimit ?? this.usageLimit,
      usageCount: usageCount ?? this.usageCount,
    );
  }
}

/// Offer targeting rules
@immutable
class OfferTargeting {
  final bool forLapsedUsers;
  final int lapsedDaysThreshold;
  final bool forHighSpenders;
  final double highSpenderThreshold;
  final bool forNewUsers;
  final bool forVegetarians;
  final bool forAll;
  final List<String> specificItemIds;
  final List<String> specificCategoryIds;

  const OfferTargeting({
    this.forLapsedUsers = false,
    this.lapsedDaysThreshold = 7,
    this.forHighSpenders = false,
    this.highSpenderThreshold = 100,
    this.forNewUsers = false,
    this.forVegetarians = false,
    this.forAll = true,
    this.specificItemIds = const [],
    this.specificCategoryIds = const [],
  });

  factory OfferTargeting.fromJson(Map<String, dynamic> json) {
    return OfferTargeting(
      forLapsedUsers: json['forLapsedUsers'] as bool? ?? false,
      lapsedDaysThreshold: json['lapsedDaysThreshold'] as int? ?? 7,
      forHighSpenders: json['forHighSpenders'] as bool? ?? false,
      highSpenderThreshold:
          (json['highSpenderThreshold'] as num?)?.toDouble() ?? 100,
      forNewUsers: json['forNewUsers'] as bool? ?? false,
      forVegetarians: json['forVegetarians'] as bool? ?? false,
      forAll: json['forAll'] as bool? ?? true,
      specificItemIds: (json['specificItemIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      specificCategoryIds: (json['specificCategoryIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'forLapsedUsers': forLapsedUsers,
      'lapsedDaysThreshold': lapsedDaysThreshold,
      'forHighSpenders': forHighSpenders,
      'highSpenderThreshold': highSpenderThreshold,
      'forNewUsers': forNewUsers,
      'forVegetarians': forVegetarians,
      'forAll': forAll,
      'specificItemIds': specificItemIds,
      'specificCategoryIds': specificCategoryIds,
    };
  }
}
