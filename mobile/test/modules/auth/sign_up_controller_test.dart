import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:nitropicks/core/storage/secure_storage_service.dart';
import 'package:nitropicks/modules/auth/data/auth_api_service.dart';
import 'package:nitropicks/modules/auth/data/auth_repository.dart';
import 'package:nitropicks/modules/auth/domain/auth_state.dart';
import 'package:nitropicks/modules/auth/presentation/controllers/auth_controller.dart';
import 'package:nitropicks/modules/auth/presentation/controllers/sign_up_controller.dart';

void main() {
  group('SignUpController', () {
    test('successful registration moves to verification pending', () async {
      final authController = AuthController();
      final repository = AuthRepository(
        apiService: AuthApiService(
          client: MockClient((request) async {
            return http.Response(
              jsonEncode({
                'message': 'Email Verification OTP Sent!',
                'otpUrl': 'http://localhost:8080/users/auth/verify-email',
                'token': 'register-token',
              }),
              201,
            );
          }),
        ),
        storageService: SecureStorageService(),
      );
      final controller = SignUpController(
        authRepository: repository,
        authController: authController,
      );

      final success = await controller.register(
        const SignUpFormData(
          firstName: 'Reggie',
          lastName: 'Gaines',
          email: 'knight@ucf.edu',
          password: 'password123',
          confirmPassword: 'password123',
          ucfId: '1234567',
          major: 'Computer Science',
        ),
      );

      expect(success, isTrue);
      expect(controller.state.status, AuthStatus.verificationPending);
      expect(authController.state.status, AuthStatus.verificationPending);
      expect(controller.state.email, 'knight@ucf.edu');
    });
  });
}
