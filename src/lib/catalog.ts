export type Collection = {
  slug: string;
  name: string;
  fabric: string;
  description: string;
  mood: string;
  imageUrl: string;
};

export type FabricStory = {
  name: string;
  sensory: string;
  emotional: string;
  sustainability: string;
};

export type Product = {
  slug: string;
  name: string;
  collectionSlug: string;
  fabric: string;
  imageUrl: string;
  galleryImages: string[];
  colorVariants: string[];
  sizes: Array<"King" | "Queen">;
  startingPrice: number;
  description: string;
  feelOnSkin: string;
  idealSeason: string;
};

export const valueProps = [
  "Conscious Materials",
  "Elevated Comfort",
  "Timeless Craftsmanship",
  "Designed for Stillness",
];

export const collections: Collection[] = [
  {
    slug: "vaya",
    name: "Aurare Vaya",
    fabric: "Bamboo",
    description: "A cool, fluid drape for warm evenings and luminous mornings.",
    mood: "Airy and serene",
    imageUrl: "",
  },
  {
    slug: "lume",
    name: "Aurare Lume",
    fabric: "TENCEL™",
    description: "Silken smoothness with balanced breathability for year-round calm.",
    mood: "Polished and weightless",
    imageUrl: "",
  },
  {
    slug: "serein",
    name: "Aurare Serein",
    fabric: "Linen",
    description: "Textural elegance that softens beautifully with every ritual wash.",
    mood: "Relaxed and grounded",
    imageUrl: "",
  },
  {
    slug: "prava",
    name: "Aurare Prava",
    fabric: "Flax",
    description: "Heritage texture refined into a crisp, breathable sleep landscape.",
    mood: "Structured and natural",
    imageUrl: "",
  },
  {
    slug: "terra",
    name: "Aurare Terra",
    fabric: "Hemp",
    description: "Durable softness with an earthy hand-feel and effortless drape.",
    mood: "Quiet and resilient",
    imageUrl: "",
  },
  {
    slug: "aira",
    name: "Aurare Aira",
    fabric: "Premium Cotton",
    description: "Classic luxury reimagined with cloudlike softness and precision weave.",
    mood: "Crisp and familiar",
    imageUrl: "",
  },
  {
    slug: "noor",
    name: "Aurare Noor",
    fabric: "Silk",
    description: "Luminous touch and graceful glide for the most indulgent nights.",
    mood: "Radiant and refined",
    imageUrl: "",
  },
];

export const fabricStories: FabricStory[] = [
  {
    name: "Bamboo",
    sensory: "Cool, fluid, softly weightless.",
    emotional: "Creates a sense of lightness and morning clarity.",
    sustainability: "Fast-regenerating fiber with mindful water use.",
  },
  {
    name: "TENCEL™",
    sensory: "Silky-smooth, breathable, and graceful in motion.",
    emotional: "Feels composed and quietly restorative.",
    sustainability: "Responsibly sourced wood pulp with closed-loop processing.",
  },
  {
    name: "Linen",
    sensory: "Textured, airy, and naturally ventilated.",
    emotional: "Brings an effortless, lived-in calm.",
    sustainability: "Low-input flax cultivation and enduring lifecycle.",
  },
  {
    name: "Flax",
    sensory: "Crisp hand-feel with balanced softness.",
    emotional: "Feels orderly, grounded, and intentional.",
    sustainability: "Plant-based durability with minimal waste potential.",
  },
  {
    name: "Hemp",
    sensory: "Structured softness with organic texture.",
    emotional: "Invites a rooted, nature-led stillness.",
    sustainability: "Naturally hardy crop requiring fewer agricultural inputs.",
  },
  {
    name: "Premium Cotton",
    sensory: "Cloud-soft, breathable, and familiar.",
    emotional: "Feels comforting and quietly luxurious.",
    sustainability: "Long-staple quality supports longevity and reduced replacement.",
  },
  {
    name: "Silk",
    sensory: "Cool touch, smooth glide, luminous drape.",
    emotional: "Creates an intimate feeling of indulgent calm.",
    sustainability: "Craft-driven small-batch finishing and long wear potential.",
  },
];

