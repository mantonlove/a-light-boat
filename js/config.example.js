/**
 * 轻舟 Qingzhou — API 配置模板
 * 复制为 config.js 并填入实际值
 */
const API_CONFIG = {
  endpoint: 'https://maas-api.ai-yuanjing.com/openapi/compatible-mode/v1/chat/completions',
  token: 'YOUR_API_KEY',
  model: 'glm-5',
  timeout: 30000,
  useFallback: true,  // 无 API 时设为 true，使用预设数据
  rateLimitPerMinute: 5,
  rateLimitDelay: 13000
};
