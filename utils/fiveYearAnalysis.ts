// 5-Year Analysis Calculation Utilities

export interface FiveYearAssumptions {
  homePriceAppreciation: number // Annual percentage (e.g., 3.0)
  annualRentGrowth: number // Annual percentage (e.g., 2.0)
  annualInflationRate: number // Annual percentage (e.g., 2.5)
}

export interface FiveYearProjection {
  year: number
  homeValue: number
  mortgageBalance: number
  homeEquity: number
  homeEquityPercentage: number
  monthlyRent: number
  monthlyExpenses: number
  monthlyMortgagePayment: number
  monthlyCashFlow: number
  annualCashFlow: number
  cumulativeCashFlow: number
}

export interface PropertyAnalysis {
  propertyId: string
  propertyName: string
  hasSufficientData: boolean
  missingDataFields: string[]
  projections: FiveYearProjection[]
  totalEquityGrowth: number
  totalCumulativeCashFlow: number
  cashOnCashReturn: number
  irr: number
}

export interface PortfolioAnalysis {
  assumptions: FiveYearAssumptions
  properties: (PropertyAnalysis | null)[]
  totalPortfolioValue: number
  totalEquityGrowth: number
  totalCumulativeCashFlow: number
  bestPerformingProperty: PropertyAnalysis | null
}

// Calculate monthly mortgage payment
export function calculateMonthlyMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = years * 12
  
  if (monthlyRate === 0) {
    return principal / totalPayments
  }
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                  (Math.pow(1 + monthlyRate, totalPayments) - 1)
  
  return Math.round(payment * 100) / 100
}

// Calculate remaining mortgage balance after N years
export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  years: number,
  yearsElapsed: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = years * 12
  const paymentsMade = yearsElapsed * 12
  
  if (monthlyRate === 0) {
    return principal * (1 - paymentsMade / totalPayments)
  }
  
  const balance = principal * (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
                  (Math.pow(1 + monthlyRate, totalPayments) - 1)
  
  return Math.max(0, Math.round(balance * 100) / 100)
}

// Calculate IRR using Newton-Raphson method
function calculateIRR(cashFlows: number[], initialInvestment: number, maxIterations: number = 100, tolerance: number = 0.0001): number {
  let guess = 0.1 // Start with 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment
    let npvDerivative = 0
    
    for (let year = 1; year <= cashFlows.length; year++) {
      const discountFactor = Math.pow(1 + guess, year)
      npv += cashFlows[year - 1] / discountFactor
      npvDerivative -= year * cashFlows[year - 1] / (discountFactor * (1 + guess))
    }
    
    if (Math.abs(npv) < tolerance) {
      return guess
    }
    
    const newGuess = guess - npv / npvDerivative
    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess
    }
    
    guess = newGuess
  }
  
  return guess
}

// Generate 5-year projections for a single property
export function generatePropertyProjections(
  property: any, // Using any for now to avoid type conflicts
  globalAssumptions: FiveYearAssumptions
): PropertyAnalysis {
  // Use property-specific assumptions if available, otherwise use global
  const effectiveAssumptions: FiveYearAssumptions = {
    homePriceAppreciation: property.customAssumptions?.homePriceAppreciation ?? globalAssumptions.homePriceAppreciation,
    annualRentGrowth: property.customAssumptions?.annualRentGrowth ?? globalAssumptions.annualRentGrowth,
    annualInflationRate: property.customAssumptions?.annualInflationRate ?? globalAssumptions.annualInflationRate
  }
  const missingFields: string[] = []
  
  // Check for required data
  if (!property.marketValue || property.marketValue <= 0) {
    missingFields.push('Market Value')
  }
  if (!property.downPayment || property.downPayment <= 0) {
    missingFields.push('Down Payment')
  }
  if (!property.interestRate || property.interestRate <= 0) {
    missingFields.push('Interest Rate')
  }
  if (!property.loanTerm || property.loanTerm <= 0) {
    missingFields.push('Loan Term')
  }
  if (!property.grossRentalIncome || property.grossRentalIncome <= 0) {
    missingFields.push('Rental Income')
  }
  
  const hasSufficientData = missingFields.length === 0
  
  if (!hasSufficientData) {
    return {
      propertyId: property.id,
      propertyName: property.name || property.streetAddress,
      hasSufficientData: false,
      missingDataFields: missingFields,
      projections: [],
      totalEquityGrowth: 0,
      totalCumulativeCashFlow: 0,
      cashOnCashReturn: 0,
      irr: 0
    }
  }
  
  // For existing properties, use outstanding mortgage balance; for new purchases, calculate from down payment
  const currentMortgageBalance = property.outstandingMortgageBalance || (property.purchasePrice - property.downPayment)
  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    currentMortgageBalance,
    property.interestRate,
    property.loanTerm
  )
  
  const projections: FiveYearProjection[] = []
  let cumulativeCashFlow = 0
  
  // Use market value as starting point, fall back to purchase price if not set
  const startingValue = property.marketValue || property.purchasePrice
  
  for (let year = 0; year <= 5; year++) {
    // Home value growth
    const homeValue = startingValue * Math.pow(1 + effectiveAssumptions.homePriceAppreciation / 100, year)
    
    // Mortgage balance
    const mortgageBalance = calculateRemainingBalance(
      currentMortgageBalance,
      property.interestRate,
      property.loanTerm,
      year
    )
    
    // Home equity
    const homeEquity = homeValue - mortgageBalance
    const homeEquityPercentage = (homeEquity / homeValue) * 100
    
    // Rent growth
    const monthlyRent = property.grossRentalIncome * Math.pow(1 + effectiveAssumptions.annualRentGrowth / 100, year)
    
    // Expenses with inflation
    const monthlyExpenses = calculateMonthlyExpenses(property, effectiveAssumptions.annualInflationRate, year)
    
    // Cash flow
    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgagePayment
    const annualCashFlow = monthlyCashFlow * 12
    cumulativeCashFlow += annualCashFlow
    
    projections.push({
      year,
      homeValue: Math.round(homeValue * 100) / 100,
      mortgageBalance: Math.round(mortgageBalance * 100) / 100,
      homeEquity: Math.round(homeEquity * 100) / 100,
      homeEquityPercentage: Math.round(homeEquityPercentage * 100) / 100,
      monthlyRent: Math.round(monthlyRent * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlyMortgagePayment: Math.round(monthlyMortgagePayment * 100) / 100,
      monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
      annualCashFlow: Math.round(annualCashFlow * 100) / 100,
      cumulativeCashFlow: Math.round(cumulativeCashFlow * 100) / 100
    })
  }
  
  const totalEquityGrowth = projections[5]?.homeEquity - projections[0]?.homeEquity || 0
  const totalCumulativeCashFlow = projections[5]?.cumulativeCashFlow || 0
  
  // Calculate cash-on-cash return (annual average)
  const averageAnnualCashFlow = totalCumulativeCashFlow / 5
  const cashOnCashReturn = (averageAnnualCashFlow / property.downPayment) * 100
  
  // Calculate IRR
  const annualCashFlows = projections.slice(1).map(p => p.annualCashFlow) // Years 1-5
  const irr = calculateIRR(annualCashFlows, property.downPayment) * 100
  
  return {
    propertyId: property.id,
    propertyName: property.name || property.streetAddress,
    hasSufficientData: true,
    missingDataFields: [],
    projections,
    totalEquityGrowth,
    totalCumulativeCashFlow,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    irr: Math.round(irr * 100) / 100
  }
}

