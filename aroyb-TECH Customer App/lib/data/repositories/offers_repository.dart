import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/offer.dart';
import '../models/reward.dart';
import '../models/user_profile.dart';

/// Repository for offers and rewards
class OffersRepository {
  static const _boxName = 'user_data';
  static const _redeemedRewardsKey = 'redeemed_rewards';
  static const _usedOffersKey = 'used_offers';

  List<Offer>? _offers;
  List<Reward>? _rewards;

  Box get _box => Hive.box(_boxName);

  Future<void> _loadOffers() async {
    if (_offers != null) return;
    final jsonString = await rootBundle.loadString('assets/data/offers.json');
    final data = json.decode(jsonString) as Map<String, dynamic>;
    _offers = (data['offers'] as List<dynamic>)
        .map((e) => Offer.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> _loadRewards() async {
    if (_rewards != null) return;
    final jsonString = await rootBundle.loadString('assets/data/rewards.json');
    final data = json.decode(jsonString) as Map<String, dynamic>;
    _rewards = (data['rewards'] as List<dynamic>)
        .map((e) => Reward.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Get all offers
  Future<List<Offer>> getAllOffers() async {
    await _loadOffers();
    return _offers!.where((o) => o.isValid).toList();
  }

  /// Get personalized offers for user
  Future<List<Offer>> getPersonalizedOffers(UserProfile user) async {
    await _loadOffers();
    final usedOfferIds = _getUsedOfferIds();

    return _offers!.where((offer) {
      if (!offer.isValid) return false;
      if (usedOfferIds.contains(offer.id)) return false;

      final targeting = offer.targeting;

      // Check targeting rules
      if (targeting.forAll) return true;
      if (targeting.forLapsedUsers &&
          user.isLapsed(days: targeting.lapsedDaysThreshold)) return true;
      if (targeting.forHighSpenders &&
          user.isHighSpender(threshold: targeting.highSpenderThreshold))
        return true;
      if (targeting.forNewUsers && user.isNewCustomer) return true;
      if (targeting.forVegetarians) {
        // Demo: assume user is vegetarian if they have vegetarian favourites
        // In real app, this would be based on order history
        return true;
      }

      return false;
    }).toList();
  }

  /// Get offer by code
  Future<Offer?> getOfferByCode(String code) async {
    await _loadOffers();
    try {
      return _offers!.firstWhere(
        (o) => o.code.toLowerCase() == code.toLowerCase() && o.isValid,
      );
    } catch (_) {
      return null;
    }
  }

  /// Mark offer as used
  Future<void> markOfferUsed(String offerId) async {
    final usedIds = _getUsedOfferIds();
    usedIds.add(offerId);
    await _box.put(_usedOffersKey, json.encode(usedIds));
  }

  List<String> _getUsedOfferIds() {
    final usedJson = _box.get(_usedOffersKey, defaultValue: '[]') as String;
    return (json.decode(usedJson) as List<dynamic>).cast<String>();
  }

  /// Get all rewards
  Future<List<Reward>> getAllRewards() async {
    await _loadRewards();
    return _rewards!.where((r) => r.isAvailable).toList();
  }

  /// Get available rewards for user
  Future<List<Reward>> getAvailableRewards(UserProfile user) async {
    await _loadRewards();
    return _rewards!.where((r) {
      if (!r.isAvailable) return false;
      if (r.isPointsReward && user.loyaltyPoints >= r.pointsCost) return true;
      if (r.isStampsReward && user.loyaltyStamps >= r.stampsCost) return true;
      return false;
    }).toList();
  }

  /// Redeem reward
  Future<RedeemedReward> redeemReward(Reward reward) async {
    final uuid = const Uuid();
    final redeemed = RedeemedReward(
      id: uuid.v4(),
      rewardId: reward.id,
      rewardTitle: reward.title,
      code:
          'RWD${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
      redeemedAt: DateTime.now(),
      expiresAt: DateTime.now().add(const Duration(days: 30)),
    );

    final redeemedList = getRedeemedRewards();
    redeemedList.add(redeemed);
    await _box.put(_redeemedRewardsKey,
        json.encode(redeemedList.map((e) => e.toJson()).toList()));

    return redeemed;
  }

  /// Get redeemed rewards
  List<RedeemedReward> getRedeemedRewards() {
    final redeemedJson =
        _box.get(_redeemedRewardsKey, defaultValue: '[]') as String;
    return (json.decode(redeemedJson) as List<dynamic>)
        .map((e) => RedeemedReward.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Get valid redeemed rewards
  List<RedeemedReward> getValidRedeemedRewards() {
    return getRedeemedRewards().where((r) => r.isValid).toList();
  }
}

final offersRepositoryProvider = Provider<OffersRepository>((ref) {
  return OffersRepository();
});
