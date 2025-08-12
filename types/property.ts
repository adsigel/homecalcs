// Individual property interfaces
export interface HomeSaleProperty {
  id: string
  name: string
  streetAddress: string
  salePrice: number
  outstandingMortgageBalance: number
  realtorCommission: number
  realtorCommissionInputType: 'dollars' | 'percentage'
  closingCosts: number
  capitalGainsTaxRate: number
  originalPurchasePrice: number
  // 1031 Exchange fields
  use1031Exchange: boolean
  selectedReplacementPropertyId: string | null // ID of the replacement investment property
  calculatorMode: 'homeSale'
}

export interface InvestmentProperty {
  id: string
  name: string
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
  // Integration with home sale proceeds
  useHomeSaleProceedsAsDownPayment: boolean
  selectedHomeSalePropertyId: string | null // ID of the home sale property whose proceeds to use
  calculatorMode: 'investment'
}

// Union type for all properties
export type Property = HomeSaleProperty | InvestmentProperty

// Properties collection stored in localStorage/cloud storage
export interface PropertiesCollection {
  properties: Property[]
  activePropertyId: string | null
  lastUpdated?: string // ISO timestamp for cloud storage sync
}

// Legacy interface for backward compatibility during transition
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