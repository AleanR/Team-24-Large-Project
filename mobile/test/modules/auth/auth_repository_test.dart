import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:nitropicks/core/storage/secure_storage_service.dart';
import 'package:nitropicks/modules/auth/data/auth_api_service.dart';
import 'package:nitropicks/modules/auth/data/auth_repository.dart';

void main() {
  group('AuthRepository', () {
    test('signIn maps server user response', () async {
      final repository = AuthRepository(
        apiService: AuthApiService(
          client: MockClient((request) async {
            expect(request.url.path, '/users/auth/login');
            return http.Response(
              jsonEncode({
                '_id': 'user-1',
                'firstname': 'Reggie',
                'lastname': 'Gaines',
                'username': 'rgaines',
                'email': 'knight@ucf.edu',
                'major': 'CS',
                'ucfID': '1234567',
                'pointBalance': 2000,
                'isVerified': true,
              }),
              200,
            );
          }),
        ),
        storageService: SecureStorageService(),
      );

      final user = await repository.signIn(
        email: 'knight@ucf.edu',
        password: 'password123',
      );

      expect(user.id, 'user-1');
      expect(user.displayName, 'Reggie');
      expect(user.email, 'knight@ucf.edu');
    });

    test('register derives username from email local part', () async {
      final repository = AuthRepository(
        apiService: AuthApiService(
          client: MockClient((request) async {
            expect(request.url.path, '/users/auth/register');
            final body =
                jsonDecode(request.body) as Map<String, dynamic>;
            expect(body['username'], 'knight');
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

      final result = await repository.register(
        firstName: 'Knight',
        lastName: 'Mode',
        ucfId: '1234567',
        major: 'Computer Science',
        email: 'knight@ucf.edu',
        password: 'password123',
      );

      expect(result.email, 'knight@ucf.edu');
      expect(result.token, 'register-token');
    });
  });
}
