import { daysBetweenExclusive, eachMonthBetween, endOfMonth, formatMonthKey } from "./dateUtils";
import { getDailyRate, type UnitType } from "./pricing";

export type MonthlyBreakdown = {
  month: string; // YYYY-MM
  fullFunction: number;
  narrowCore: number;
  total: number;
};

export function calculateInstallForecast(
  installDate: Date,
  quantity: number,
  unitType: UnitType,
  forecastEnd: Date
): MonthlyBreakdown[] {
  if (forecastEnd <= installDate || quantity <= 0) {
    return [];
  }

  const months = eachMonthBetween(installDate, forecastEnd);
  const dailyRate = getDailyRate(unitType);

  return months
    .map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const activeStart = maxDate(monthStart, installDate);
      const activeEnd = minDate(monthEnd, forecastEnd);

      if (activeEnd <= activeStart) {
        return null;
      }

      const activeDays = daysBetweenExclusive(activeStart, activeEnd); // install day excluded per example
      if (activeDays <= 0) {
        return null;
      }
      const revenue = activeDays * quantity * dailyRate;
      const monthKey = formatMonthKey(monthStart);

      const ff = unitType === "FF" ? revenue : 0;
      const nc = unitType === "NC" ? revenue : 0;

      return {
        month: monthKey,
        fullFunction: ff,
        narrowCore: nc,
        total: revenue,
      };
    })
    .filter((entry): entry is MonthlyBreakdown => Boolean(entry));
}

export function mergeMonthlyBreakdowns(allInstalls: MonthlyBreakdown[]): MonthlyBreakdown[] {
  const merged = new Map<string, MonthlyBreakdown>();

  for (const entry of allInstalls) {
    const existing = merged.get(entry.month);
    if (!existing) {
      merged.set(entry.month, { ...entry });
      continue;
    }

    merged.set(entry.month, {
      month: entry.month,
      fullFunction: existing.fullFunction + entry.fullFunction,
      narrowCore: existing.narrowCore + entry.narrowCore,
      total: existing.total + entry.total,
    });
  }

  return Array.from(merged.values()).sort((a, b) => (a.month < b.month ? -1 : 1));
}

function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b;
}

function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

