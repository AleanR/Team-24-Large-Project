import 'user.dart';

enum AuthStatus {
  initial,
  unauthenticated,
  loading,
  authenticated,
  verificationPending,
  passwordResetSent,
  failure,
}

const Object _authSentinel = Object();

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? message;
  final String? email;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.message,
    this.email,
  });

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;
  bool get isFailure => status == AuthStatus.failure;

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    Object? message = _authSentinel,
    Object? email = _authSentinel,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      message: identical(message, _authSentinel) ? this.message : message as String?,
      email: identical(email, _authSentinel) ? this.email : email as String?,
    );
  }
}
