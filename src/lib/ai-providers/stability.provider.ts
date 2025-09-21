import { AIProvider } from './provider-interface';

const StabilityProvider: AIProvider = {
  name: 'stability',
  capabilities: ['text-to-image', 'image-to-video'],
  generateImage: async (prompt: string) => {
    return { url: `/placeholders/stability_image_${encodeURIComponent(prompt).slice(0,40)}.jpg` };
  },
  generateVideo: async (imageId: string, prompt?: string) => {
    return { url: `/placeholders/stability_video_${imageId}_${Date.now()}.mp4` };
  }
};

export default StabilityProvider;
