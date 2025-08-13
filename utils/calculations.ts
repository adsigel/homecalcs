import { Property, PropertiesCollection } from '@/types/property'

// Utility function to format numbers with comma separators
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// Calculate PITI for investment properties
export function calculatePITI(property: Property): {
  principal: number
  interest: number
  taxes: number
  insurance: number
  totalMonthlyPITI: number
  totalAnnualPITI: number
} | null {
  if (!property) return null

  const { purchasePrice, downPayment, interestRate, loanTerm, annualTaxes, annualInsurance } = property
  
  if (purchasePrice <= 0 || interestRate <= 0 || loanTerm <= 0) return null
  
  const loanAmount = purchasePrice - downPayment
  if (loanAmount <= 0) return null
  
  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12
  
  // Total number of payments
  const totalPayments = loanTerm * 12
  
  // Monthly mortgage payment (principal + interest)
  let monthlyPayment = 0
  if (monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1)
  } else {
    monthlyPayment = loanAmount / totalPayments
  }
  
  // Monthly taxes and insurance
  const monthlyTaxes = annualTaxes / 12
  const monthlyInsurance = annualInsurance / 12
  
  // Total monthly PITI
  const totalMonthlyPITI = monthlyPayment + monthlyTaxes + monthlyInsurance
  
  return {
    principal: monthlyPayment,
    interest: monthlyPayment, // This is actually principal + interest, but we'll keep the structure
    taxes: monthlyTaxes,
    insurance: monthlyInsurance,
    totalMonthlyPITI,
    totalAnnualPITI: totalMonthlyPITI * 12
  }
}

