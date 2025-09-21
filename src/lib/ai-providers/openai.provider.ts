import { AIProvider } from './provider-interface';

const OpenAIProvider: AIProvider = {
  name: 'openai',
  capabilities: ['text-to-image'],
  generateImage: async (prompt: string) => {
    return { url: `/placeholders/openai_image_${encodeURIComponent(prompt).slice(0,40)}.jpg` };
  }
};

export default OpenAIProvider;
