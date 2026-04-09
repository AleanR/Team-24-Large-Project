import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../data/auth_repository.dart';
import '../controllers/auth_controller.dart';
import '../controllers/sign_in_controller.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/auth_shell.dart';
import '../../../../shared/widgets/np_button.dart';
import '../../../../shared/widgets/np_text_field.dart';

class SignInScreen extends StatefulWidget {
  final AuthRepository authRepository;
  final AuthController authController;

  const SignInScreen({
    super.key,
    required this.authRepository,
    required this.authController,
  });

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  late final SignInController _controller;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _resetEmailController = TextEditingController();

  bool _isResetMode = false;

  @override
  void initState() {
    super.initState();
    _controller = SignInController(
      authRepository: widget.authRepository,
      authController: widget.authController,
    )..addListener(_handleControllerChanged);

    _emailController.addListener(_refresh);
    _passwordController.addListener(_refresh);
    _resetEmailController.addListener(_refresh);
  }

  @override
  void dispose() {
    _controller
      ..removeListener(_handleControllerChanged)
      ..dispose();
    _emailController
      ..removeListener(_refresh)
      ..dispose();
    _passwordController
      ..removeListener(_refresh)
      ..dispose();
    _resetEmailController
      ..removeListener(_refresh)
      ..dispose();
    super.dispose();
  }

  void _refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  void _handleControllerChanged() {
    if (!mounted) {
      return;
    }

    final state = _controller.state;
    if (state.isAuthenticated) {
      Navigator.pushReplacementNamed(
        context,
        '/welcome',
        arguments: state.user?.displayName ?? 'Knight',
      );
    } else {
      setState(() {});
    }
  }

  void _showForgotPassword() {
    setState(() {
      _isResetMode = true;
      _resetEmailController.text = _emailController.text.trim();
      _controller.clearFeedback();
    });
  }

  void _backToSignIn() {
    setState(() {
      _isResetMode = false;
      _controller.clearFeedback();
    });
  }

  Future<void> _submitSignIn() async {
    await _controller.signIn(
      email: _emailController.text,
      password: _passwordController.text,
    );
  }

  Future<void> _submitReset() async {
    await _controller.sendPasswordReset(
      email: _resetEmailController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = _isResetMode ? 'Reset your password' : 'Welcome back';
    final subtitle = _isResetMode
        ? 'Enter your UCF email and we will send you a reset code.'
        : 'Sign in to keep tracking campus picks, streaks, and game day wins.';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: AuthScaffold(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthBackButton(
                onPressed: _isResetMode
                    ? _backToSignIn
                    : () => Navigator.pop(context),
              ),
              const SizedBox(height: 28),
              AuthHeader(
                eyebrow: _isResetMode ? 'Account Recovery' : 'Sign In',
                title: title,
                subtitle: subtitle,
              ),
              const SizedBox(height: 28),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 280),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.04, 0.02),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: _isResetMode
                    ? _buildForgotPasswordCard()
                    : _buildSignInCard(),
              ),
              const SizedBox(height: 16),
              if (_controller.errorMessage != null &&
                  !_controller.resetSent &&
                  !_isResetMode)
                AuthMessage(text: _controller.errorMessage!, isError: true),
              if (!_isResetMode || !_controller.resetSent) const SizedBox(height: 18),
              if (_isResetMode) _buildResetActions() else _buildSignInActions(),
              const SizedBox(height: 18),
              AuthFooterLink(
                prompt: "Don't have an account?",
                action: 'Create one',
                onTap: () => Navigator.pushReplacementNamed(context, '/signup'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSignInCard() {
    return AuthCard(
      key: const ValueKey('sign-in-card'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle(
            title: 'Your account',
            caption: 'Use your UCF email and password to continue.',
          ),
          const SizedBox(height: 22),
          NpTextField(
            label: 'UCF Email',
            hint: 'knight@ucf.edu',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 18),
          NpTextField(
            label: 'Password',
            hint: 'Enter your password',
            controller: _passwordController,
            obscureText: true,
          ),
          const SizedBox(height: 14),
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: _showForgotPassword,
              child: Text(
                'Forgot password?',
                style: GoogleFonts.dmSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldLight,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForgotPasswordCard() {
    return AuthCard(
      key: const ValueKey('forgot-password-card'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: _controller.resetSent ? 'Check your inbox' : 'Reset access',
            caption: _controller.resetSent
                ? 'Your next step is waiting in email.'
                : 'We will email a secure code to help you get back in.',
          ),
          const SizedBox(height: 22),
          if (_controller.resetSent)
            AuthMessage(text: _controller.resetMessage ?? '')
          else ...[
            NpTextField(
              label: 'UCF Email',
              hint: 'knight@ucf.edu',
              controller: _resetEmailController,
              keyboardType: TextInputType.emailAddress,
            ),
            if (_controller.errorMessage != null) ...[
              const SizedBox(height: 14),
              AuthMessage(text: _controller.errorMessage!, isError: true),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildSignInActions() {
    return NpButton(
      label: 'Sign In',
      variant: NpButtonVariant.primary,
      loading: _controller.isLoading,
      onPressed: _controller.canSubmit(
        email: _emailController.text,
        password: _passwordController.text,
      )
          ? _submitSignIn
          : null,
    );
  }

  Widget _buildResetActions() {
    if (_controller.resetSent) {
      return NpButton(
        label: 'Back to Sign In',
        variant: NpButtonVariant.secondary,
        onPressed: _backToSignIn,
      );
    }

    return Column(
      children: [
        NpButton(
          label: 'Send Reset Code',
          variant: NpButtonVariant.primary,
          loading: _controller.isLoading,
          onPressed: _controller.canSendReset(_resetEmailController.text)
              ? _submitReset
              : null,
        ),
        const SizedBox(height: 12),
        NpButton(
          label: 'Back to Sign In',
          variant: NpButtonVariant.secondary,
          onPressed: _backToSignIn,
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String caption;

  const _SectionTitle({required this.title, required this.caption});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.dmSans(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            letterSpacing: -0.8,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          caption,
          style: GoogleFonts.dmSans(
            fontSize: 14,
            height: 1.5,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
