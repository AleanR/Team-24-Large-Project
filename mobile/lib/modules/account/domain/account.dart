import '../../auth/domain/user.dart';

class Account {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String username;
  final String? major;
  final String? ucfId;
  final int knightPoints;
  final bool isVerified;
  final bool isAdmin;

  const Account({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.username,
    this.major,
    this.ucfId,
    required this.knightPoints,
    this.isVerified = false,
    this.isAdmin = false,
  });

  factory Account.fromJson(Map<String, dynamic> json) {
    final points = json['knightPoints'] ?? json['pointBalance'];
    return Account(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      firstName: (json['firstname'] ?? json['firstName'] ?? '').toString(),
      lastName: (json['lastname'] ?? json['lastName'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      major: json['major']?.toString(),
      ucfId: json['ucfID']?.toString(),
      knightPoints:
          points is num ? points.toInt() : int.tryParse('${points ?? ''}') ?? 0,
      isVerified: json['isVerified'] == true,
      isAdmin: json['isAdmin'] == true,
    );
  }

  factory Account.fromUser(User user) {
    return Account(
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      major: user.major,
      ucfId: user.ucfId,
      knightPoints: user.knightPoints,
      isVerified: user.isVerified,
    );
  }

  String get displayName {
    final fullName = '$firstName $lastName'.trim();
    if (fullName.isNotEmpty) return fullName;
    if (username.trim().isNotEmpty) return username.trim();
    return email.split('@').first;
  }

  String get initials {
    final first = firstName.trim().isNotEmpty
        ? firstName.trim()[0]
        : displayName.trim().isNotEmpty
            ? displayName.trim()[0]
            : 'K';
    final last = lastName.trim().isNotEmpty ? lastName.trim()[0] : '';
    return '$first$last'.toUpperCase();
  }

  Account copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? username,
    String? major,
    String? ucfId,
    int? knightPoints,
    bool? isVerified,
    bool? isAdmin,
  }) {
    return Account(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      username: username ?? this.username,
      major: major ?? this.major,
      ucfId: ucfId ?? this.ucfId,
      knightPoints: knightPoints ?? this.knightPoints,
      isVerified: isVerified ?? this.isVerified,
      isAdmin: isAdmin ?? this.isAdmin,
    );
  }
}
