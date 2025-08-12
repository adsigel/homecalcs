import { Property, HomeSaleProperty, InvestmentProperty, PropertiesCollection } from '../types/property'

const STORAGE_KEY = 'homecalcs-properties'

// Create a new home sale property
export function createHomeSaleProperty(name: string, streetAddress: string): HomeSaleProperty {
  return {
    id: generateId(),
    name,
    streetAddress,
    salePrice: 0,
    outstandingMortgageBalance: 0,
    realtorCommission: 5,
    realtorCommissionInputType: 'percentage',
    closingCosts: 0,
    capitalGainsTaxRate: 15,
    originalPurchasePrice: 0,
    use1031Exchange: false,
    selectedReplacementPropertyId: null,
    calculatorMode: 'homeSale'
  }
}

// Create a new investment property
export function createInvestmentProperty(name: string, streetAddress: string): InvestmentProperty {
  return {
    id: generateId(),
    name,
    streetAddress,
    purchasePrice: 0,
    downPayment: 0,
    interestRate: 7,
    loanTerm: 30,
    annualTaxes: 0,
    annualInsurance: 0,
    marketValue: 0,
    propertyType: 'single-family',
    yearBuilt: 2024,
    taxInputType: 'annual',
    insuranceInputType: 'annual',
    downPaymentInputType: 'dollars',
    grossRentalIncome: 0,
    rentalIncomeInputType: 'monthly',
    rentalIncomeDiscount: 0,
    propertyManagementFee: 0,
    propertyManagementInputType: 'percentage',
    includePropertyManagement: false,
    maintenanceReserve: 0,
    maintenanceInputType: 'percentage',
    includeMaintenance: false,
    hoaFees: 0,
    hoaInputType: 'monthly',
    includeHoaFees: false,
    useHomeSaleProceedsAsDownPayment: false,
    selectedHomeSalePropertyId: null,
    calculatorMode: 'investment'
  }
}

// Load properties from localStorage
export function loadProperties(): PropertiesCollection {
  if (typeof window === 'undefined') {
    return { properties: [], activePropertyId: null }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading properties:', error)
  }

  return { properties: [], activePropertyId: null }
}

// Save properties to localStorage
export function saveProperties(properties: PropertiesCollection): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
  } catch (error) {
    console.error('Error saving properties:', error)
  }
}

// Add a new property to the collection
export function addProperty(
  properties: PropertiesCollection,
  property: Property
): PropertiesCollection {
  return {
    properties: [...properties.properties, property],
    activePropertyId: property.id
  }
}

// Update an existing property
export function updateProperty(
  properties: PropertiesCollection,
  updatedProperty: Property
): PropertiesCollection {
  return {
    ...properties,
    properties: properties.properties.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    )
  }
}

// Delete a property
export function deleteProperty(
  properties: PropertiesCollection,
  propertyId: string
): PropertiesCollection {
  const newProperties = properties.properties.filter(p => p.id !== propertyId)
  let newActiveId = properties.activePropertyId
  
  // If we deleted the active property, set active to first available or null
  if (properties.activePropertyId === propertyId) {
    newActiveId = newProperties.length > 0 ? newProperties[0].id : null
  }

  return {
    properties: newProperties,
    activePropertyId: newActiveId
  }
}

// Set active property
export function setActiveProperty(
  properties: PropertiesCollection,
  propertyId: string | null
): PropertiesCollection {
  return {
    ...properties,
    activePropertyId: propertyId
  }
}

// Get active property
export function getActiveProperty(properties: PropertiesCollection): Property | null {
  if (!properties.activePropertyId) return null
  return properties.properties.find(p => p.id === properties.activePropertyId) || null
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
