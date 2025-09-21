// AIPromptGenerator.ts
// Simple, deterministic prompt generator for the Director feature.
import { GeneratedImage } from './mockData';

export function generateVideoPrompt(image: GeneratedImage): string {
  // For now, return the fixed 'super prompt' provided in the spec.
  // In future this can be replaced by an actual image analysis routine.
  return `Cinematic luxury fashion film set in an ultra-modern international airport at golden hour. The shot opens with a wide, sweeping aerial establishing the terminal—architectural glass, soft flares, and long, elegant shadows. Transition to a dolly-in toward a model in a flowing, couture silk ensemble: the camera uses a stabilized gimbal, with a subtle 50mm depth-of-field to keep the model razor-sharp while softening the bustling background, capturing motion blur from passing travelers. Lighting: warm directional rim light from the late sun combined with cool blue LED practicals from signage to create high-contrast, cinematic color grading (teal vs orange). Wardrobe: high-fashion, bespoke tailoring with metallic accents; fabrics catch the light and exhibit delicate movement. Movement: slow, graceful push-ins, brief 180-degree orbit, and a contemplative 2-second hold on key expressions. Frame rate: 24 fps, resolution: 4K, aspect ratio: 2.39:1. Post-processing: film grain (subtle), analog film LUT for skin tones, and delicate chromatic aberration at highlights. Sound design: low-frequency ambient terminal hum, distant rolling trolleys, and a soft piano motif that swells at the final reveal. Emotion: aspirational, calm confidence, and refined exclusivity. Use color, motion, and light to sell an aura of luxury. Generate camera motion keyframes: [0s: slow zoom out from 1.05x to 1.0x], [1.5s: gentle push-in 1.0x to 1.12x], [3.0s: slight lateral track left -0.05x], easing with bézier curves. Provide suggested shot list, lighting notes, and a short director's voiceover script (15 words) to use as a guide.`;
}

export default generateVideoPrompt;
