export interface PropertyData {
  purchasePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  annualTaxes: number
  annualInsurance: number
  marketValue: number
  streetAddress: string
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family'
  yearBuilt: number
  taxInputType: 'annual' | 'monthly'
  insuranceInputType: 'annual' | 'monthly'
  downPaymentInputType: 'dollars' | 'percentage'
  // DSCR Calculator inputs
  grossRentalIncome: number
  rentalIncomeInputType: 'annual' | 'monthly'
  rentalIncomeDiscount: number
  propertyManagementFee: number
  propertyManagementInputType: 'dollars' | 'percentage'
  includePropertyManagement: boolean
  maintenanceReserve: number
  maintenanceInputType: 'dollars' | 'percentage'
  includeMaintenance: boolean
  hoaFees: number
  hoaInputType: 'annual' | 'monthly'
  includeHoaFees: boolean
  // Home Sale Calculator inputs
  salePrice: number
  outstandingMortgageBalance: number
  realtorCommission: number
  realtorCommissionInputType: 'dollars' | 'percentage'
  closingCosts: number
  capitalGainsTaxRate: number
  originalPurchasePrice: number
  // Calculator mode
  calculatorMode: 'investment' | 'homeSale'
  // Use home sale proceeds as down payment
  useHomeSaleProceedsAsDownPayment: boolean
}

// New interfaces for better separation of concerns
export interface HomeSaleProperty {
  streetAddress: string
  salePrice: number
  outstandingMortgageBalance: number
  realtorCommission: number
  realtorCommissionInputType: 'dollars' | 'percentage'
  closingCosts: number
  capitalGainsTaxRate: number
  originalPurchasePrice: number
}

export interface InvestmentProperty {
  streetAddress: string
  purchasePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  annualTaxes: number
  annualInsurance: number
  marketValue: number
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family'
  yearBuilt: number
  taxInputType: 'annual' | 'monthly'
  insuranceInputType: 'annual' | 'monthly'
  downPaymentInputType: 'dollars' | 'percentage'
  // DSCR Calculator inputs
  grossRentalIncome: number
  rentalIncomeInputType: 'annual' | 'monthly'
  rentalIncomeDiscount: number
  propertyManagementFee: number
  propertyManagementInputType: 'dollars' | 'percentage'
  includePropertyManagement: boolean
  maintenanceReserve: number
  maintenanceInputType: 'dollars' | 'percentage'
  includeMaintenance: boolean
  hoaFees: number
  hoaInputType: 'annual' | 'monthly'
  includeHoaFees: boolean
}

export interface CombinedPropertyData {
  homeSaleProperty: HomeSaleProperty
  investmentProperty: InvestmentProperty
  useHomeSaleProceedsAsDownPayment: boolean
  calculatorMode: 'investment' | 'homeSale'
}

export interface PITICalculation {
  loanAmount: number
  monthlyPrincipalInterest: number
  monthlyTaxes: number
  monthlyInsurance: number
  monthlyPMI: number
  totalMonthlyPITI: number
  annualPITI: number
  downPaymentPercentage: number
  requiresPMI: boolean
  amortizationSchedule: AmortizationRow[]
}

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface DSCRCalculation {
  grossRentalIncome: number
  discountedRentalIncome: number
  totalExpenses: number
  netOperatingIncome: number
  dscrRatio: number
  monthlyCashFlow: number
  annualCashFlow: number
  maxLoanForPositiveDSCR: number
  breakdown: {
    piti: number
    propertyManagement: number
    maintenance: number
    hoaFees: number
  }
}

export interface ValidationError {
  field: string
  message: string
} 