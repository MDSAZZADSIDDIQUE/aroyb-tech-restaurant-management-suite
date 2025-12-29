import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/offer.dart';
import '../../data/models/reward.dart';
import '../../data/repositories/offers_repository.dart';
import 'user_provider.dart';

/// Personalized offers provider
final personalizedOffersProvider = FutureProvider<List<Offer>>((ref) async {
  final offersRepo = ref.watch(offersRepositoryProvider);
  final user = ref.watch(userProvider);
  return offersRepo.getPersonalizedOffers(user);
});

/// All offers provider
final allOffersProvider = FutureProvider<List<Offer>>((ref) async {
  final offersRepo = ref.watch(offersRepositoryProvider);
  return offersRepo.getAllOffers();
});

/// All rewards provider
final allRewardsProvider = FutureProvider<List<Reward>>((ref) async {
  final offersRepo = ref.watch(offersRepositoryProvider);
  return offersRepo.getAllRewards();
});

/// Available rewards for current user
final availableRewardsProvider = FutureProvider<List<Reward>>((ref) async {
  final offersRepo = ref.watch(offersRepositoryProvider);
  final user = ref.watch(userProvider);
  return offersRepo.getAvailableRewards(user);
});

/// Redeemed rewards provider
final redeemedRewardsProvider = Provider<List<RedeemedReward>>((ref) {
  final offersRepo = ref.watch(offersRepositoryProvider);
  return offersRepo.getValidRedeemedRewards();
});
