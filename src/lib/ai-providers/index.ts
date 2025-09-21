import GeminiProvider from './gemini.provider';
import OpenAIProvider from './openai.provider';
import StabilityProvider from './stability.provider';

export type ProviderModule = {
  name?: string;
  capabilities?: string[];
  generateImage?: (prompt: string) => Promise<{ url?: string } | undefined>;
  generateVideo?: (imageId: string, prompt?: string) => Promise<{ url?: string } | undefined>;
  generateAudio?: (prompt: string) => Promise<{ url?: string } | undefined>;
};

export const providersList: ProviderModule[] = [GeminiProvider, OpenAIProvider, StabilityProvider];
export const providerMap: Record<string, ProviderModule> = {
  gemini: GeminiProvider,
  openai: OpenAIProvider,
  stability: StabilityProvider,
};

export default providersList;
