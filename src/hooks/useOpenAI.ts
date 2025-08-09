// This hook is no longer needed since we use a fixed API key
// Keeping for backward compatibility

export const useOpenAI = () => {
  const apiKey = (globalThis as any)?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  return {
    apiKey,
    isConfigured: Boolean(apiKey),
    error: apiKey ? null : 'OPENAI_API_KEY not configured',
    setApiKey: () => true,
    clearApiKey: () => {},
    makeRequest: async (url: string, options: RequestInit) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${apiKey}`,
        },
      });
    },
  };
};