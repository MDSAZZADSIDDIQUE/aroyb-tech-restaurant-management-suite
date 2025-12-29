// This is a basic Flutter widget test.
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:aroyb_customer_app/app.dart';

void main() {
  testWidgets('App launches successfully', (WidgetTester tester) async {
    // Initialize Hive for tests
    await Hive.initFlutter();

    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(child: AroybCustomerApp()),
    );

    // Verify that the app starts
    await tester.pump();

    // App should show something
    expect(find.byType(AroybCustomerApp), findsOneWidget);
  });
}
