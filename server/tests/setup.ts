/**
 * Jest 全局初始化。
 * 使用独立的测试库（MONGO_URI_TEST），每个测试文件自行清理数据。
 */
process.env.NODE_ENV = "test";
process.env.MONGO_URI_TEST =
  process.env.MONGO_URI_TEST ?? "mongodb://127.0.0.1:27017/adfly_admin_test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.SWAGGER_ENABLED = process.env.SWAGGER_ENABLED ?? "true";

jest.setTimeout(30000);
