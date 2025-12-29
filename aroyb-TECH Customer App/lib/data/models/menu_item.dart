import 'package:flutter/foundation.dart';

/// Menu item model
@immutable
class MenuItem {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final double price;
  final String categoryId;
  final String categoryName;
  final List<String> dietaryTags;
  final List<String> allergens;
  final int spiceLevel; // 0-4
  final bool isPopular;
  final bool isNew;
  final bool isAvailable;
  final List<ModifierGroup> modifierGroups;
  final int calories;
  final int preparationTime; // in minutes

  const MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.price,
    required this.categoryId,
    required this.categoryName,
    this.dietaryTags = const [],
    this.allergens = const [],
    this.spiceLevel = 0,
    this.isPopular = false,
    this.isNew = false,
    this.isAvailable = true,
    this.modifierGroups = const [],
    this.calories = 0,
    this.preparationTime = 15,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      price: (json['price'] as num).toDouble(),
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String? ?? '',
      dietaryTags: (json['dietaryTags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      allergens: (json['allergens'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      spiceLevel: json['spiceLevel'] as int? ?? 0,
      isPopular: json['isPopular'] as bool? ?? false,
      isNew: json['isNew'] as bool? ?? false,
      isAvailable: json['isAvailable'] as bool? ?? true,
      modifierGroups: (json['modifierGroups'] as List<dynamic>?)
              ?.map((e) => ModifierGroup.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      calories: json['calories'] as int? ?? 0,
      preparationTime: json['preparationTime'] as int? ?? 15,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'price': price,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'dietaryTags': dietaryTags,
      'allergens': allergens,
      'spiceLevel': spiceLevel,
      'isPopular': isPopular,
      'isNew': isNew,
      'isAvailable': isAvailable,
      'modifierGroups': modifierGroups.map((e) => e.toJson()).toList(),
      'calories': calories,
      'preparationTime': preparationTime,
    };
  }

  MenuItem copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    double? price,
    String? categoryId,
    String? categoryName,
    List<String>? dietaryTags,
    List<String>? allergens,
    int? spiceLevel,
    bool? isPopular,
    bool? isNew,
    bool? isAvailable,
    List<ModifierGroup>? modifierGroups,
    int? calories,
    int? preparationTime,
  }) {
    return MenuItem(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      dietaryTags: dietaryTags ?? this.dietaryTags,
      allergens: allergens ?? this.allergens,
      spiceLevel: spiceLevel ?? this.spiceLevel,
      isPopular: isPopular ?? this.isPopular,
      isNew: isNew ?? this.isNew,
      isAvailable: isAvailable ?? this.isAvailable,
      modifierGroups: modifierGroups ?? this.modifierGroups,
      calories: calories ?? this.calories,
      preparationTime: preparationTime ?? this.preparationTime,
    );
  }
}

/// Modifier group (e.g., "Choose your size", "Add extras")
@immutable
class ModifierGroup {
  final String id;
  final String name;
  final bool isRequired;
  final int minSelections;
  final int maxSelections;
  final List<Modifier> modifiers;

  const ModifierGroup({
    required this.id,
    required this.name,
    this.isRequired = false,
    this.minSelections = 0,
    this.maxSelections = 1,
    required this.modifiers,
  });

  factory ModifierGroup.fromJson(Map<String, dynamic> json) {
    return ModifierGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      isRequired: json['isRequired'] as bool? ?? false,
      minSelections: json['minSelections'] as int? ?? 0,
      maxSelections: json['maxSelections'] as int? ?? 1,
      modifiers: (json['modifiers'] as List<dynamic>)
          .map((e) => Modifier.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isRequired': isRequired,
      'minSelections': minSelections,
      'maxSelections': maxSelections,
      'modifiers': modifiers.map((e) => e.toJson()).toList(),
    };
  }
}

/// Individual modifier option
@immutable
class Modifier {
  final String id;
  final String name;
  final double price;
  final bool isDefault;
  final bool isAvailable;

  const Modifier({
    required this.id,
    required this.name,
    this.price = 0,
    this.isDefault = false,
    this.isAvailable = true,
  });

  factory Modifier.fromJson(Map<String, dynamic> json) {
    return Modifier(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num?)?.toDouble() ?? 0,
      isDefault: json['isDefault'] as bool? ?? false,
      isAvailable: json['isAvailable'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'isDefault': isDefault,
      'isAvailable': isAvailable,
    };
  }
}

/// Menu category
@immutable
class MenuCategory {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final int sortOrder;
  final bool isAvailable;

  const MenuCategory({
    required this.id,
    required this.name,
    this.description = '',
    this.imageUrl = '',
    this.sortOrder = 0,
    this.isAvailable = true,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) {
    return MenuCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      sortOrder: json['sortOrder'] as int? ?? 0,
      isAvailable: json['isAvailable'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'sortOrder': sortOrder,
      'isAvailable': isAvailable,
    };
  }
}
