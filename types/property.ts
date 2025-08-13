// Base property interface with shared fields
export interface BaseProperty {
  id: string
  name: string
  streetAddress: string
  lastUpdated: string
  
  // Shared property details
  purchasePrice: number
  originalPurchasePrice: number
  yearBuilt?: number
  propertyType: 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'other'
  
  // Mortgage details (shared between investment and sale analysis)
  outstandingMortgageBalance: number
  interestRate: number
  loanTerm: number
  
  // Tax and insurance (shared)
  annualTaxes: number
  annualInsurance: number
  taxInputType: 'dollar' | 'percentage'
  insuranceInputType: 'dollar' | 'percentage'
  taxTimeframe: 'annual' | 'monthly'
  insuranceTimeframe: 'annual' | 'monthly'
  
  // Current market value (for both investment and sale analysis)
  marketValue: number
  
  // Calculator modes this property supports
  supportedModes: ('investment' | 'homeSale')[]
  
  // Active calculator mode for this property
  activeMode: 'investment' | 'homeSale'
}

// Investment-specific data
export interface InvestmentData {
  // Rental income
  grossRentalIncome: number
  rentalIncomeInputType: 'monthly' | 'annual'
  rentalIncomeDiscount: number
  
  // Operating expenses
  propertyManagementFee: number
  propertyManagementInputType: 'dollar' | 'percentage'
  includePropertyManagement: boolean
  
  maintenanceReserve: number
  maintenanceInputType: 'dollar' | 'percentage'
  includeMaintenance: boolean
  
  hoaFees: number
  hoaInputType: 'monthly' | 'annual'
  includeHoaFees: boolean
  
  // Down payment and financing
  downPayment: number
  downPaymentInputType: 'dollar' | 'percentage'
  useHomeSaleProceedsAsDownPayment: boolean
  selectedHomeSalePropertyId: string | null
}

// Home sale specific data
export interface HomeSaleData {
  // Sale details
  salePrice: number
  realtorCommission: number
  realtorCommissionInputType: 'dollar' | 'percentage'
  closingCosts: number
  
  // Tax considerations
  capitalGainsTaxRate: number
  use1031Exchange: boolean
  selectedReplacementPropertyId: string | null
  
  // 1031 exchange details
  qiFees: number // Qualified Intermediary fees
}

// Main property interface combining all data
export interface Property extends BaseProperty, InvestmentData, HomeSaleData {}

// Properties collection
export interface PropertiesCollection {
  properties: Property[]
  activePropertyId: string | null
  lastUpdated?: string
}

// Legacy interfaces for backward compatibility during transition
export interface InvestmentProperty extends Property {
  calculatorMode: 'investment'
}

export interface HomeSaleProperty extends Property {
  calculatorMode: 'homeSale'
}

// Union type for backward compatibility
export type LegacyProperty = InvestmentProperty | HomeSaleProperty

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