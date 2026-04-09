import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/constants/api_constants.dart';
import '../../../core/errors/app_exception.dart';

class AuthApiService {
  AuthApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  static const _baseUrl = ApiConstants.baseUrl;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/users/auth/login'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    return _decodeResponse(
      response,
      fallbackMessage: 'Unable to sign in right now.',
    );
  }

  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String ucfId,
    required String major,
    required String email,
    required String password,
    required String username,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/users/auth/register'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'firstname': firstName,
        'lastname': lastName,
        'ucfID': ucfId,
        'major': major,
        'email': email,
        'password': password,
        'username': username,
      }),
    );

    return _decodeResponse(
      response,
      fallbackMessage: 'Unable to create your account right now.',
    );
  }

  Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/users/forgot-password'),
      headers: _jsonHeaders,
      body: jsonEncode({'email': email}),
    );

    return _decodeResponse(
      response,
      fallbackMessage: 'Unable to send reset instructions.',
    );
  }

  static const Map<String, String> _jsonHeaders = {
    'Content-Type': 'application/json',
  };

  Map<String, dynamic> _decodeResponse(
    http.Response response, {
    required String fallbackMessage,
  }) {
    final body = response.body.isNotEmpty
        ? jsonDecode(response.body) as Map<String, dynamic>
        : <String, dynamic>{};

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final message = body['message']?.toString() ?? fallbackMessage;
    throw AppException(message);
  }
}