// Calculate monthly expenses with inflation
function calculateMonthlyExpenses(property: any, inflationRate: number, year: number): number {
  let totalExpenses = 0
  
  // Property taxes (annual, converted to monthly)
  if (property.annualTaxes) {
    const inflatedTaxes = property.annualTaxes * Math.pow(1 + inflationRate / 100, year)
    totalExpenses += inflatedTaxes / 12
  }
  
  // Property insurance (annual, converted to monthly)
  if (property.annualInsurance) {
    const inflatedInsurance = property.annualInsurance * Math.pow(1 + inflationRate / 100, year)
    totalExpenses += inflatedInsurance / 12
  }
  
  // HOA fees
  if (property.hoaFees) {
    if (property.hoaInputType === 'monthly') {
      const inflatedHoa = property.hoaFees * Math.pow(1 + inflationRate / 100, year)
      totalExpenses += inflatedHoa
    } else {
      const inflatedHoa = property.hoaFees * Math.pow(1 + inflationRate / 100, year)
      totalExpenses += inflatedHoa / 12
    }
  }
  
  // Property management fee
  if (property.propertyManagementFee) {
    if (property.propertyManagementInputType === 'dollar') {
      const inflatedManagement = property.propertyManagementFee * Math.pow(1 + inflationRate / 100, year)
      totalExpenses += inflatedManagement
    } else {
      // Percentage of rent - will be calculated in the main projection loop
      // For now, we'll use a placeholder
      totalExpenses += 0
    }
    // Note: Percentage-based management fees need to be calculated with rent projections
  }
  
  // Maintenance reserves
  if (property.maintenanceReserve) {
    if (property.maintenanceInputType === 'dollar') {
      const inflatedMaintenance = property.maintenanceReserve * Math.pow(1 + inflationRate / 100, year)
      totalExpenses += inflatedMaintenance
    } else {
      // Percentage of rent - will be calculated in the main projection loop
      totalExpenses += 0
    }
  }
  
  return totalExpenses
}

// Generate analysis for "keep vs. switch" decision
export function generateKeepVsSwitchAnalysis(
  properties: any[],
  globalAssumptions: FiveYearAssumptions
): PortfolioAnalysis {
  // For now, assume the first property is what they own
  // Later we'll add explicit ownership flags
  const ownedProperty = properties[0]
  const alternativeProperties = properties.slice(1, 10) // Max 9 alternatives (10 total properties)
  
  const ownedAnalysis = ownedProperty ? generatePropertyProjections(ownedProperty, globalAssumptions) : null
  const alternativeAnalyses = alternativeProperties.map(property => 
    generatePropertyProjections(property, globalAssumptions)
  )
  
  const allAnalyses = [ownedAnalysis, ...alternativeAnalyses].filter(Boolean)
  const validAnalyses = allAnalyses.filter(analysis => analysis?.hasSufficientData) || []
  
  // Focus on the owned property vs. best alternative
  const bestAlternative = alternativeAnalyses
    .filter(analysis => analysis.hasSufficientData)
    .reduce((best: PropertyAnalysis | null, current: PropertyAnalysis) => 
      current && (!best || current.irr > best.irr) ? current : best
    , null as PropertyAnalysis | null)
  
  return {
    assumptions: globalAssumptions,
    properties: allAnalyses.filter(Boolean),
    totalPortfolioValue: ownedAnalysis?.projections[0]?.homeValue || 0,
    totalEquityGrowth: ownedAnalysis?.totalEquityGrowth || 0,
    totalCumulativeCashFlow: ownedAnalysis?.totalCumulativeCashFlow || 0,
    bestPerformingProperty: bestAlternative
  }
}
