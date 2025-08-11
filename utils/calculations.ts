import { PropertyData, PITICalculation, AmortizationRow, DSCRCalculation, HomeSaleProperty, InvestmentProperty, PropertiesCollection } from '@/types/property'

// Utility function to format numbers with comma separators
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

export function calculatePITI(data: PropertyData | InvestmentProperty): PITICalculation {
  // Safety check for invalid inputs
  if (data.purchasePrice <= 0 || data.interestRate < 0 || data.loanTerm <= 0) {
    return {
      loanAmount: 0,
      monthlyPrincipalInterest: 0,
      monthlyTaxes: 0,
      monthlyInsurance: 0,
      monthlyPMI: 0,
      totalMonthlyPITI: 0,
      annualPITI: 0,
      downPaymentPercentage: 0,
      requiresPMI: false,
      amortizationSchedule: [],
    }
  }

  const loanAmount = data.purchasePrice - data.downPayment
  const downPaymentPercentage = (data.purchasePrice > 0) ? (data.downPayment / data.purchasePrice) * 100 : 0
  const requiresPMI = downPaymentPercentage < 20
  
  // Monthly mortgage payment (P&I)
  const monthlyRate = data.interestRate / 100 / 12
  const totalPayments = data.loanTerm * 12
  
  let monthlyPrincipalInterest = 0
  if (monthlyRate > 0 && loanAmount > 0) {
    monthlyPrincipalInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
  } else if (loanAmount > 0) {
    monthlyPrincipalInterest = loanAmount / totalPayments
  }
  
  // Monthly taxes and insurance
  const monthlyTaxes = data.annualTaxes / 12
  const monthlyInsurance = data.annualInsurance / 12
  
  // PMI calculation (typically 0.5% to 1% of loan amount annually)
  let monthlyPMI = 0
  if (requiresPMI && loanAmount > 0) {
    const pmiRate = downPaymentPercentage >= 15 ? 0.005 : 0.01 // 0.5% if 15-19.99%, 1% if <15%
    monthlyPMI = (loanAmount * pmiRate) / 12
  }
  
  const totalMonthlyPITI = monthlyPrincipalInterest + monthlyTaxes + monthlyInsurance + monthlyPMI
  const annualPITI = totalMonthlyPITI * 12
  
  // Generate amortization schedule (first 12 months)
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    monthlyPrincipalInterest,
    monthlyRate,
    12
  )
  
  return {
    loanAmount,
    monthlyPrincipalInterest,
    monthlyTaxes,
    monthlyInsurance,
    monthlyPMI,
    totalMonthlyPITI,
    annualPITI,
    downPaymentPercentage,
    requiresPMI,
    amortizationSchedule,
  }
}

function generateAmortizationSchedule(
  loanAmount: number,
  monthlyPayment: number,
  monthlyRate: number,
  months: number
): AmortizationRow[] {
  // Safety check for invalid inputs
  if (loanAmount <= 0 || monthlyPayment <= 0 || months <= 0) {
    return []
  }

  const schedule: AmortizationRow[] = []
  let remainingBalance = loanAmount
  
  for (let month = 1; month <= months; month++) {
    const interest = remainingBalance * monthlyRate
    const principal = monthlyPayment - interest
    remainingBalance = Math.max(0, remainingBalance - principal)
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal,
      interest,
      remainingBalance,
    })
  }
  
  return schedule
}

