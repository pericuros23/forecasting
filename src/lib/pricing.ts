export type UnitType = "FF" | "NC";

export const PRICING = {
  FF: {
    label: "Full Function",
    annual: 1092.41,
    monthly: 1092.41 / 12,
    daily: 1092.41 / 365,
  },
  NC: {
    label: "Narrow Core",
    annual: 392.41,
    monthly: 392.41 / 12,
    daily: 392.41 / 365,
  },
} as const;

export function getDailyRate(type: UnitType): number {
  return PRICING[type].daily;
}

export function getMonthlyRate(type: UnitType): number {
  return PRICING[type].monthly;
}

