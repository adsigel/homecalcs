# Multi-Property Architecture Proposal

## Current State & Issues

### Current Architecture
The application currently uses a single `PropertyData` interface that combines both home sale and investment property data:

```typescript
interface PropertyData {
  // Investment Property fields
  purchasePrice: number
  downPayment: number
  interestRate: number
  // ... other investment fields
  
  // Home Sale fields  
  salePrice: number
  outstandingMortgageBalance: number
  originalPurchasePrice: number
  // ... other home sale fields
  
  // Shared fields
  calculatorMode: 'investment' | 'homeSale'
  useHomeSaleProceedsAsDownPayment: boolean
}
```

### Problems with Current Approach

1. **Data Mixing**: Home sale and investment property data are mixed in one object, making it confusing
2. **Calculator Mode Dependency**: The app switches between "modes" but the underlying data structure doesn't reflect real-world scenarios
3. **Workflow Confusion**: Users expect to work with two separate properties (selling one, buying another)
4. **Data Persistence**: Saving/loading properties becomes complex when data is mixed
5. **Validation Complexity**: Validation rules differ between property types but are applied to the same object
6. **Export Issues**: Exporting data doesn't clearly separate the two properties

## Proposed Architecture

### New Data Structure

```typescript
// Separate interfaces for each property type
interface HomeSaleProperty {
  id: string
  name: string // e.g., "Current Home - 246 Hampshire St"
  streetAddress: string
  salePrice: number
  outstandingMortgageBalance: number
  realtorCommission: number
  realtorCommissionInputType: 'dollars' | 'percentage'
  closingCosts: number
  capitalGainsTaxRate: number
  originalPurchasePrice: number
  originalPurchaseDate?: Date
  improvements?: number // capital improvements for tax basis
  estimatedSaleDate?: Date
}

interface InvestmentProperty {
  id: string
  name: string // e.g., "Investment Property - 123 Main St"
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
  
  // Tax and insurance input types
  taxInputType: 'annual' | 'monthly'
  insuranceInputType: 'annual' | 'monthly'
  downPaymentInputType: 'dollars' | 'percentage'
}

// Combined data structure for the application
interface CombinedPropertyData {
  id: string
  name: string // e.g., "Home Sale + Investment Purchase"
  createdAt: Date
  updatedAt: Date
  
  // The two properties
  homeSaleProperty: HomeSaleProperty | null
  investmentProperty: InvestmentProperty | null
  
  // Cross-property logic
  useHomeSaleProceedsAsDownPayment: boolean
  customDownPaymentAmount?: number // if not using full proceeds
  
  // Application state
  currentView: 'homeSale' | 'investment' | 'summary' | 'comparison'
  
  // Calculated results
  homeSaleResults?: HomeSaleCalculation
  investmentResults?: InvestmentCalculation
  combinedResults?: CombinedCalculation
}

// Calculation result interfaces
interface HomeSaleCalculation {
  netProceeds: number
  capitalGainsTax: number
  totalExpenses: number
  mortgagePayoff: number
  estimatedClosingDate: Date
}

interface InvestmentCalculation {
  piti: PITICalculation
  dscr: DSCRCalculation
  capRate: number
  cashFlow: CashFlowAnalysis
}

interface CombinedCalculation {
  effectiveDownPayment: number
  remainingProceeds: number
  totalInvestment: number
  roi: number
  breakEvenAnalysis: BreakEvenAnalysis
}
```

### Component Structure

```
components/
├── PropertyManager/
│   ├── PropertyList.tsx          # List of saved property combinations
│   ├── PropertyCard.tsx          # Individual property combination card
│   ├── SavePropertyDialog.tsx    # Save current combination
│   └── LoadPropertyDialog.tsx    # Load saved combination
├── HomeSaleCalculator/
│   ├── HomeSaleForm.tsx          # Form for home sale property
│   ├── HomeSaleResults.tsx       # Results display
│   └── HomeSaleSummary.tsx       # Summary card
├── InvestmentCalculator/
│   ├── InvestmentForm.tsx        # Form for investment property
│   ├── InvestmentResults.tsx     # Results display
│   └── InvestmentSummary.tsx     # Summary card
├── CombinedView/
│   ├── CombinedSummary.tsx       # Overall summary
│   ├── ProceedsFlow.tsx          # Visual flow of proceeds
│   ├── ComparisonTable.tsx       # Side-by-side comparison
│   └── ExportCombined.tsx        # Export both properties
└── Navigation/
    ├── PropertyTabs.tsx          # Tab navigation between properties
    └── ViewSelector.tsx          # Switch between different views
```

