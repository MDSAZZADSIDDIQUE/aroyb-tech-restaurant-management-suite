import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/user_profile.dart';
import '../../data/models/order.dart';
import '../../data/models/restaurant.dart';
import '../../data/repositories/user_repository.dart';
import '../../data/repositories/restaurant_repository.dart';

/// User profile state notifier
class UserNotifier extends StateNotifier<UserProfile> {
  final UserRepository _repository;

  UserNotifier(this._repository) : super(_repository.getProfile());

  Future<void> updateProfile({
    String? name,
    String? email,
    String? phone,
    bool? pushNotificationsEnabled,
    bool? marketingEnabled,
  }) async {
    state = await _repository.updateProfile(
      name: name,
      email: email,
      phone: phone,
      pushNotificationsEnabled: pushNotificationsEnabled,
      marketingEnabled: marketingEnabled,
    );
  }

  Future<void> toggleFavourite(String itemId) async {
    if (_repository.isFavourite(itemId)) {
      state = await _repository.removeFromFavourites(itemId);
    } else {
      state = await _repository.addToFavourites(itemId);
    }
  }

  bool isFavourite(String itemId) {
    return state.favouriteItemIds.contains(itemId);
  }

  Future<void> addAddress(DeliveryAddress address) async {
    state = await _repository.addAddress(address);
  }

  Future<void> updateAddress(DeliveryAddress address) async {
    state = await _repository.updateAddress(address);
  }

  Future<void> deleteAddress(String addressId) async {
    state = await _repository.deleteAddress(addressId);
  }

  Future<void> setDefaultAddress(String addressId) async {
    state = await _repository.setDefaultAddress(addressId);
  }

  Future<void> addLoyaltyPoints(int points) async {
    state = await _repository.addLoyaltyPoints(points);
  }

  Future<void> addLoyaltyStamp() async {
    state = await _repository.addLoyaltyStamp();
  }

  Future<void> spendLoyaltyPoints(int points) async {
    state = await _repository.spendLoyaltyPoints(points);
  }

  Future<void> spendLoyaltyStamps(int stamps) async {
    state = await _repository.spendLoyaltyStamps(stamps);
  }

  Future<void> applyReferralCode(String code) async {
    state = await _repository.applyReferralCode(code);
  }

  Future<void> updateAfterOrder(double orderTotal) async {
    state = await _repository.updateAfterOrder(orderTotal);
  }

  Future<void> refreshProfile() async {
    state = _repository.getProfile();
  }

  Future<void> resetUserData() async {
    await _repository.resetUserData();
    state = _repository.getProfile();
  }
}

final userProvider = StateNotifierProvider<UserNotifier, UserProfile>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return UserNotifier(repository);
});

/// Selected restaurant state
class SelectedRestaurantNotifier extends StateNotifier<Restaurant?> {
  final UserRepository _userRepository;
  final RestaurantRepository _restaurantRepository;

  SelectedRestaurantNotifier(this._userRepository, this._restaurantRepository)
      : super(null) {
    _loadSelectedRestaurant();
  }

  Future<void> _loadSelectedRestaurant() async {
    final restaurantId = _userRepository.getSelectedRestaurantId();
    if (restaurantId != null) {
      state = await _restaurantRepository.getRestaurantById(restaurantId);
    } else {
      state = await _restaurantRepository.getDefaultRestaurant();
    }
  }

  Future<void> selectRestaurant(Restaurant restaurant) async {
    await _userRepository.setSelectedRestaurant(restaurant.id);
    state = restaurant;
  }
}

final selectedRestaurantProvider =
    StateNotifierProvider<SelectedRestaurantNotifier, Restaurant?>((ref) {
  final userRepo = ref.watch(userRepositoryProvider);
  final restaurantRepo = ref.watch(restaurantRepositoryProvider);
  return SelectedRestaurantNotifier(userRepo, restaurantRepo);
});

/// All restaurants provider
final restaurantsProvider = FutureProvider<List<Restaurant>>((ref) async {
  final repository = ref.watch(restaurantRepositoryProvider);
  return repository.getAllRestaurants();
});

/// Favourite item IDs provider
final favouriteItemIdsProvider = Provider<List<String>>((ref) {
  final user = ref.watch(userProvider);
  return user.favouriteItemIds;
});

/// Addresses provider
final addressesProvider = Provider<List<DeliveryAddress>>((ref) {
  final user = ref.watch(userProvider);
  return user.addresses;
});

/// Default address provider
final defaultAddressProvider = Provider<DeliveryAddress?>((ref) {
  final user = ref.watch(userProvider);
  return user.defaultAddress;
});
