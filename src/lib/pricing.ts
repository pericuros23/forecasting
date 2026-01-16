export type UnitType = "FF" | "NC";

export type PricingConfig = {
  fullFunctionAnnual: number;
  narrowCoreAnnual: number;
};

// Default pricing (for backwards compatibility)
export const DEFAULT_PRICING: PricingConfig = {
  fullFunctionAnnual: 1092.41,
  narrowCoreAnnual: 392.41,
};

export function getDailyRate(type: UnitType, config: PricingConfig = DEFAULT_PRICING): number {
  const annual = type === "FF" ? config.fullFunctionAnnual : config.narrowCoreAnnual;
  return annual / 365;
}

export function getMonthlyRate(type: UnitType, config: PricingConfig = DEFAULT_PRICING): number {
  const annual = type === "FF" ? config.fullFunctionAnnual : config.narrowCoreAnnual;
  return annual / 12;
}

export function getAnnualRate(type: UnitType, config: PricingConfig = DEFAULT_PRICING): number {
  return type === "FF" ? config.fullFunctionAnnual : config.narrowCoreAnnual;
}

