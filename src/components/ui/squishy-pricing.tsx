"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";

export interface SquishyPricingPlan {
  id: string;
  label: string;
  monthlyPrice: string;
  cadence?: string;
  description: string;
  cta: string;
}

interface ComponentProps {
  plans?: SquishyPricingPlan[];
  pendingId?: string | null;
  onSelectPlan?: (plan: SquishyPricingPlan) => void;
}

interface PricingCardProps extends SquishyPricingPlan {
  background: string;
  foreground: string;
  chip: string;
  button: string;
  BGComponent: ComponentType;
  disabled?: boolean;
  onSelect?: () => void;
}

const DEFAULT_PLANS: SquishyPricingPlan[] = [
  {
    id: "individual",
    label: "Individual",
    monthlyPrice: "299",
    description: "For individuals who want to understand why their landing pages aren't working",
    cta: "Sign up",
  },
  {
    id: "company",
    label: "Company",
    monthlyPrice: "999",
    description: "For mid-sized companies who are serious about boosting their revenue by 30%",
    cta: "Sign up",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    monthlyPrice: "4,999",
    description: "For large enterprises looking to outsource their conversion rate optimization",
    cta: "Book a call",
  },
];

const CARD_STYLES = [
  {
    background: "bg-[var(--ember)]",
    foreground: "text-[oklch(0.99_0.014_85)]",
    chip: "border-[var(--paper)]/30 bg-[var(--paper)]/20 text-[var(--paper)]",
    button: "border-ink bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--gold)]",
    BGComponent: BGComponent1,
  },
  {
    background: "bg-[var(--gold)]",
    foreground: "text-[var(--ink)]",
    chip: "border-ink/20 bg-[var(--paper)]/40 text-[var(--ink)]",
    button: "border-ink bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ember)] hover:text-[var(--paper)]",
    BGComponent: BGComponent2,
  },
  {
    background: "bg-[var(--board-bg-muted)]",
    foreground: "text-[var(--paper)]",
    chip: "border-[var(--paper)]/20 bg-[var(--paper)]/12 text-[var(--paper)]",
    button: "border-ink bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ember)] hover:text-[var(--paper)]",
    BGComponent: BGComponent3,
  },
];

export const Component = ({ plans = DEFAULT_PLANS, pendingId, onSelectPlan }: ComponentProps) => {
  return (
    <section className="bg-background px-4 py-12 transition-colors">
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-4">
        {plans.map((plan, index) => {
          const style = CARD_STYLES[index % CARD_STYLES.length];

          return (
            <PricingCard
              key={plan.id}
              {...plan}
              background={style.background}
              foreground={style.foreground}
              chip={style.chip}
              button={style.button}
              BGComponent={style.BGComponent}
              disabled={pendingId === plan.id}
              onSelect={() => onSelectPlan?.(plan)}
            />
          );
        })}
      </div>
    </section>
  );
};

const PricingCard = ({
  label,
  monthlyPrice,
  cadence,
  description,
  cta,
  background,
  foreground,
  chip,
  button,
  BGComponent,
  disabled,
  onSelect,
}: PricingCardProps) => {
  return (
    <motion.div
      whileHover="hover"
      transition={{ duration: 1, ease: "backInOut" }}
      variants={{ hover: { scale: 1.05 } }}
      className={`relative h-96 w-80 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-ink p-8 ${background} ${foreground} shadow-hard transition-transform`}
    >
      <div className="relative z-10">
        <span className={`mb-3 block w-fit rounded-full border px-3 py-0.5 font-display text-sm font-semibold backdrop-blur-sm ${chip}`}>
          {label}
        </span>
        <motion.span
          initial={{ scale: 0.85 }}
          variants={{ hover: { scale: 1 } }}
          transition={{ duration: 1, ease: "backInOut" }}
          className="my-2 block origin-top-left font-display text-6xl font-semibold leading-[1.2]"
        >
          ${monthlyPrice}/<br />
          {cadence ?? "Month"}
        </motion.span>
        <p className="text-lg opacity-90">{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`absolute bottom-4 left-4 right-4 z-20 rounded-md border-[1.5px] py-2 text-center font-display font-semibold uppercase backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${button}`}
      >
        {disabled ? "Loading..." : cta}
      </button>
      <BGComponent />
    </motion.div>
  );
};

function BGComponent1() {
  return (
    <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.5 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.circle
      variants={{ hover: { scaleY: 0.5, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="114.5"
      r="101.5"
      fill="rgba(0, 0, 0, 0.2)"
    />
    <motion.ellipse
      variants={{ hover: { scaleY: 2.25, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="265.5"
      rx="101.5"
      ry="43.5"
      fill="rgba(0, 0, 0, 0.2)"
    />
    </motion.svg>
  );
}

function BGComponent2() {
  return (
    <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.05 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.rect
      x="14"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      variants={{ hover: { y: 219, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 12 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
    <motion.rect
      x="155"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      variants={{ hover: { y: 12, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 219 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
    </motion.svg>
  );
}

function BGComponent3() {
  return (
    <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.25 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.3, duration: 1, ease: "backInOut" }}
      d="M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z"
      fill="rgba(0, 0, 0, 0.2)"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
      d="M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z"
      fill="rgba(0, 0, 0, 0.2)"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.1, duration: 1, ease: "backInOut" }}
      d="M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z"
      fill="rgba(0, 0, 0, 0.2)"
    />
    </motion.svg>
  );
}
