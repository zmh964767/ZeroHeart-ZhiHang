import { AIProvider } from "./types";
import { ZhipuProvider } from "./providers/zhipu";
import { WenxinProvider } from "./providers/wenxin";
import { TongyiProvider } from "./providers/tongyi";
import { KimiProvider } from "./providers/kimi";
import { DeepseekProvider } from "./providers/deepseek";

export const AI_PROVIDERS = {
  zhipu: new ZhipuProvider(),
  wenxin: new WenxinProvider(),
  tongyi: new TongyiProvider(),
  kimi: new KimiProvider(),
  deepseek: new DeepseekProvider(),
};

export function getAIProvider(name: keyof typeof AI_PROVIDERS = "zhipu"): AIProvider {
  return AI_PROVIDERS[name];
}

export type { AIProvider } from "./types";
