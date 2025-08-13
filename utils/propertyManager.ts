import { Property, PropertiesCollection } from '@/types/property'

// Create a new property with default values
export function createProperty(
  name: string, 
  streetAddress: string, 
  initialMode: 'investment' | 'homeSale' = 'investment',
  marketValue?: number,
  yearBought?: number
): Property {
  const now = new Date().toISOString()
  
  return {
    id: generateId(),
    name,
    streetAddress,
    lastUpdated: now,
    
    // Shared property details
    purchasePrice: 0,
    originalPurchasePrice: 0,
    yearBought: yearBought || undefined,
    propertyType: 'single-family',
    
    // Mortgage details
    outstandingMortgageBalance: 0,
    interestRate: 0,
    loanTerm: 30,
    
    // Tax and insurance
    annualTaxes: 0,
    annualInsurance: 0,
    taxInputType: 'dollar',
    insuranceInputType: 'dollar',
    taxTimeframe: 'annual',
    insuranceTimeframe: 'annual',
    
    // Market value
    marketValue: marketValue || 0,
    
    // Calculator modes
    supportedModes: [initialMode],
    activeMode: initialMode,
    
    // Investment data
    grossRentalIncome: 0,
    rentalIncomeInputType: 'monthly',
    rentalIncomeDiscount: 0,
    propertyManagementFee: 0,
    propertyManagementInputType: 'dollar',
    includePropertyManagement: false,
    maintenanceReserve: 0,
    maintenanceInputType: 'dollar',
    includeMaintenance: false,
    hoaFees: 0,
    hoaInputType: 'monthly',
    includeHoaFees: false,
    downPayment: 0,
    downPaymentInputType: 'dollar',
    useHomeSaleProceedsAsDownPayment: false,
    selectedHomeSalePropertyId: null,
    
    // Home sale data
    salePrice: 0,
    realtorCommission: 5,
    realtorCommissionInputType: 'percentage',
    closingCosts: 10000,
    capitalGainsTaxRate: 15,
    use1031Exchange: false,
    selectedReplacementPropertyId: null,
    qiFees: 1500, // Default QI fee
  }
}

// Create investment property (legacy function for backward compatibility)
export function createInvestmentProperty(name: string, streetAddress: string): Property {
  return createProperty(name, streetAddress, 'investment')
}

// Create home sale property (legacy function for backward compatibility)
export function createHomeSaleProperty(name: string, streetAddress: string): Property {
  return createProperty(name, streetAddress, 'homeSale')
}

// Add a new calculator mode to an existing property
export function addCalculatorMode(property: Property, mode: 'investment' | 'homeSale'): Property {
  if (!property || !property.supportedModes) {
    // If property doesn't have supportedModes, initialize it
    return {
      ...property,
      supportedModes: [mode],
      activeMode: mode
    }
  }
  
  if (!property.supportedModes.includes(mode)) {
    return {
      ...property,
      supportedModes: [...property.supportedModes, mode]
    }
  }
  return property
}

// Switch calculator mode for a property
export function switchCalculatorMode(property: Property, mode: 'investment' | 'homeSale'): Property {
  if (!property || !property.supportedModes) {
    // If property doesn't have supportedModes, initialize it
    return {
      ...property,
      supportedModes: [mode],
      activeMode: mode
    }
  }
  
  if (property.supportedModes.includes(mode)) {
    return {
      ...property,
      activeMode: mode
    }
  }
  return property
}

// Check if property supports a specific calculator mode
export function supportsCalculatorMode(property: Property, mode: 'investment' | 'homeSale'): boolean {
  if (!property || !property.supportedModes) {
    return false
  }
  return property.supportedModes.includes(mode)
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Load properties from localStorage (fallback)
export function loadProperties(): PropertiesCollection {
  if (typeof window === 'undefined') {
    return { properties: [], activePropertyId: null }
  }
  
  try {
    const stored = localStorage.getItem('properties')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Handle legacy data structure during transition
      if (parsed.properties && Array.isArray(parsed.properties)) {
        const migratedProperties = parsed.properties.map((p: any) => {
          // Migrate all properties to new structure to ensure they have required fields
          return migrateLegacyProperty(p)
        })
        return {
          properties: migratedProperties,
          activePropertyId: parsed.activePropertyId
        }
      }
      return parsed
    }
  } catch (error) {
    console.error('Failed to load properties from localStorage:', error)
  }
  
  return { properties: [], activePropertyId: null }
}

