import { PropertyData, PITICalculation, AmortizationRow, DSCRCalculation } from '@/types/property'

// Utility function to format numbers with comma separators
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

export function calculatePITI(data: PropertyData): PITICalculation {
  const loanAmount = data.purchasePrice - data.downPayment
  const downPaymentPercentage = (data.downPayment / data.purchasePrice) * 100
  const requiresPMI = downPaymentPercentage < 20
  
  // Monthly mortgage payment (P&I)
  const monthlyRate = data.interestRate / 100 / 12
  const totalPayments = data.loanTerm * 12
  
  let monthlyPrincipalInterest = 0
  if (monthlyRate > 0) {
    monthlyPrincipalInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
  } else {
    monthlyPrincipalInterest = loanAmount / totalPayments
  }
  
  // Monthly taxes and insurance
  const monthlyTaxes = data.annualTaxes / 12
  const monthlyInsurance = data.annualInsurance / 12
  
  // PMI calculation (typically 0.5% to 1% of loan amount annually)
  let monthlyPMI = 0
  if (requiresPMI) {
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

export function validatePropertyData(data: PropertyData): string[] {
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

export function calculateDSCR(data: PropertyData, pitiCalculation: PITICalculation): DSCRCalculation {
  // Convert monthly PITI to annual
  const annualPITI = pitiCalculation.totalMonthlyPITI * 12
  
  // data.grossRentalIncome is already stored as annual value
  const annualRentalIncome = data.grossRentalIncome
  
  // Apply rental income discount
  const discountedRentalIncome = annualRentalIncome * (1 - data.rentalIncomeDiscount / 100)
  
  // Calculate property management fees
  let annualPropertyManagement = 0
  if (data.includePropertyManagement && data.propertyManagementFee > 0) {
    if (data.propertyManagementInputType === 'percentage') {
      // data.propertyManagementFee now stores the raw percentage (e.g., 10 for 10%)
      annualPropertyManagement = annualRentalIncome * (data.propertyManagementFee / 100)
    } else {
      annualPropertyManagement = data.propertyManagementFee
      // Property management is always annual when in dollars mode
    }
  }
  
  // Calculate maintenance reserves
  let annualMaintenance = 0
  if (data.includeMaintenance && data.maintenanceReserve > 0) {
    
    if (data.maintenanceInputType === 'percentage') {
      // data.maintenanceReserve now stores the raw percentage (e.g., 10 for 10%)
      annualMaintenance = annualRentalIncome * (data.maintenanceReserve / 100)
    } else {
      annualMaintenance = data.maintenanceReserve
      // Maintenance is always annual when in dollars mode
    }
  }
  
  // Calculate HOA fees
  let annualHoaFees = 0
  if (data.includeHoaFees && data.hoaFees > 0) {
    annualHoaFees = data.hoaFees
    if (data.hoaInputType === 'monthly') {
      annualHoaFees *= 12
    }
  }
  
  // Total annual expenses
  const totalExpenses = annualPITI + annualPropertyManagement + annualMaintenance + annualHoaFees
  
  // Net Operating Income
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

export function calculateCapRate(propertyData: PropertyData, pitiCalculation: PITICalculation): number {
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
  
  // Debug logging
  console.log('Cap Rate Calculation Debug:', {
    grossRentalIncome,
    rentalIncomeDiscount: rentalIncomeDiscount * 100 + '%',
    netRentalIncome,
    operatingExpenses,
    noi,
    propertyValue,
    capRate: noi / propertyValue
  })
  
  return noi / propertyValue
} 