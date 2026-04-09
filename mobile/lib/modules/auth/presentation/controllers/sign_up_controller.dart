import 'package:flutter/foundation.dart';

import '../../data/auth_repository.dart';
import '../../domain/auth_state.dart';
import 'auth_controller.dart';

class SignUpFormData {
  final String firstName;
  final String lastName;
  final String email;
  final String password;
  final String confirmPassword;
  final String ucfId;
  final String? major;

  const SignUpFormData({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    required this.confirmPassword,
    required this.ucfId,
    required this.major,
  });
}

class SignUpController extends ChangeNotifier {
  SignUpController({
    required AuthRepository authRepository,
    required AuthController authController,
  })  : _authRepository = authRepository,
        _authController = authController;

  final AuthRepository _authRepository;
  final AuthController _authController;

  AuthState _state = const AuthState(status: AuthStatus.unauthenticated);

  AuthState get state => _state;
  bool get isLoading => _state.isLoading;
  String? get errorMessage => _state.isFailure ? _state.message : null;

  bool canContinue({
    required int step,
    required SignUpFormData form,
  }) {
    switch (step) {
      case 0:
        return form.firstName.trim().isNotEmpty &&
            form.lastName.trim().isNotEmpty &&
            form.email.trim().isNotEmpty;
      case 1:
        return form.password.length >= 6 &&
            form.password == form.confirmPassword;
      case 2:
        return form.ucfId.trim().isNotEmpty && form.major != null;
      default:
        return false;
    }
  }

  String? validateEmailStep(String email) {
    final trimmed = email.trim();
    if (trimmed.isEmpty) {
      return 'UCF email is required.';
    }
    if (!_isValidUcfEmail(trimmed)) {
      return 'Must be a valid UCF email address.';
    }
    return null;
  }

  String? validatePasswordMatch({
    required String password,
    required String confirmPassword,
  }) {
    if (confirmPassword.isEmpty) {
      return null;
    }
    if (password != confirmPassword) {
      return 'Passwords must match.';
    }
    return null;
  }

  Future<bool> register(SignUpFormData form) async {
    final validationMessage = _validateForSubmission(form);
    if (validationMessage != null) {
      _setFailure(validationMessage);
      return false;
    }

    _setLoading();
    _authController.setLoading();

    try {
      final result = await _authRepository.register(
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        ucfId: form.ucfId.trim(),
        major: form.major!,
        email: form.email.trim(),
        password: form.password,
      );

      _state = AuthState(
        status: AuthStatus.verificationPending,
        email: result.email,
        message: result.message,
      );
      _authController.setVerificationPending(
        email: result.email,
        message: result.message,
      );
      notifyListeners();
      return true;
    } catch (error) {
      final message = error.toString().replaceFirst('Exception: ', '');
      _setFailure(message);
      _authController.setFailure(message);
      return false;
    }
  }

  void clearError() {
    _state = _state.copyWith(
      status: AuthStatus.unauthenticated,
      message: null,
    );
    notifyListeners();
  }

  String? _validateForSubmission(SignUpFormData form) {
    if (form.firstName.trim().isEmpty ||
        form.lastName.trim().isEmpty ||
        form.email.trim().isEmpty ||
        form.password.isEmpty ||
        form.confirmPassword.isEmpty ||
        form.ucfId.trim().isEmpty ||
        form.major == null) {
      return 'Please complete all required fields.';
    }

    if (!_isValidUcfEmail(form.email.trim())) {
      return 'Must be a valid UCF email address.';
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (form.password != form.confirmPassword) {
      return 'Passwords must match.';
    }

    return null;
  }

  bool _isValidUcfEmail(String email) => email.endsWith('@ucf.edu');

  void _setLoading() {
    _state = _state.copyWith(
      status: AuthStatus.loading,
      message: null,
      email: null,
    );
    notifyListeners();
  }

  void _setFailure(String message) {
    _state = _state.copyWith(
      status: AuthStatus.failure,
      message: message,
    );
    notifyListeners();
  }
}
