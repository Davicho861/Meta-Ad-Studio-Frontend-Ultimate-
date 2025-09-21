export type Capability = 'text-to-image' | 'image-to-video' | 'text-to-audio';

export interface AIProvider {
  name: string;
  capabilities: Capability[];
  // Optional methods depending on capabilities
  generateImage?: (prompt: string) => Promise<{ url: string }>;
  generateVideo?: (imageId: string, prompt?: string) => Promise<{ url: string }>;
  generateAudio?: (prompt: string) => Promise<{ url: string }>;
}

export default AIProvider;
