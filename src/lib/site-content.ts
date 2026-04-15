import {
  collections as defaultCollections,
  fabricComparison as defaultFabricComparison,
  fabricStories as defaultFabricStories,
  products as defaultProducts,
  valueProps as defaultValueProps,
  type Collection,
  type FabricStory,
  type Product,
} from "@/lib/catalog";

export type ComparisonRow = {
  fabric: string;
  softness: string;
  breathability: string;
  durability: string;
  season: string;
  feel: string;
};

export type SiteContent = {
  brandName: string;
  heroHeadline: string;
  heroSubtext: string;
  heroCta: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  valueProps: string[];
  collections: Collection[];
  fabricStories: FabricStory[];
  products: Product[];
  fabricComparison: ComparisonRow[];
  sensoryLine: string;
  philosophy: string;
  finalCta: string;
};

export const defaultSiteContent: SiteContent = {
  brandName: "Aurare",
  heroHeadline: "The Fabric of Quiet Luxury.",
  heroSubtext: "A curated sleep experience crafted from the world's finest natural fibers.",
  heroCta: "Explore Collections",
  heroImageUrl: "",
  heroVideoUrl: "",
  valueProps: defaultValueProps,
  collections: defaultCollections,
  fabricStories: defaultFabricStories,
  products: defaultProducts,
  fabricComparison: defaultFabricComparison,
  sensoryLine: "Cool as early morning air. Fluid as silk. Grounded in nature.",
  philosophy: "Luxury is not excess. It is intention, material, and stillness.",
  finalCta: "Begin Your Ritual",
};

export function mergeWithDefaultSiteContent(payload: Partial<SiteContent> | null | undefined) {
  if (!payload) {
    return defaultSiteContent;
  }

  return {
    ...defaultSiteContent,
    ...payload,
  } satisfies SiteContent;
}