// Save properties to localStorage (fallback)
export function saveProperties(propertiesCollection: PropertiesCollection): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('properties', JSON.stringify(propertiesCollection))
  } catch (error) {
    console.error('Failed to save properties to localStorage:', error)
  }
}

// Migrate legacy property to new unified structure
function migrateLegacyProperty(legacyProperty: any): Property {
  const now = new Date().toISOString()
  
  return {
    id: legacyProperty.id,
    name: legacyProperty.name,
    streetAddress: legacyProperty.streetAddress,
    lastUpdated: now,
    
    // Shared property details
    purchasePrice: legacyProperty.purchasePrice || 0,
    originalPurchasePrice: legacyProperty.originalPurchasePrice || 0,
    yearBought: legacyProperty.yearBuilt || legacyProperty.yearBought,
    propertyType: legacyProperty.propertyType || 'single-family',
    
    // Mortgage details
    outstandingMortgageBalance: legacyProperty.outstandingMortgageBalance || 0,
    interestRate: legacyProperty.interestRate || 0,
    loanTerm: legacyProperty.loanTerm || 30,
    
    // Tax and insurance
    annualTaxes: legacyProperty.annualTaxes || 0,
    annualInsurance: legacyProperty.annualInsurance || 0,
    taxInputType: legacyProperty.taxInputType || 'dollar',
    insuranceInputType: legacyProperty.insuranceInputType || 'dollar',
    taxTimeframe: legacyProperty.taxTimeframe || 'annual',
    insuranceTimeframe: legacyProperty.insuranceTimeframe || 'annual',
    
    // Market value
    marketValue: legacyProperty.marketValue || 0,
    
    // Calculator modes
    supportedModes: [legacyProperty.calculatorMode || 'investment'],
    activeMode: legacyProperty.calculatorMode || 'investment',
    
    // Investment data
    grossRentalIncome: legacyProperty.grossRentalIncome || 0,
    rentalIncomeInputType: legacyProperty.rentalIncomeInputType || 'monthly',
    rentalIncomeDiscount: legacyProperty.rentalIncomeDiscount || 0,
    propertyManagementFee: legacyProperty.propertyManagementFee || 0,
    propertyManagementInputType: legacyProperty.propertyManagementInputType || 'dollar',
    includePropertyManagement: legacyProperty.includePropertyManagement || false,
    maintenanceReserve: legacyProperty.maintenanceReserve || 0,
    maintenanceInputType: legacyProperty.maintenanceInputType || 'dollar',
    includeMaintenance: legacyProperty.includeMaintenance || false,
    hoaFees: legacyProperty.hoaFees || 0,
    hoaInputType: legacyProperty.hoaInputType || 'dollar',
    includeHoaFees: legacyProperty.includeHoaFees || false,
    downPayment: legacyProperty.downPayment || 0,
    downPaymentInputType: legacyProperty.downPaymentInputType || 'dollar',
    useHomeSaleProceedsAsDownPayment: legacyProperty.useHomeSaleProceedsAsDownPayment || false,
    selectedHomeSalePropertyId: legacyProperty.selectedHomeSalePropertyId || null,
    
    // Home sale data
    salePrice: legacyProperty.salePrice || 0,
    realtorCommission: legacyProperty.realtorCommission || 5,
    realtorCommissionInputType: legacyProperty.realtorCommissionInputType || 'percentage',
    closingCosts: legacyProperty.closingCosts || 10000,
    capitalGainsTaxRate: legacyProperty.capitalGainsTaxRate || 15,
    use1031Exchange: legacyProperty.use1031Exchange || false,
    selectedReplacementPropertyId: legacyProperty.selectedReplacementPropertyId || null,
    qiFees: legacyProperty.qiFees || 1500,
  }
}
