// This hook is no longer needed since we use a fixed API key
// Keeping for backward compatibility

export const useOpenAI = () => {
  return {
    apiKey: 'OPENAI_API_KEY',
    isConfigured: true,
    error: null,
    setApiKey: () => true,
    clearApiKey: () => {},
    makeRequest: async (url: string, options: RequestInit) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer OPENAI_API_KEY`,
        },
      });
    }
  };
};