export const products: Product[] = [
  {
    slug: "aurare-vaya-bedsheet",
    name: "Aurare Vaya Bedsheet Set",
    collectionSlug: "vaya",
    fabric: "Bamboo",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Pearl Sand", "Dune Mist", "Oat Calm", "Soft Clay"],
    sizes: ["King", "Queen"],
    startingPrice: 10000,
    description: "Breathable bamboo bedding with fluid drape and tranquil finish.",
    feelOnSkin: "Cool as early morning air, smooth as still water.",
    idealSeason: "Summer / Monsoon",
  },
  {
    slug: "aurare-lume-bedsheet",
    name: "Aurare Lume Bedsheet Set",
    collectionSlug: "lume",
    fabric: "TENCEL™",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Moon Ivory", "Raw Almond", "Quiet Taupe", "Warm Fog"],
    sizes: ["King", "Queen"],
    startingPrice: 11200,
    description: "TENCEL™ weave designed for all-night breathability and refined touch.",
    feelOnSkin: "Fluid as silk, calm against every movement.",
    idealSeason: "All Season",
  },
  {
    slug: "aurare-serein-bedsheet",
    name: "Aurare Serein Bedsheet Set",
    collectionSlug: "serein",
    fabric: "Linen",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Stone Milk", "Natural Flax", "Candle Beige", "Pale Bark"],
    sizes: ["King", "Queen"],
    startingPrice: 12400,
    description: "European linen with soft texture and timeless editorial finish.",
    feelOnSkin: "Textured yet tender, like sun-dried calm.",
    idealSeason: "Summer / Autumn",
  },
  {
    slug: "aurare-prava-bedsheet",
    name: "Aurare Prava Bedsheet Set",
    collectionSlug: "prava",
    fabric: "Flax",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Dust Beige", "Sandstone", "Dry Ivory", "Ash Linen"],
    sizes: ["King", "Queen"],
    startingPrice: 11800,
    description: "Balanced flax texture with resilient breathability and elegant drape.",
    feelOnSkin: "Grounded, dry, and quietly luxurious.",
    idealSeason: "All Season",
  },
  {
    slug: "aurare-terra-bedsheet",
    name: "Aurare Terra Bedsheet Set",
    collectionSlug: "terra",
    fabric: "Hemp",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Earthen Ivory", "Pale Umber", "Cedar Dust", "Clay Whisper"],
    sizes: ["King", "Queen"],
    startingPrice: 13000,
    description: "Hemp blend crafted for breathable strength and natural tactile depth.",
    feelOnSkin: "Softly structured with a grounded, organic touch.",
    idealSeason: "Autumn / Winter",
  },
  {
    slug: "aurare-aira-bedsheet",
    name: "Aurare Aira Bedsheet Set",
    collectionSlug: "aira",
    fabric: "Premium Cotton",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Milk White", "Warm Vanilla", "Calm Sand", "Alabaster"],
    sizes: ["King", "Queen"],
    startingPrice: 10500,
    description: "Premium cotton sateen with crisp softness and enduring comfort.",
    feelOnSkin: "Cloudlike and familiar, with refined smoothness.",
    idealSeason: "All Season",
  },
  {
    slug: "aurare-noor-bedsheet",
    name: "Aurare Noor Bedsheet Set",
    collectionSlug: "noor",
    fabric: "Silk",
    imageUrl: "",
    galleryImages: [],
    colorVariants: ["Champagne", "Soft Pearl", "Warm Ivory", "Dust Rose"],
    sizes: ["King", "Queen"],
    startingPrice: 16800,
    description: "Mulberry silk blend with luminous sheen and elevated night comfort.",
    feelOnSkin: "Luminous glide, cool touch, and effortless softness.",
    idealSeason: "All Season",
  },
];

export const fabricComparison = [
  {
    fabric: "Bamboo",
    softness: "Very High",
    breathability: "Very High",
    durability: "Medium",
    season: "Warm weather",
    feel: "Cool, fluid, and airy",
  },
  {
    fabric: "TENCEL™",
    softness: "Very High",
    breathability: "High",
    durability: "High",
    season: "All season",
    feel: "Silken and balanced",
  },
  {
    fabric: "Linen",
    softness: "Medium-High",
    breathability: "Very High",
    durability: "High",
    season: "Warm and transitional",
    feel: "Textured and light",
  },
  {
    fabric: "Flax",
    softness: "Medium",
    breathability: "High",
    durability: "Very High",
    season: "All season",
    feel: "Crisp and grounded",
  },
  {
    fabric: "Hemp",
    softness: "Medium",
    breathability: "High",
    durability: "Very High",
    season: "Cool and transitional",
    feel: "Structured with depth",
  },
  {
    fabric: "Premium Cotton",
    softness: "High",
    breathability: "High",
    durability: "High",
    season: "All season",
    feel: "Smooth and comforting",
  },
  {
    fabric: "Silk",
    softness: "Very High",
    breathability: "Medium-High",
    durability: "Medium",
    season: "All season",
    feel: "Luminous and fluid",
  },
];

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const findProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);
