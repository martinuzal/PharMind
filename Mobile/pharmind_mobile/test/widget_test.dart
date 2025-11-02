// This is a basic Flutter widget test for PharMind app.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pharmind_mobile/main.dart';

void main() {
  testWidgets('PharMind app smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const PharMindApp());

    // Verify that the splash screen loads
    expect(find.text('PharMind'), findsOneWidget);
  });
}
