
import { Investor, PropertyMarketUpdate } from '../types';

export class InvestorEngine {
  /**
   * Calculates the current market value of an investor's portfolio.
   * Logic: Starts with the total invested amount (principal).
   * Applies all relevant cumulative market modifiers for that property.
   */
  static calculateValuation(investor: Investor, updates: PropertyMarketUpdate[]): number {
    const principal = investor.totalInvested || 0;
    if (principal === 0) return 0;

    const propertyUpdates = (updates || [])
      .filter(u => u.propertyId === investor.investedPropertyId)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });

    let multiplier = 1.0;
    for (const update of propertyUpdates) {
      if (update.valueModifier != null) {
        multiplier *= update.valueModifier;
      }
    }

    return principal * multiplier;
  }

  static calculateReturns(investor: Investor, currentValuation: number): {
    actualReturnAmount: number;
    actualReturnPercentage: number;
  } {
    const principal = investor.totalInvested || 0;
    const actualReturnAmount = currentValuation - principal;
    const actualReturnPercentage = principal > 0 ? (actualReturnAmount / principal) * 100 : 0;

    return {
      actualReturnAmount,
      actualReturnPercentage
    };
  }
}
