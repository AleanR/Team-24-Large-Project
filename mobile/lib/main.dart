// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:app_links/app_links.dart';

import 'core/routing/app_router.dart';
import 'core/storage/secure_storage_service.dart';
import 'modules/auth/data/auth_api_service.dart';
import 'modules/auth/data/auth_repository.dart';
import 'modules/auth/presentation/controllers/auth_controller.dart';
import 'shared/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );
  runApp(const NitroPicksApp());
}

class NitroPicksApp extends StatefulWidget {
  const NitroPicksApp({super.key});

  @override
  State<NitroPicksApp> createState() => _NitroPicksAppState();
}

class _NitroPicksAppState extends State<NitroPicksApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();
  late final AppLinks _appLinks;
  late final AuthRepository _authRepository;
  late final AuthController _authController;
  late final AppRouter _appRouter;

  @override
  void initState() {
    super.initState();
    _authRepository = AuthRepository(
      apiService: AuthApiService(),
      storageService: SecureStorageService(),
    );
    _authController = AuthController();
    _appRouter = AppRouter(
      authRepository: _authRepository,
      authController: _authController,
    );
    _appLinks = AppLinks();
    _appLinks.uriLinkStream.listen((uri) {
      if (uri.scheme == 'nitropicks' && uri.host == 'verify-email') {
        _navigatorKey.currentState?.pushNamedAndRemoveUntil(
          '/email-verified',
          (route) => false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NitroPicks',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      navigatorKey: _navigatorKey,
      onGenerateRoute: _appRouter.generateRoute,
      initialRoute: '/',
    );
  }
}
