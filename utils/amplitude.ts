import { init, logEvent, setUserId, identify } from '@amplitude/analytics-browser'

// Initialize Amplitude with your project key
export const initAmplitude = () => {
  init('68cf0f4077d1b02f8c024db7a82d5c03')
}

// Track user sign in with Google
export const trackGoogleSignIn = (userId: string, userEmail?: string) => {
  setUserId(userId)
  // Note: User properties can be set later if needed
  logEvent('User Signed In', {
    method: 'Google',
    userId,
    userEmail
  })
}

// Track property addition
export const trackPropertyAdded = (propertyId: string, propertyType: string, calculatorMode: string) => {
  logEvent('Property Added', {
    propertyId,
    propertyType,
    calculatorMode,
    timestamp: new Date().toISOString()
  })
}

// Track input field population
export const trackInputFieldPopulated = (fieldName: string, fieldType: string, propertyId: string, calculatorMode: string) => {
  logEvent('Input Field Populated', {
    fieldName,
    fieldType,
    propertyId,
    calculatorMode,
    timestamp: new Date().toISOString()
  })
}

// Track property toggle/switch
export const trackPropertyToggle = (fromPropertyId: string, toPropertyId: string, calculatorMode: string) => {
  logEvent('Property Toggled', {
    fromPropertyId,
    toPropertyId,
    calculatorMode,
    timestamp: new Date().toISOString()
  })
}

// Track calculator mode toggle
export const trackCalculatorModeToggle = (fromMode: string, toMode: string, propertyId?: string) => {
  logEvent('Calculator Mode Toggled', {
    fromMode,
    toMode,
    propertyId,
    timestamp: new Date().toISOString()
  })
}

// Track 1031 exchange usage
export const track1031ExchangeToggle = (enabled: boolean, propertyId: string, replacementPropertyId?: string) => {
  logEvent('1031 Exchange Toggled', {
    enabled,
    propertyId,
    replacementPropertyId,
    timestamp: new Date().toISOString()
  })
}

// Track home sale proceeds as down payment usage
export const trackHomeSaleProceedsToggle = (enabled: boolean, propertyId: string, sourcePropertyId?: string) => {
  logEvent('Home Sale Proceeds Toggle', {
    enabled,
    propertyId,
    sourcePropertyId,
    timestamp: new Date().toISOString()
  })
}

// Track calculation results
export const trackCalculationCompleted = (calculationType: string, propertyId: string, calculatorMode: string, result: any) => {
  logEvent('Calculation Completed', {
    calculationType,
    propertyId,
    calculatorMode,
    result: JSON.stringify(result),
    timestamp: new Date().toISOString()
  })
}

// Track save button clicks
export const trackSaveButtonClicked = (propertyId: string, calculatorMode: string, hasChanges: boolean) => {
  logEvent('Save Button Clicked', {
    propertyId,
    calculatorMode,
    hasChanges,
    timestamp: new Date().toISOString()
  })
}

// Track timeframe toggle changes (annual/monthly)
export const trackTimeframeToggle = (fieldName: string, fromTimeframe: string, toTimeframe: string, propertyId: string, calculatorMode: string) => {
  logEvent('Timeframe Toggle Changed', {
    fieldName,
    fromTimeframe,
    toTimeframe,
    propertyId,
    calculatorMode,
    timestamp: new Date().toISOString()
  })
}

// Track input type toggle changes ($/%)
export const trackInputTypeToggle = (fieldName: string, fromType: string, toType: string, propertyId: string, calculatorMode: string) => {
  logEvent('Input Type Toggle Changed', {
    fieldName,
    fromType,
    toType,
    propertyId,
    calculatorMode,
    timestamp: new Date().toISOString()
  })
}

// Track Property Manager interactions
export const trackPropertyManagerOpen = (totalProperties: number) => {
  logEvent('Property Manager Opened', {
    totalProperties,
    timestamp: new Date().toISOString()
  })
}

export const trackPropertyManagerClose = (totalProperties: number) => {
  logEvent('Property Manager Closed', {
    totalProperties,
    timestamp: new Date().toISOString()
  })
}

export const trackPropertyLoaded = (propertyId: string, propertyName: string, propertyType: string) => {
  logEvent('Property Loaded', {
    propertyId,
    propertyName,
    propertyType,
    timestamp: new Date().toISOString()
  })
}

export const trackPropertyRenamed = (propertyId: string, oldName: string, newName: string) => {
  logEvent('Property Renamed', {
    propertyId,
    oldName,
    newName,
    timestamp: new Date().toISOString()
  })
}

export const trackPropertyDeleted = (propertyId: string, propertyName: string, propertyType: string, totalPropertiesAfter: number) => {
  logEvent('Property Deleted', {
    propertyId,
    propertyName,
    propertyType,
    totalPropertiesAfter,
    timestamp: new Date().toISOString()
  })
}

// Track empty state interactions
export const trackEmptyStateViewed = () => {
  logEvent('Empty State Viewed', {
    timestamp: new Date().toISOString()
  })
}

export const trackFirstPropertyCreated = (propertyId: string, propertyType: string) => {
  logEvent('First Property Created', {
    propertyId,
    propertyType,
    timestamp: new Date().toISOString()
  })
}