### User Experience Flow

1. **Property Setup**
   - User creates a new property combination
   - Names the combination (e.g., "Selling Hampshire St, Buying Main St")
   - Can work on either property independently

2. **Home Sale Property**
   - Fill out current home details
   - Calculate net proceeds
   - See detailed breakdown of costs and taxes

3. **Investment Property**
   - Fill out new property details
   - Option to use home sale proceeds as down payment
   - Calculate PITI, DSCR, Cap Rate
   - See cash flow analysis

4. **Combined Analysis**
   - View how proceeds flow from sale to purchase
   - See combined ROI and investment metrics
   - Compare different scenarios

5. **Save & Export**
   - Save the entire combination
   - Export comprehensive reports
   - Share with advisors

## Implementation Plan

### Phase 1: Data Structure & Types
- [ ] Create new interfaces in `types/property.ts`
- [ ] Update existing calculation functions to work with new types
- [ ] Create migration utilities for existing data

### Phase 2: Core Components
- [ ] Refactor `PropertyManager` to handle property combinations
- [ ] Create separate `HomeSaleCalculator` and `InvestmentCalculator` components
- [ ] Implement `CombinedView` component

### Phase 3: State Management
- [ ] Update main page to use `CombinedPropertyData`
- [ ] Implement proper state management for two properties
- [ ] Add validation for property combinations

### Phase 4: Enhanced Features
- [ ] Add property combination templates
- [ ] Implement scenario comparison
- [ ] Enhanced export functionality
- [ ] Property combination sharing

### Phase 5: Advanced Features
- [ ] Timeline planning (sale date vs. purchase date)
- [ ] Tax optimization scenarios
- [ ] Multiple investment properties
- [ ] Portfolio analysis

## Benefits of New Architecture

### For Users
1. **Clearer Workflow**: Separate properties make the process intuitive
2. **Better Data Organization**: Each property has its own dedicated form
3. **Enhanced Analysis**: Combined calculations provide better insights
4. **Easier Comparison**: Can compare different property combinations
5. **Better Export**: Clear separation in reports and exports

### For Developers
1. **Cleaner Code**: Separation of concerns
2. **Easier Testing**: Test each property type independently
3. **Better Maintainability**: Clear interfaces and responsibilities
4. **Extensibility**: Easy to add new property types or features
5. **Type Safety**: Better TypeScript support

### For Business Logic
1. **Realistic Scenarios**: Matches actual user workflows
2. **Better Calculations**: Can optimize across both properties
3. **Enhanced Validation**: Property-specific validation rules
4. **Future Growth**: Easy to add commercial properties, etc.

## Migration Strategy

### Data Migration
1. **Automatic Migration**: Convert existing `PropertyData` to `CombinedPropertyData`
2. **Backward Compatibility**: Maintain support for old format during transition
3. **User Notification**: Inform users about new features and data structure

### Component Migration
1. **Gradual Rollout**: Implement new components alongside existing ones
2. **Feature Flags**: Allow users to opt into new interface
3. **Fallback Support**: Ensure old functionality continues to work

### User Education
1. **Tutorial**: Walk users through new workflow
2. **Documentation**: Clear guides for new features
3. **Support**: Help users migrate existing data

## Technical Considerations

### Performance
- Lazy load property data
- Memoize calculations
- Efficient state updates

### Storage
- Local storage for property combinations
- Export/import functionality
- Cloud sync (future consideration)

### Accessibility
- Clear navigation between properties
- Consistent form patterns
- Screen reader support

### Mobile Support
- Responsive design for all components
- Touch-friendly interfaces
- Mobile-optimized workflows

## Conclusion

The proposed multi-property architecture addresses the fundamental mismatch between the current single-property data model and the real-world scenario of selling one property to buy another. This new approach will provide users with a more intuitive, powerful, and realistic tool for their property investment decisions.

The implementation can be done incrementally, ensuring that existing functionality continues to work while new features are added. The result will be a more professional, user-friendly application that better serves the needs of real estate investors and home buyers. 