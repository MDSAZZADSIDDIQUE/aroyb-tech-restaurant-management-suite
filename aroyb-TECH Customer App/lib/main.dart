import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for local storage
  await Hive.initFlutter();

  // Open boxes for persistence
  await Hive.openBox('user_data');
  await Hive.openBox('cart_data');
  await Hive.openBox('orders_data');
  await Hive.openBox('notifications_data');

  runApp(const ProviderScope(child: AroybCustomerApp()));
}
