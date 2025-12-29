import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/menu_item.dart';
import '../../data/models/order.dart';
import '../../data/repositories/menu_repository.dart';
import '../../data/repositories/order_repository.dart';
import '../../core/constants/app_constants.dart';

/// AI prediction engine for "Your Usual" feature
class PredictionEngine {
  final MenuRepository _menuRepository;
  final OrderRepository _orderRepository;

  PredictionEngine(this._menuRepository, this._orderRepository);

  /// Get predicted items based on order history and time of day
  Future<List<PredictedItem>> getPredictedItems() async {
    final orders = _orderRepository.getOrders();
    if (orders.isEmpty) {
      // Return popular items for new users
      final popular = await _menuRepository.getPopularItems();
      return popular
          .take(3)
          .map((item) => PredictedItem(
                item: item,
                reason: 'Popular with our customers',
                confidence: 0.7,
              ))
          .toList();
    }

    final now = DateTime.now();
    final mealTime = _getMealTime(now.hour);
    final isWeekend = now.weekday >= 6;

    // Analyze order history
    final itemFrequency = <String, ItemAnalysis>{};

    for (final order in orders) {
      final orderMealTime = _getMealTime(order.createdAt.hour);
      final orderIsWeekend = order.createdAt.weekday >= 6;

      // Score items based on time matching
      for (final cartItem in order.items) {
        final itemId = cartItem.menuItem.id;
        final analysis = itemFrequency[itemId] ??
            ItemAnalysis(
              menuItem: cartItem.menuItem,
              totalOrders: 0,
              matchingTimeOrders: 0,
              weekendOrders: 0,
              weekdayOrders: 0,
            );

        analysis.totalOrders++;
        if (orderMealTime == mealTime) {
          analysis.matchingTimeOrders++;
        }
        if (orderIsWeekend) {
          analysis.weekendOrders++;
        } else {
          analysis.weekdayOrders++;
        }

        itemFrequency[itemId] = analysis;
      }
    }

    // Calculate confidence scores
    final predictions = <PredictedItem>[];
    for (final entry in itemFrequency.entries) {
      final analysis = entry.value;

      double confidence = 0.0;
      String reason = '';

      // Base confidence from frequency
      confidence = (analysis.totalOrders / orders.length).clamp(0.0, 0.5);

      // Boost for time matching
      if (analysis.matchingTimeOrders > 0) {
        confidence +=
            0.3 * (analysis.matchingTimeOrders / analysis.totalOrders);
        reason = _getTimeReason(mealTime, now.weekday);
      }

      // Boost for weekend/weekday pattern
      if (isWeekend && analysis.weekendOrders > analysis.weekdayOrders) {
        confidence += 0.1;
        if (reason.isEmpty) {
          reason = 'You often order this on weekends';
        }
      } else if (!isWeekend &&
          analysis.weekdayOrders > analysis.weekendOrders) {
        confidence += 0.1;
        if (reason.isEmpty) {
          reason = 'A weekday favourite of yours';
        }
      }

      if (reason.isEmpty) {
        reason = 'Based on your order history';
      }

      predictions.add(PredictedItem(
        item: analysis.menuItem,
        reason: reason,
        confidence: confidence.clamp(0.0, 1.0),
      ));
    }

    // Sort by confidence and return top 3
    predictions.sort((a, b) => b.confidence.compareTo(a.confidence));
    return predictions.take(3).toList();
  }

  String _getMealTime(int hour) {
    if (hour >= AppConstants.mealTimeBreakfastStart &&
        hour < AppConstants.mealTimeBreakfastEnd) {
      return 'breakfast';
    } else if (hour >= AppConstants.mealTimeLunchStart &&
        hour < AppConstants.mealTimeLunchEnd) {
      return 'lunch';
    } else if (hour >= AppConstants.mealTimeDinnerStart &&
        hour < AppConstants.mealTimeDinnerEnd) {
      return 'dinner';
    }
    return 'other';
  }

  String _getTimeReason(String mealTime, int weekday) {
    final dayName = _getDayName(weekday);
    switch (mealTime) {
      case 'breakfast':
        return 'You often order this for breakfast';
      case 'lunch':
        return 'Your usual lunchtime pick';
      case 'dinner':
        return 'You often order this on $dayName evenings';
      default:
        return 'A regular order of yours';
    }
  }

  String _getDayName(int weekday) {
    switch (weekday) {
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

class ItemAnalysis {
  final MenuItem menuItem;
  int totalOrders;
  int matchingTimeOrders;
  int weekendOrders;
  int weekdayOrders;

  ItemAnalysis({
    required this.menuItem,
    required this.totalOrders,
    required this.matchingTimeOrders,
    required this.weekendOrders,
    required this.weekdayOrders,
  });
}

/// Predicted item with reasoning
class PredictedItem {
  final MenuItem item;
  final String reason;
  final double confidence;

  PredictedItem({
    required this.item,
    required this.reason,
    required this.confidence,
  });
}

final predictionEngineProvider = Provider<PredictionEngine>((ref) {
  final menuRepo = ref.watch(menuRepositoryProvider);
  final orderRepo = ref.watch(orderRepositoryProvider);
  return PredictionEngine(menuRepo, orderRepo);
});

final predictedItemsProvider = FutureProvider<List<PredictedItem>>((ref) async {
  final engine = ref.watch(predictionEngineProvider);
  return engine.getPredictedItems();
});
