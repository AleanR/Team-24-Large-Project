import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../data/auth_repository.dart';
import '../../domain/auth_state.dart';
import '../../domain/ucf_majors.dart';
import '../controllers/auth_controller.dart';
import '../controllers/sign_up_controller.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/auth_shell.dart';
import '../../../../shared/widgets/np_button.dart';
import '../../../../shared/widgets/np_text_field.dart';
import '../../../../shared/widgets/step_indicator.dart';

class SignUpScreen extends StatefulWidget {
  final AuthRepository authRepository;
  final AuthController authController;

  const SignUpScreen({
    super.key,
    required this.authRepository,
    required this.authController,
  });

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen>
    with SingleTickerProviderStateMixin {
  late final SignUpController _controller;

  int _step = 0;
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _ucfId = TextEditingController();
  final _majorNotifier = ValueNotifier<String?>(null);
  bool _showEmailError = false;

  late AnimationController _cardCtrl;
  late Animation<double> _cardFade;
  late Animation<Offset> _cardSlide;

  static const _stepEyebrows = ['Profile', 'Security', 'Academics'];
  static const _stepTitles = [
    'Let’s build your account',
    'Lock in your login',
    'Finish your student profile',
  ];
  static const _stepSubtitles = [
    'Tell us who you are so we can personalize your NitroPicks experience.',
    'Choose a password you will use every time you come back.',
    'A few last details and you are ready to start making picks.',
  ];

  @override
  void initState() {
    super.initState();
    _controller = SignUpController(
      authRepository: widget.authRepository,
      authController: widget.authController,
    )..addListener(_handleControllerChanged);

    for (final listenable in [
      _firstName,
      _lastName,
      _email,
      _password,
      _confirmPassword,
      _ucfId,
      _majorNotifier,
    ]) {
      listenable.addListener(_refresh);
    }

    _cardCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _cardFade = CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut);
    _cardSlide = Tween<Offset>(
      begin: const Offset(0.04, 0.02),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOutCubic));
    _cardCtrl.forward();
  }

  @override
  void dispose() {
    _controller
      ..removeListener(_handleControllerChanged)
      ..dispose();
    _cardCtrl.dispose();
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _ucfId.dispose();
    _majorNotifier.dispose();
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

    if (_controller.state.status == AuthStatus.verificationPending) {
      Navigator.pushReplacementNamed(
        context,
        '/verify-email-pending',
        arguments: _controller.state.email ?? _email.text.trim(),
      );
    } else {
      setState(() {});
    }
  }

  SignUpFormData get _formData => SignUpFormData(
        firstName: _firstName.text,
        lastName: _lastName.text,
        email: _email.text,
        password: _password.text,
        confirmPassword: _confirmPassword.text,
        ucfId: _ucfId.text,
        major: _majorNotifier.value,
      );

  Future<void> _nextStep() async {
    if (_step == 0) {
      final emailError = _controller.validateEmailStep(_email.text);
      if (emailError != null) {
        setState(() => _showEmailError = true);
        return;
      }
      _showEmailError = false;
    }

    if (_step < 2) {
      await _cardCtrl.reverse();
      setState(() => _step++);
      _cardCtrl.forward();
      return;
    }

    await _controller.register(_formData);
  }

  void _prevStep() {
    if (_step > 0) {
      _cardCtrl.reverse().then((_) {
        setState(() => _step--);
        _cardCtrl.forward();
      });
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: AuthScaffold(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthBackButton(onPressed: _prevStep),
              const SizedBox(height: 28),
              AuthHeader(
                eyebrow: _stepEyebrows[_step],
                title: _stepTitles[_step],
                subtitle: _stepSubtitles[_step],
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _cardFade,
                child: SlideTransition(
                  position: _cardSlide,
                  child: _buildCard(),
                ),
              ),
              if (_controller.errorMessage != null) ...[
                const SizedBox(height: 16),
                AuthMessage(text: _controller.errorMessage!, isError: true),
              ],
              const SizedBox(height: 18),
              _StepButton(
                step: _step,
                isLoading: _controller.isLoading,
                form: _formData,
                controller: _controller,
                onPressed: _nextStep,
              ),
              const SizedBox(height: 18),
              AuthFooterLink(
                prompt: 'Already have an account?',
                action: 'Sign in',
                onTap: () =>
                    Navigator.pushReplacementNamed(context, '/signin'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard() {
    return AuthCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Step ${_step + 1} of 3',
                style: GoogleFonts.dmSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Text(
                _stepEyebrows[_step],
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldLight,
                  letterSpacing: 0.7,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          StepIndicator(currentStep: _step, totalSteps: 3),
          const SizedBox(height: 26),
          KeyedSubtree(
            key: ValueKey(_step),
            child: _buildStepContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return _Step1(
          firstName: _firstName,
          lastName: _lastName,
          email: _email,
          emailError: _showEmailError
              ? _controller.validateEmailStep(_email.text)
              : null,
        );
      case 1:
        return _Step2(
          password: _password,
          confirmPassword: _confirmPassword,
          passwordError: _controller.validatePasswordMatch(
            password: _password.text,
            confirmPassword: _confirmPassword.text,
          ),
        );
      case 2:
        return _Step3(
          ucfId: _ucfId,
          majorNotifier: _majorNotifier,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _Step1 extends StatelessWidget {
  final TextEditingController firstName;
  final TextEditingController lastName;
  final TextEditingController email;
  final String? emailError;

  const _Step1({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.emailError,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'First Name',
          hint: 'Reggie',
          controller: firstName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 18),
        NpTextField(
          label: 'Last Name',
          hint: 'Gaines',
          controller: lastName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 18),
        NpTextField(
          label: 'UCF Email',
          hint: 'knight@ucf.edu',
          controller: email,
          keyboardType: TextInputType.emailAddress,
          errorText: emailError,
        ),
      ],
    );
  }
}

class _Step2 extends StatelessWidget {
  final TextEditingController password;
  final TextEditingController confirmPassword;
  final String? passwordError;

  const _Step2({
    required this.password,
    required this.confirmPassword,
    required this.passwordError,
  });

  @override
  Widget build(BuildContext context) {
    final hasMatch = confirmPassword.text.isNotEmpty && passwordError == null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'Password',
          hint: 'At least 6 characters',
          controller: password,
          obscureText: true,
        ),
        const SizedBox(height: 18),
        NpTextField(
          label: 'Confirm Password',
          hint: 'Re-enter your password',
          controller: confirmPassword,
          obscureText: true,
          errorText: passwordError,
          successText: hasMatch ? 'Passwords match.' : null,
        ),
      ],
    );
  }
}

class _Step3 extends StatelessWidget {
  final TextEditingController ucfId;
  final ValueNotifier<String?> majorNotifier;

  const _Step3({
    required this.ucfId,
    required this.majorNotifier,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'UCF ID',
          hint: '1234567',
          controller: ucfId,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        ),
        const SizedBox(height: 18),
        ValueListenableBuilder<String?>(
          valueListenable: majorNotifier,
          builder: (_, major, __) => NpDropdownField(
            label: 'Major',
            value: major,
            items: ucfMajors,
            onChanged: (value) => majorNotifier.value = value,
          ),
        ),
      ],
    );
  }
}

class _StepButton extends StatelessWidget {
  final int step;
  final bool isLoading;
  final SignUpFormData form;
  final SignUpController controller;
  final VoidCallback onPressed;

  const _StepButton({
    required this.step,
    required this.isLoading,
    required this.form,
    required this.controller,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = controller.canContinue(step: step, form: form);

    return NpButton(
      label: step == 2 ? 'Create Account' : 'Continue',
      variant: NpButtonVariant.primary,
      loading: isLoading,
      onPressed: enabled ? onPressed : null,
    );
  }
}
