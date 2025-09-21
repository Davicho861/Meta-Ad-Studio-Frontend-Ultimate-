import { AIProvider } from './provider-interface';

const GeminiProvider: AIProvider = {
  name: 'gemini',
  capabilities: ['text-to-image', 'text-to-audio'],
  generateImage: async (prompt: string) => {
    // simulate different output
    return { url: `/placeholders/gemini_image_${encodeURIComponent(prompt).slice(0,40)}.jpg` };
  },
  generateAudio: async (prompt: string) => {
    return { url: `/placeholders/gemini_audio_${Date.now()}.mp3` };
  }
};

export default GeminiProvider;
