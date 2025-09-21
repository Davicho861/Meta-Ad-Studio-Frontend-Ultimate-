import { AIProvider } from './provider-interface';

const RunwayProvider: AIProvider = {
  name: 'runway',
  capabilities: ['image-to-video', 'text-to-image'],
  generateImage: async (prompt: string) => {
    return { url: `/placeholders/runway_image_${encodeURIComponent(prompt).slice(0,40)}.jpg` };
  },
  generateVideo: async (imageId: string, prompt?: string) => {
    return { url: `/placeholders/runway_video_${imageId}_${Date.now()}.mp4` };
  }
};

export default RunwayProvider;
