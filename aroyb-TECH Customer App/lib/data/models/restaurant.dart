import 'package:flutter/foundation.dart';

/// Restaurant model representing a restaurant location
@immutable
class Restaurant {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String address;
  final String phone;
  final String email;
  final double latitude;
  final double longitude;
  final List<OpeningHours> openingHours;
  final double deliveryFee;
  final double minimumOrder;
  final double serviceCharge;
  final int estimatedDeliveryMinutes;
  final int estimatedCollectionMinutes;
  final double rating;
  final int reviewCount;
  final bool isOpen;
  final List<String> cuisineTypes;

  const Restaurant({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.address,
    required this.phone,
    required this.email,
    this.latitude = 0,
    this.longitude = 0,
    required this.openingHours,
    required this.deliveryFee,
    required this.minimumOrder,
    this.serviceCharge = 0,
    required this.estimatedDeliveryMinutes,
    required this.estimatedCollectionMinutes,
    required this.rating,
    required this.reviewCount,
    this.isOpen = true,
    this.cuisineTypes = const [],
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      address: json['address'] as String,
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      openingHours: (json['openingHours'] as List<dynamic>?)
              ?.map((e) => OpeningHours.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 2.99,
      minimumOrder: (json['minimumOrder'] as num?)?.toDouble() ?? 10.0,
      serviceCharge: (json['serviceCharge'] as num?)?.toDouble() ?? 0,
      estimatedDeliveryMinutes: json['estimatedDeliveryMinutes'] as int? ?? 30,
      estimatedCollectionMinutes:
          json['estimatedCollectionMinutes'] as int? ?? 15,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      reviewCount: json['reviewCount'] as int? ?? 0,
      isOpen: json['isOpen'] as bool? ?? true,
      cuisineTypes: (json['cuisineTypes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'address': address,
      'phone': phone,
      'email': email,
      'latitude': latitude,
      'longitude': longitude,
      'openingHours': openingHours.map((e) => e.toJson()).toList(),
      'deliveryFee': deliveryFee,
      'minimumOrder': minimumOrder,
      'serviceCharge': serviceCharge,
      'estimatedDeliveryMinutes': estimatedDeliveryMinutes,
      'estimatedCollectionMinutes': estimatedCollectionMinutes,
      'rating': rating,
      'reviewCount': reviewCount,
      'isOpen': isOpen,
      'cuisineTypes': cuisineTypes,
    };
  }

  Restaurant copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    String? address,
    String? phone,
    String? email,
    double? latitude,
    double? longitude,
    List<OpeningHours>? openingHours,
    double? deliveryFee,
    double? minimumOrder,
    double? serviceCharge,
    int? estimatedDeliveryMinutes,
    int? estimatedCollectionMinutes,
    double? rating,
    int? reviewCount,
    bool? isOpen,
    List<String>? cuisineTypes,
  }) {
    return Restaurant(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      openingHours: openingHours ?? this.openingHours,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      minimumOrder: minimumOrder ?? this.minimumOrder,
      serviceCharge: serviceCharge ?? this.serviceCharge,
      estimatedDeliveryMinutes:
          estimatedDeliveryMinutes ?? this.estimatedDeliveryMinutes,
      estimatedCollectionMinutes:
          estimatedCollectionMinutes ?? this.estimatedCollectionMinutes,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      isOpen: isOpen ?? this.isOpen,
      cuisineTypes: cuisineTypes ?? this.cuisineTypes,
    );
  }
}

/// Opening hours for a specific day
@immutable
class OpeningHours {
  final int dayOfWeek; // 1 = Monday, 7 = Sunday
  final String openTime; // HH:mm format
  final String closeTime; // HH:mm format
  final bool isClosed;

  const OpeningHours({
    required this.dayOfWeek,
    required this.openTime,
    required this.closeTime,
    this.isClosed = false,
  });

  factory OpeningHours.fromJson(Map<String, dynamic> json) {
    return OpeningHours(
      dayOfWeek: json['dayOfWeek'] as int,
      openTime: json['openTime'] as String? ?? '11:00',
      closeTime: json['closeTime'] as String? ?? '23:00',
      isClosed: json['isClosed'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'dayOfWeek': dayOfWeek,
      'openTime': openTime,
      'closeTime': closeTime,
      'isClosed': isClosed,
    };
  }

  String get dayName {
    switch (dayOfWeek) {
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      case 7:
        return 'Sunday';
      default:
        return '';
    }
  }
}
