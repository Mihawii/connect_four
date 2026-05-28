export interface ProPlan {
  id: "monthly" | "yearly" | "lifetime";
  name: string;
  price: string;
  priceCents: number;
  cadence: string;
  envPriceKey: string;
  highlight?: boolean;
  perks: string[];
}

export const PRO_PLANS: ProPlan[] = [
  {
    id: "monthly",
    name: "Pro Monthly",
    price: "$3.99",
    priceCents: 399,
    cadence: "/month",
    envPriceKey: "STRIPE_PRICE_PRO_MONTHLY",
    perks: ["Unlimited ranked", "Unlimited AI coach", "Full puzzle archive", "Advanced stats", "20% off skins"],
  },
  {
    id: "yearly",
    name: "Pro Yearly",
    price: "$34",
    priceCents: 3400,
    cadence: "/year",
    envPriceKey: "STRIPE_PRICE_PRO_YEARLY",
    highlight: true,
    perks: ["Everything in Monthly", "~29% cheaper", "1 free Battle Pass / year", "Pro badge"],
  },
  {
    id: "lifetime",
    name: "Pro Lifetime",
    price: "$69",
    priceCents: 6900,
    cadence: "once",
    envPriceKey: "STRIPE_PRICE_PRO_LIFETIME",
    perks: ["Pay once, Pro forever", "Founder badge", "First 1,000 users only"],
  },
];

export type SkinKind = "board" | "disc" | "burnfx" | "sfx" | "bundle";

export interface Skin {
  sku: string;
  kind: SkinKind;
  name: string;
  description: string;
  priceCents: number;
  color: string;
}

export const SKINS: Skin[] = [
  { sku: "board_marble", kind: "board", name: "Marble", description: "Cold stone for a hot game.", priceCents: 499, color: "#d8d3c9" },
  { sku: "board_obsidian", kind: "board", name: "Volcanic Obsidian", description: "Forged in the caldera.", priceCents: 499, color: "#1c1a17" },
  { sku: "board_galaxy", kind: "board", name: "Galaxy Resin", description: "Drop discs into the void.", priceCents: 499, color: "#3a2d6b" },
  { sku: "board_steel", kind: "board", name: "Cyberpunk Steel", description: "Neon-lit brushed metal.", priceCents: 499, color: "#3a5566" },
  { sku: "disc_gem", kind: "disc", name: "Gem", description: "Faceted, refractive discs.", priceCents: 199, color: "#2f8f7a" },
  { sku: "disc_holo", kind: "disc", name: "Holo", description: "Iridescent holo foil.", priceCents: 199, color: "#b86fd0" },
  { sku: "disc_glyph", kind: "disc", name: "Glyph", description: "Ancient runes that glow when hot.", priceCents: 199, color: "#c8721f" },
  { sku: "fx_lightning", kind: "burnfx", name: "Lightning Burn", description: "Discs vanish in a thunderclap.", priceCents: 299, color: "#3b6fd6" },
  { sku: "fx_frost", kind: "burnfx", name: "Frost Dissolve", description: "They shatter instead of burning.", priceCents: 299, color: "#7fc4e0" },
  { sku: "fx_blossom", kind: "burnfx", name: "Cherry Blossom", description: "Petals scatter on burn.", priceCents: 299, color: "#e07a9c" },
  { sku: "sfx_thunder", kind: "sfx", name: "Thunder SFX", description: "Every drop lands like a storm.", priceCents: 99, color: "#54606e" },
  { sku: "bundle_volcano", kind: "bundle", name: "Volcano Bundle", description: "Obsidian board + Glyph discs + Lightning burn.", priceCents: 799, color: "#c2371a" },
];

export function skinPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
