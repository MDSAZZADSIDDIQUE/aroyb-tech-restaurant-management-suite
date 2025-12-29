import 'package:flutter/foundation.dart';

/// Notification model for in-app notifications
@immutable
class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type; // 'order_status', 'marketing', 'loyalty', 'referral'
  final String? orderId;
  final String? imageUrl;
  final Map<String, dynamic>? data;
  final DateTime createdAt;
  final bool isRead;
  final String? actionUrl;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.orderId,
    this.imageUrl,
    this.data,
    required this.createdAt,
    this.isRead = false,
    this.actionUrl,
  });

  bool get isOrderNotification => type == 'order_status';
  bool get isMarketingNotification => type == 'marketing';
  bool get isLoyaltyNotification => type == 'loyalty';

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      orderId: json['orderId'] as String?,
      imageUrl: json['imageUrl'] as String?,
      data: json['data'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool? ?? false,
      actionUrl: json['actionUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type,
      'orderId': orderId,
      'imageUrl': imageUrl,
      'data': data,
      'createdAt': createdAt.toIso8601String(),
      'isRead': isRead,
      'actionUrl': actionUrl,
    };
  }

  AppNotification copyWith({
    String? id,
    String? title,
    String? body,
    String? type,
    String? orderId,
    String? imageUrl,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    bool? isRead,
    String? actionUrl,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      orderId: orderId ?? this.orderId,
      imageUrl: imageUrl ?? this.imageUrl,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      isRead: isRead ?? this.isRead,
      actionUrl: actionUrl ?? this.actionUrl,
    );
  }
}

/// Support ticket model for order issues
@immutable
class SupportTicket {
  final String id;
  final String orderId;
  final String orderNumber;
  final String issueType; // 'missing_item', 'wrong_item', 'late', 'other'
  final String description;
  final List<String> affectedItemIds;
  final List<String> photoUrls;
  final String suggestedResolution; // 'refund', 'voucher', 'remake'
  final String status; // 'submitted', 'in_review', 'resolved'
  final DateTime createdAt;
  final String? resolution;
  final DateTime? resolvedAt;

  const SupportTicket({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.issueType,
    required this.description,
    this.affectedItemIds = const [],
    this.photoUrls = const [],
    required this.suggestedResolution,
    this.status = 'submitted',
    required this.createdAt,
    this.resolution,
    this.resolvedAt,
  });

  String get issueTypeLabel {
    switch (issueType) {
      case 'missing_item':
        return 'Missing Item';
      case 'wrong_item':
        return 'Wrong Item';
      case 'late':
        return 'Late Delivery';
      case 'other':
        return 'Other Issue';
      default:
        return 'Issue';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'in_review':
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  }

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      orderNumber: json['orderNumber'] as String? ?? '',
      issueType: json['issueType'] as String,
      description: json['description'] as String,
      affectedItemIds: (json['affectedItemIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      photoUrls: (json['photoUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      suggestedResolution: json['suggestedResolution'] as String,
      status: json['status'] as String? ?? 'submitted',
      createdAt: DateTime.parse(json['createdAt'] as String),
      resolution: json['resolution'] as String?,
      resolvedAt: json['resolvedAt'] != null
          ? DateTime.parse(json['resolvedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'orderNumber': orderNumber,
      'issueType': issueType,
      'description': description,
      'affectedItemIds': affectedItemIds,
      'photoUrls': photoUrls,
      'suggestedResolution': suggestedResolution,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'resolution': resolution,
      'resolvedAt': resolvedAt?.toIso8601String(),
    };
  }
}