export function validatePropertyData(data: PropertyData | InvestmentProperty): string[] {
  const errors: string[] = []
  
  if (data.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0')
  }
  
  if (data.downPayment < 0) {
    errors.push('Down payment cannot be negative')
  }
  
  if (data.downPayment >= data.purchasePrice) {
    errors.push('Down payment must be less than purchase price')
  }
  
  if (data.interestRate < 0 || data.interestRate > 25) {
    errors.push('Interest rate must be between 0% and 25%')
  }
  
  if (data.loanTerm <= 0 || data.loanTerm > 50) {
    errors.push('Loan term must be between 1 and 50 years')
  }
  
  if (data.annualTaxes < 0) {
    errors.push('Annual taxes cannot be negative')
  }
  
  if (data.annualInsurance < 0) {
    errors.push('Annual insurance cannot be negative')
  }
  
  return errors
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateDSCR(data: PropertyData | InvestmentProperty, pitiCalculation: PITICalculation): DSCRCalculation {
  // Safety check for invalid PITI calculation
  if (!pitiCalculation || pitiCalculation.totalMonthlyPITI <= 0) {
    return {
      grossRentalIncome: 0,
      discountedRentalIncome: 0,
      totalExpenses: 0,
      netOperatingIncome: 0,
      dscrRatio: 0,
      monthlyCashFlow: 0,
      annualCashFlow: 0,
      maxLoanForPositiveDSCR: 0,
      breakdown: {
        piti: 0,
        propertyManagement: 0,
        maintenance: 0,
        hoaFees: 0,
      }
    }
  }

  // Convert monthly PITI to annual
  const annualPITI = pitiCalculation.totalMonthlyPITI * 12
  
  // data.grossRentalIncome is already stored as annual value
  const annualRentalIncome = data.grossRentalIncome
  
  // Apply rental income discount
  const discountedRentalIncome = annualRentalIncome * (1 - data.rentalIncomeDiscount / 100)
  
  // Calculate property management fees (always calculate for breakdown)
  let annualPropertyManagement = 0
  if (data.propertyManagementFee > 0) {
    if (data.propertyManagementInputType === 'percentage') {
      // data.propertyManagementFee now stores the raw percentage (e.g., 10 for 10%)
      annualPropertyManagement = annualRentalIncome * (data.propertyManagementFee / 100)
    } else {
      annualPropertyManagement = data.propertyManagementFee
      // Property management is always annual when in dollars mode
    }
  }
  
  // Calculate maintenance reserves (always calculate for breakdown)
  let annualMaintenance = 0
  if (data.maintenanceReserve > 0) {
    if (data.maintenanceInputType === 'percentage') {
      // data.maintenanceReserve now stores the raw percentage (e.g., 10 for 10%)
      annualMaintenance = annualRentalIncome * (data.maintenanceReserve / 100)
    } else {
      annualMaintenance = data.maintenanceReserve
      // Maintenance is always annual when in dollars mode
    }
  }
  
  // Calculate HOA fees (always calculate for breakdown)
  let annualHoaFees = 0
  if (data.hoaFees > 0) {
    annualHoaFees = data.hoaFees
    if (data.hoaInputType === 'monthly') {
      annualHoaFees *= 12
    }
  }
  
  // Calculate expenses for DSCR (only include if checkboxes are checked)
  let dscrExpenses = annualPITI
  if (data.includePropertyManagement) {
    dscrExpenses += annualPropertyManagement
  }
  if (data.includeMaintenance) {
    dscrExpenses += annualMaintenance
  }
  if (data.includeHoaFees) {
    dscrExpenses += annualHoaFees
  }
  
  // Total annual expenses for DSCR calculation
  const totalExpenses = dscrExpenses
  
  // Net Operating Income (for DSCR, only include expenses that are checked)
  const netOperatingIncome = discountedRentalIncome - totalExpenses
  
  // DSCR Ratio
  const dscrRatio = totalExpenses > 0 ? discountedRentalIncome / totalExpenses : 0
  
  // Cash flow calculations
  const monthlyCashFlow = netOperatingIncome / 12
  const annualCashFlow = netOperatingIncome
  
  // Maximum loan amount for positive DSCR (>1.0)
  let maxLoanForPositiveDSCR = 0
  if (data.interestRate > 0) {
    const monthlyRate = data.interestRate / 100 / 12
    const maxMonthlyPayment = discountedRentalIncome / 12
    if (monthlyRate > 0) {
      maxLoanForPositiveDSCR = maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -data.loanTerm * 12)) / monthlyRate
    }
  }
  
  return {
    grossRentalIncome: annualRentalIncome,
    discountedRentalIncome,
    totalExpenses,
    netOperatingIncome,
    dscrRatio,
    monthlyCashFlow,
    annualCashFlow,
    maxLoanForPositiveDSCR,
    breakdown: {
      piti: annualPITI,
      propertyManagement: annualPropertyManagement,
      maintenance: annualMaintenance,
      hoaFees: annualHoaFees,
    }
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
} 

export function calculateCapRate(propertyData: PropertyData | InvestmentProperty, pitiCalculation: PITICalculation): number {
  // Safety check for invalid PITI calculation
  if (!pitiCalculation || pitiCalculation.totalMonthlyPITI <= 0) {
    return 0
  }

  // Calculate Net Operating Income (NOI)
  // NOI = Gross Rental Income - Operating Expenses (excluding mortgage payments)
  
  const grossRentalIncome = propertyData.grossRentalIncome
  const rentalIncomeDiscount = propertyData.rentalIncomeDiscount / 100
  
  // Net rental income after vacancy and maintenance discount
  const netRentalIncome = grossRentalIncome * (1 - rentalIncomeDiscount)
  
  // Operating expenses (excluding mortgage payments)
  let operatingExpenses = 0
  
  // Property management fee - should be calculated on GROSS rental income, not discounted
  if (propertyData.includePropertyManagement) {
    if (propertyData.propertyManagementInputType === 'percentage') {
      operatingExpenses += (propertyData.propertyManagementFee / 100) * grossRentalIncome
    } else {
      operatingExpenses += propertyData.propertyManagementFee
    }
  }
  
  // Maintenance reserve - should be calculated on GROSS rental income, not discounted
  if (propertyData.includeMaintenance) {
    if (propertyData.maintenanceInputType === 'percentage') {
      operatingExpenses += (propertyData.maintenanceReserve / 100) * grossRentalIncome
    } else {
      operatingExpenses += propertyData.maintenanceReserve
    }
  }
  
  // HOA fees
  if (propertyData.includeHoaFees) {
    operatingExpenses += propertyData.hoaFees
  }
  
  // Add property taxes and insurance (these are operating expenses, not debt service)
  operatingExpenses += propertyData.annualTaxes
  operatingExpenses += propertyData.annualInsurance
  
  // Calculate NOI
  const noi = netRentalIncome - operatingExpenses
  
  // Cap Rate = NOI / Property Value
  const propertyValue = propertyData.marketValue || propertyData.purchasePrice
  
  if (propertyValue <= 0) return 0
  
  return noi / propertyValue
} 

