export interface ProPlan {
  id: "monthly" | "yearly" | "lifetime";
  name: string;
  price: string;
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
    cadence: "/month",
    envPriceKey: "STRIPE_PRICE_PRO_MONTHLY",
    perks: ["Unlimited ranked", "Unlimited AI coach", "Full puzzle archive", "Advanced stats", "20% off skins"],
  },
  {
    id: "yearly",
    name: "Pro Yearly",
    price: "$34",
    cadence: "/year",
    envPriceKey: "STRIPE_PRICE_PRO_YEARLY",
    highlight: true,
    perks: ["Everything in Monthly", "~29% cheaper", "1 free Battle Pass / year", "Pro badge"],
  },
  {
    id: "lifetime",
    name: "Pro Lifetime",
    price: "$69",
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
  gradient: string;
}

export const SKINS: Skin[] = [
  { sku: "board_marble", kind: "board", name: "Marble", description: "Cold stone for a hot game.", priceCents: 499, gradient: "from-zinc-200 to-zinc-400" },
  { sku: "board_obsidian", kind: "board", name: "Volcanic Obsidian", description: "Forged in the caldera.", priceCents: 499, gradient: "from-zinc-800 to-black" },
  { sku: "board_galaxy", kind: "board", name: "Galaxy Resin", description: "Drop discs into the void.", priceCents: 499, gradient: "from-indigo-600 to-fuchsia-700" },
  { sku: "board_steel", kind: "board", name: "Cyberpunk Steel", description: "Neon-lit brushed metal.", priceCents: 499, gradient: "from-cyan-500 to-slate-700" },
  { sku: "disc_gem", kind: "disc", name: "Gem", description: "Faceted, refractive discs.", priceCents: 199, gradient: "from-emerald-400 to-teal-600" },
  { sku: "disc_holo", kind: "disc", name: "Holo", description: "Iridescent holo foil.", priceCents: 199, gradient: "from-pink-400 to-violet-500" },
  { sku: "disc_glyph", kind: "disc", name: "Glyph", description: "Ancient runes that glow when hot.", priceCents: 199, gradient: "from-amber-400 to-orange-600" },
  { sku: "fx_lightning", kind: "burnfx", name: "Lightning Burn", description: "Discs vanish in a thunderclap.", priceCents: 299, gradient: "from-sky-300 to-blue-600" },
  { sku: "fx_frost", kind: "burnfx", name: "Frost Dissolve", description: "They don't burn — they shatter.", priceCents: 299, gradient: "from-cyan-200 to-sky-500" },
  { sku: "fx_blossom", kind: "burnfx", name: "Cherry Blossom", description: "Petals scatter on burn.", priceCents: 299, gradient: "from-pink-300 to-rose-500" },
  { sku: "sfx_thunder", kind: "sfx", name: "Thunder SFX", description: "Every drop lands like a storm.", priceCents: 99, gradient: "from-slate-400 to-slate-700" },
  { sku: "bundle_volcano", kind: "bundle", name: "Volcano Bundle", description: "Obsidian board + Glyph discs + Lightning burn.", priceCents: 799, gradient: "from-orange-500 to-red-700" },
];

export function skinPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