function generateAmortizationSchedule(
  loanAmount: number,
  monthlyPayment: number,
  monthlyRate: number,
  months: number
): any[] { // AmortizationRow type was removed, so using 'any' for now
  // Safety check for invalid inputs
  if (loanAmount <= 0 || monthlyPayment <= 0 || months <= 0) {
    return []
  }

  const schedule: any[] = []
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

// Calculate PITI with home sale proceeds adjustment
export function calculatePITIWithHomeSaleProceeds(
  property: Property, 
  propertiesCollection?: PropertiesCollection
): {
  principal: number
  interest: number
  taxes: number
  insurance: number
  totalMonthlyPITI: number
  totalAnnualPITI: number
  adjustedDownPayment: number
  homeSaleProceedsUsed: number
} | null {
  if (!property) return null
  
  let adjustedDownPayment = property.downPayment
  let homeSaleProceedsUsed = 0
  
  if (property.useHomeSaleProceedsAsDownPayment && property.selectedHomeSalePropertyId && propertiesCollection) {
    const sourceProperty = propertiesCollection.properties.find(p => 
      p.id === property.selectedHomeSalePropertyId
    )
    
    if (sourceProperty) {
      const netProceeds = calculateNetProceeds(sourceProperty, propertiesCollection)
      if (netProceeds && netProceeds.netProceeds > 0) {
        homeSaleProceedsUsed = Math.min(netProceeds.netProceeds, property.purchasePrice)
        adjustedDownPayment = homeSaleProceedsUsed
      }
    }
  }
  
  // Create a temporary property with adjusted down payment for PITI calculation
  const tempProperty = { ...property, downPayment: adjustedDownPayment }
  const pitiCalculation = calculatePITI(tempProperty)
  
  if (!pitiCalculation) return null
  
  return {
    ...pitiCalculation,
    adjustedDownPayment,
    homeSaleProceedsUsed
  }
}

// Validate property data for calculations
export function validatePropertyData(property: Property, calculatorMode?: 'investment' | 'homeSale'): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!property.streetAddress.trim()) {
    errors.push('Property address is required')
  }
  
  // Use calculatorMode if provided, otherwise fall back to property.activeMode
  const mode = calculatorMode || property.activeMode
  
  if (mode === 'investment') {
    if (property.purchasePrice <= 0) {
      errors.push('Purchase price must be greater than 0')
    }
    if (property.interestRate < 0) {
      errors.push('Interest rate cannot be negative')
    }
    if (property.loanTerm <= 0) {
      errors.push('Loan term must be greater than 0')
    }
  }
  
  if (mode === 'homeSale') {
    if (property.salePrice <= 0) {
      errors.push('Sale price must be greater than 0')
    }
          if (property.purchasePrice < 0) {
        errors.push('Purchase price cannot be negative')
      }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate DSCR (Debt Service Coverage Ratio)
export function calculateDSCR(property: Property, pitiCalculation: any): {
  grossAnnualRentalIncome: number
  netAnnualRentalIncome: number
  annualPITI: number
  dscrRatio: number
  annualExpenses: {
    propertyManagement: number
    maintenance: number
    hoaFees: number
    total: number
  }
  dscrExpenses: number
} | null {
  if (!property) return null
  
  const { grossRentalIncome, rentalIncomeInputType, rentalIncomeDiscount } = property
  
  // Convert rental income to annual
  const grossAnnualRentalIncome = rentalIncomeInputType === 'monthly' ? grossRentalIncome * 12 : grossRentalIncome
  
  // Apply rental income discount
  const netAnnualRentalIncome = grossAnnualRentalIncome * (1 - rentalIncomeDiscount / 100)
  
  // Get annual PITI
  const annualPITI = pitiCalculation.totalAnnualPITI
  
  // Calculate annual expenses (always calculate for breakdown, but only include in DSCR if checkbox is checked)
  const annualPropertyManagement = property.propertyManagementInputType === 'dollar' 
    ? property.propertyManagementFee * 12 
    : (grossAnnualRentalIncome * property.propertyManagementFee / 100)
  
  const annualMaintenance = property.maintenanceInputType === 'dollar'
    ? property.maintenanceReserve * 12
    : (grossAnnualRentalIncome * property.maintenanceReserve / 100)
  
  const annualHoaFees = property.hoaInputType === 'monthly'
    ? property.hoaFees * 12
    : property.hoaFees
  
  const totalExpenses = annualPropertyManagement + annualMaintenance + annualHoaFees
  
  // Calculate DSCR expenses (only include expenses that are checked)
  let dscrExpenses = annualPITI
  if (property.includePropertyManagement) dscrExpenses += annualPropertyManagement
  if (property.includeMaintenance) dscrExpenses += annualMaintenance
  if (property.includeHoaFees) dscrExpenses += annualHoaFees
  
  // Calculate DSCR ratio
  const dscrRatio = dscrExpenses > 0 ? netAnnualRentalIncome / dscrExpenses : 0
  
  return {
    grossAnnualRentalIncome,
    netAnnualRentalIncome,
    annualPITI,
    dscrRatio,
    annualExpenses: {
      propertyManagement: annualPropertyManagement,
      maintenance: annualMaintenance,
      hoaFees: annualHoaFees,
      total: totalExpenses
    },
    dscrExpenses
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
} 

// Calculate Cap Rate
export function calculateCapRate(property: Property): {
  netOperatingIncome: number
  capRate: number
} | null {
  if (!property) return null
  
  const { grossRentalIncome, rentalIncomeInputType, rentalIncomeDiscount, annualTaxes, annualInsurance } = property
  
  // Convert rental income to annual
  const grossAnnualRentalIncome = rentalIncomeInputType === 'monthly' ? grossRentalIncome * 12 : grossRentalIncome
  
  // Apply rental income discount
  const netAnnualRentalIncome = grossAnnualRentalIncome * (1 - rentalIncomeDiscount / 100)
  
  // Calculate Net Operating Income (NOI)
  const noi = netAnnualRentalIncome - annualTaxes - annualInsurance
  
  // Calculate Cap Rate
  const capRate = property.marketValue > 0 ? (noi / property.marketValue) * 100 : 0
  
  return {
    netOperatingIncome: noi,
    capRate
  }
} 

// Calculate net proceeds from home sale
export function calculateNetProceeds(
  property: Property, 
  propertiesCollection?: PropertiesCollection
): {
  salePrice: number
  outstandingMortgage: number
  realtorCommission: number
  closingCosts: number
  totalExpenses: number
  netProceeds: number
  capitalGainsTax: number
  qiFees: number
  boot: number
  bootTax: number
  use1031Exchange: boolean
} | null {
  if (!property) return null
  
  const { 
    salePrice, 
    outstandingMortgageBalance, 
    realtorCommission, 
    realtorCommissionInputType,
    closingCosts, 
    capitalGainsTaxRate,
    purchasePrice,
    use1031Exchange,
    selectedReplacementPropertyId,
    qiFees: propertyQiFees
  } = property
  
  if (salePrice <= 0) return null
  
  // Calculate realtor commission
  const realtorCommissionAmount = realtorCommissionInputType === 'dollar' 
    ? realtorCommission 
    : (salePrice * realtorCommission / 100)
  
  // Calculate total expenses
  let totalExpenses = realtorCommissionAmount + closingCosts
  
  // Add QI fees if using 1031 exchange
  if (use1031Exchange) {
    totalExpenses += (propertyQiFees || 1500) // Default to $1500 if not set
  }
  
  // Calculate net proceeds before taxes
  const netProceedsBeforeTax = salePrice - outstandingMortgageBalance - totalExpenses
  
  // Calculate capital gains
  let capitalGainsTax = 0
  let boot = 0
  let bootTax = 0
  
  if (use1031Exchange && selectedReplacementPropertyId && propertiesCollection) {
    // 1031 Exchange: Find replacement property (any property type)
    const replacementProperty = propertiesCollection.properties.find(p => 
      p.id === selectedReplacementPropertyId
    )
    
    if (replacementProperty) {
      // Calculate boot (taxable portion when replacement property is worth less)
      boot = Math.max(0, salePrice - replacementProperty.purchasePrice)
      
      if (boot > 0) {
        // Calculate capital gains on the entire gain
        const capitalGains = Math.max(0, salePrice - purchasePrice)
        // Pay capital gains tax only on the boot amount (proportional to total gain)
        bootTax = (boot / capitalGains) * (capitalGains * capitalGainsTaxRate / 100)
        // Set capital gains tax to boot tax for 1031 exchange
        capitalGainsTax = bootTax
      } else {
        // No boot - full tax deferral
        capitalGainsTax = 0
      }
    }
  } else {
    // Regular sale: Calculate capital gains tax on entire gain
    const capitalGains = Math.max(0, salePrice - purchasePrice)
    capitalGainsTax = capitalGains * capitalGainsTaxRate / 100
  }
  
  // Final net proceeds
  const netProceeds = netProceedsBeforeTax - capitalGainsTax - bootTax
  
  return {
    salePrice,
    outstandingMortgage: outstandingMortgageBalance,
    realtorCommission: realtorCommissionAmount,
    closingCosts,
    totalExpenses,
    netProceeds,
    capitalGainsTax,
    qiFees: use1031Exchange ? (propertyQiFees || 1500) : 0,
    boot,
    bootTax,
    use1031Exchange
  }
} 