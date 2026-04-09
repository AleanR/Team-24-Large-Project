class SecureStorageService {
  final Map<String, String> _memoryStore = <String, String>{};

  Future<void> write({
    required String key,
    required String value,
  }) async {
    _memoryStore[key] = value;
  }

  Future<String?> read(String key) async => _memoryStore[key];

  Future<void> delete(String key) async {
    _memoryStore.remove(key);
  }

  Future<void> clear() async {
    _memoryStore.clear();
  }
}
