import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/np_button.dart';
import '../widgets/np_text_field.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _errorMessage = ValueNotifier<String?>('');
  final _authService = AuthApiService();
  bool _isLoading = false;

  static final _titleStyle = GoogleFonts.dmSans(
    fontSize: 40,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    height: 1.1,
    letterSpacing: -1.5,
  );

  static final _subtitleStyle = GoogleFonts.dmSans(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  static final _linkStyle = GoogleFonts.dmSans(
    fontSize: 15,
    color: AppColors.gold,
    fontWeight: FontWeight.w600,
  );

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _errorMessage.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || !email.contains('@')) {
      _errorMessage.value = 'Enter a valid email address';
      return;
    }

    if (password.isEmpty) {
      _errorMessage.value = 'Enter your password';
      return;
    }

    _errorMessage.value = null;
    setState(() => _isLoading = true);

    try {
      final response = await _authService.login(email: email, password: password);
      if (!mounted) return;
      setState(() => _isLoading = false);

      final username = (response['firstname'] as String?)?.trim() ??
          email.split('@').first;
      Navigator.pushReplacementNamed(context, '/welcome',
          arguments: username);
    } on AuthException catch (error) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _errorMessage.value = error.message;
    } catch (error) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _errorMessage.value = 'Unable to sign in. Try again later.';
    }
  }

  void _goToSignUp() {
    Navigator.pushReplacementNamed(context, '/signup');
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            const _SignInBackground(),
            SafeArea(
              child: GestureDetector(
                onTap: () => FocusScope.of(context).unfocus(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new,
                            color: AppColors.textPrimary, size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 8),
                      child: Text('Welcome Back', style: _titleStyle),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                      child: Text(
                        'Sign in to continue charging your picks.',
                        style: _subtitleStyle,
                      ),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        child: Column(
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111827),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  NpTextField(
                                    label: 'UCF Email',
                                    hint: 'you@ucf.edu',
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                  ),
                                  const SizedBox(height: 20),
                                  NpTextField(
                                    label: 'Password',
                                    hint: 'Enter your password',
                                    controller: _passwordController,
                                    obscureText: true,
                                  ),
                                  const SizedBox(height: 16),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: GestureDetector(
                                      onTap: () {},
                                      child: Text(
                                        'Forgot password?',
                                        style: _linkStyle,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ValueListenableBuilder<String?>(
                                    valueListenable: _errorMessage,
                                    builder: (context, error, child) {
                                      if (error == null || error.isEmpty) {
                                        return const SizedBox.shrink();
                                      }
                                      return Text(
                                        error,
                                        style: GoogleFonts.dmSans(
                                          fontSize: 13,
                                          color: const Color(0xFFEF4444),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            NpButton(
                              label: 'Sign In',
                              variant: NpButtonVariant.primary,
                              loading: _isLoading,
                              onPressed: _isLoading ? null : _submit,
                            ),
                            const SizedBox(height: 16),
                            NpButton(
                              label: 'Create Account',
                              variant: NpButtonVariant.secondary,
                              onPressed: _goToSignUp,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SignInBackground extends StatelessWidget {
  const _SignInBackground();

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF081018),
              Color(0xFF0E161F),
              Color(0xFF0F1217),
            ],
          ),
        ),
      ),
    );
  }
}
