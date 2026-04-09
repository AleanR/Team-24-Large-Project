import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:nitropicks/core/storage/secure_storage_service.dart';
import 'package:nitropicks/modules/auth/data/auth_api_service.dart';
import 'package:nitropicks/modules/auth/data/auth_repository.dart';
import 'package:nitropicks/modules/auth/domain/auth_state.dart';
import 'package:nitropicks/modules/auth/presentation/controllers/auth_controller.dart';
import 'package:nitropicks/modules/auth/presentation/controllers/sign_in_controller.dart';

void main() {
  group('SignInController', () {
    test('successful sign in updates both controller states', () async {
      final authController = AuthController();
      final repository = AuthRepository(
        apiService: AuthApiService(
          client: MockClient((request) async {
            return http.Response(
              jsonEncode({
                '_id': 'user-1',
                'firstname': 'Reggie',
                'lastname': 'Gaines',
                'username': 'rgaines',
                'email': 'knight@ucf.edu',
                'isVerified': true,
              }),
              200,
            );
          }),
        ),
        storageService: SecureStorageService(),
      );
      final controller = SignInController(
        authRepository: repository,
        authController: authController,
      );

      final success = await controller.signIn(
        email: 'knight@ucf.edu',
        password: 'password123',
      );

      expect(success, isTrue);
      expect(controller.state.status, AuthStatus.authenticated);
      expect(authController.state.status, AuthStatus.authenticated);
      expect(authController.state.user?.email, 'knight@ucf.edu');
    });
  });
}
