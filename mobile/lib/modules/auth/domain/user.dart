class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String username;
  final String? major;
  final String? ucfId;
  final int? pointBalance;
  final bool isVerified;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.username,
    this.major,
    this.ucfId,
    this.pointBalance,
    this.isVerified = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      firstName: (json['firstname'] ?? '').toString(),
      lastName: (json['lastname'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      major: json['major']?.toString(),
      ucfId: json['ucfID']?.toString(),
      pointBalance: json['pointBalance'] is int
          ? json['pointBalance'] as int
          : int.tryParse('${json['pointBalance'] ?? ''}'),
      isVerified: json['isVerified'] == true,
    );
  }

  String get displayName {
    if (firstName.trim().isNotEmpty) {
      return firstName.trim();
    }
    if (username.trim().isNotEmpty) {
      return username.trim();
    }
    return email.split('@').first;
  }
}