export function calculateNetProceeds(propertyData: PropertyData | HomeSaleProperty, propertiesCollection?: PropertiesCollection): {
  netProceeds: number
  capitalGainsTax: number
  totalExpenses: number
  mortgagePayoff: number
  qiFees: number
  boot: number
  bootTax: number
  use1031Exchange: boolean
} {
  // Handle both PropertyData and HomeSaleProperty interfaces
  const salePrice = 'salePrice' in propertyData ? propertyData.salePrice : 0
  const outstandingMortgageBalance = 'outstandingMortgageBalance' in propertyData ? propertyData.outstandingMortgageBalance : 0
  const realtorCommission = 'realtorCommission' in propertyData ? propertyData.realtorCommission : 0
  const realtorCommissionInputType = 'realtorCommissionInputType' in propertyData ? propertyData.realtorCommissionInputType : 'percentage'
  const closingCosts = 'closingCosts' in propertyData ? propertyData.closingCosts : 0
  const capitalGainsTaxRate = 'capitalGainsTaxRate' in propertyData ? propertyData.capitalGainsTaxRate : 15
  const originalPurchasePrice = 'originalPurchasePrice' in propertyData ? propertyData.originalPurchasePrice : 0
  
  // 1031 Exchange fields
  const use1031Exchange = 'use1031Exchange' in propertyData ? propertyData.use1031Exchange : false
  const selectedReplacementPropertyId = 'selectedReplacementPropertyId' in propertyData ? propertyData.selectedReplacementPropertyId : undefined

  // Calculate realtor commission
  const realtorFee = realtorCommissionInputType === 'percentage' 
    ? (salePrice * realtorCommission) / 100
    : realtorCommission

  // Calculate QI fees for 1031 exchange
  const qiFees = use1031Exchange ? 1500 : 0

  // Calculate total expenses
  const totalExpenses = realtorFee + closingCosts + qiFees

  // Calculate capital gains
  const adjustedBasis = originalPurchasePrice
  const capitalGain = salePrice - adjustedBasis
  
  let capitalGainsTax = 0
  let boot = 0
  let bootTax = 0

  if (use1031Exchange && propertiesCollection && selectedReplacementPropertyId) {
    // Find the replacement property
    const replacementProperty = propertiesCollection.properties.find(
      p => p.id === selectedReplacementPropertyId && p.calculatorMode === 'investment'
    ) as InvestmentProperty | undefined

    if (replacementProperty) {
      // Calculate boot (difference between sale price and replacement property purchase price)
      boot = Math.max(0, salePrice - replacementProperty.purchasePrice)
      
      // Only tax the boot amount in 1031 exchange
      bootTax = boot * (capitalGainsTaxRate / 100)
      capitalGainsTax = bootTax
    } else {
      // Fallback to traditional calculation if replacement property not found
      capitalGainsTax = Math.max(0, capitalGain * (capitalGainsTaxRate / 100))
    }
  } else {
    // Traditional sale - tax the full capital gain
    capitalGainsTax = Math.max(0, capitalGain * (capitalGainsTaxRate / 100))
  }

  // Calculate net proceeds
  const netProceeds = salePrice - outstandingMortgageBalance - totalExpenses - capitalGainsTax

  return {
    netProceeds: Math.max(0, netProceeds),
    capitalGainsTax,
    totalExpenses,
    mortgagePayoff: outstandingMortgageBalance,
    qiFees,
    boot,
    bootTax,
    use1031Exchange
  }
} 

export function calculatePITIWithHomeSaleProceeds(
  property: InvestmentProperty, 
  propertiesCollection?: PropertiesCollection
): PITICalculation {
  // Calculate effective down payment considering home sale proceeds
  let effectiveDownPayment = property.downPayment
  
  if (property.useHomeSaleProceedsAsDownPayment && propertiesCollection && property.selectedHomeSalePropertyId) {
    const selectedHomeSaleProperty = propertiesCollection.properties.find(
      p => p.id === property.selectedHomeSalePropertyId && p.calculatorMode === 'homeSale'
    ) as HomeSaleProperty | undefined
    
    if (selectedHomeSaleProperty) {
      const calculation = calculateNetProceeds(selectedHomeSaleProperty, propertiesCollection)
      effectiveDownPayment = calculation.netProceeds
    }
  }
  
  // Create a modified property object with the effective down payment
  const adjustedProperty = {
    ...property,
    downPayment: effectiveDownPayment
  }

  // Call the original calculatePITI function with the adjusted property
  return calculatePITI(adjustedProperty)
} 