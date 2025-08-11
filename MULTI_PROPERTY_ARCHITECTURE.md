# Multi-Property Architecture Implementation

## Overview
This document outlines the implementation plan for transitioning from a single-property calculator to a multi-property system that allows users to manage separate home sale and investment property scenarios, with the ability to use home sale proceeds as down payment for investment properties.

## Test Cases & Requirements

### Test Case 1: Home Sale Property (246 Hampshire St, Cambridge)
**Property Details:**
- Street Address: 246 Hampshire St, Cambridge
- Sale Price: $825,000
- Outstanding Mortgage Balance: $439,200
- Original Purchase Price: $595,000
- Closing Costs: $10,000
- Realtor Commission: 5%
- Capital Gains Tax Rate: 15%
- Expected Net Proceeds: $334,550

**Functionality Requirements:**
- User can manually input all property details
- Calculator shows detailed breakdown of sale costs
- Results include net proceeds calculation
- Property can be saved with a descriptive name

### Test Case 2: Investment Property (190 Shute St, Everett)
**Property Details:**
- Street Address: 190 Shute St, Everett
- Purchase Price: $800,000
- Down Payment: $334,550 (from 246 Hampshire sale proceeds)
- Interest Rate: 7%
- Property Taxes: $0 (for testing purposes)
- Annual Insurance: $3,500
- Monthly Rental Income: $6,375
- Vacancy Discount: 25%
- Property Management: Excluded
- Maintenance Reserve: Excluded
- HOA Fees: Excluded

**Expected Results:**
- DSCR: ~1.4
- Cap Rate: ~6.7%
- Monthly Cash Flow: ~$1,474

**Functionality Requirements:**
- User can manually input all property details
- Calculator shows PITI, DSCR, Cap Rate, and cash flow
- Option to use home sale proceeds as down payment
- Property can be saved with a descriptive name

### Test Case 3: Property Management
**Requirements:**
- Each property can be saved separately
- Each property can be loaded independently
- Properties maintain their individual calculator modes
- Easy switching between saved properties

## Implementation Approach

### Data Structure (Option B: Single Properties Collection)
```typescript
// Individual property interfaces
interface HomeSaleProperty {
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
  calculatorMode: 'homeSale'
}

interface InvestmentProperty {
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
  
  calculatorMode: 'investment'
}

// Union type for all properties
type Property = HomeSaleProperty | InvestmentProperty

// Properties collection stored in localStorage
interface PropertiesCollection {
  properties: Property[]
  activePropertyId: string | null
}
```

### Storage Strategy
- **localStorage Key**: `homecalcs-properties`
- **Structure**: Array of Property objects with active property tracking
- **Migration**: Convert existing `PropertyData` to individual properties

### Component Updates

#### 1. PropertyManager Component
- Display list of saved properties
- Allow saving current property state
- Enable switching between properties
- Show property type indicator (home sale vs investment)

#### 2. Main Page (app/page.tsx)
- Manage active property state
- Handle property switching
- Maintain backward compatibility during transition

#### 3. Calculator Components
- Update to work with individual property types
- Maintain existing calculation logic
- Add property type-specific validation

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Update `types/property.ts` with new interfaces
- [ ] Create migration utility for existing data
- [ ] Update `PropertyManager` component for new structure
- [ ] Test data persistence and loading

### Phase 2: Calculator Integration (Week 2)
- [ ] Update `HomeSaleCalculator` for new data structure
- [ ] Update `PITICalculator` and `DSCRCalculator` for new data structure
- [ ] Test calculations with new property types
- [ ] Verify all test case calculations work correctly

### Phase 3: User Experience (Week 3)
- [ ] Implement property switching UI
- [ ] Add property type indicators
- [ ] Test property save/load functionality
- [ ] Verify test case workflows end-to-end

### Phase 4: Polish & Testing (Week 4)
- [ ] Add property validation
- [ ] Implement error handling
- [ ] Test edge cases and data integrity
- [ ] Performance optimization

## Success Criteria

### Functional Requirements
- [ ] All test case calculations produce expected results
- [ ] Properties can be saved and loaded independently
- [ ] Calculator mode is property-specific
- [ ] No data loss during property switching

### Technical Requirements
- [ ] Clean separation between property types
- [ ] Efficient state management
- [ ] Proper TypeScript typing
- [ ] Maintainable code structure

### User Experience Requirements
- [ ] Intuitive property management
- [ ] Clear property type identification
- [ ] Smooth transitions between properties
- [ ] Consistent UI patterns

## Risk Mitigation

### Data Migration
- Implement automatic migration from existing format
- Preserve user data during transition
- Add rollback capability if issues arise

### Backward Compatibility
- Maintain existing functionality during transition
- Gradual rollout of new features
- Clear user communication about changes

### Testing Strategy
- Unit tests for new data structures
- Integration tests for property switching
- End-to-end tests for test case workflows
- Performance testing for multiple properties

## Future Enhancements

### Phase 5: Advanced Features
- Property combination templates
- Scenario comparison tools
- Enhanced export functionality
- Property sharing capabilities

### Phase 6: Portfolio Management
- Multiple investment properties
- Portfolio-level analysis
- Risk assessment tools
- Investment timeline planning

## Conclusion

This implementation plan provides a clear path to transition from the current single-property architecture to a robust multi-property system. By focusing on specific test cases and implementing incrementally, we can ensure a smooth transition while maintaining application stability and user experience quality.

The new architecture will better serve real-world use cases where users need to manage separate home sale and investment scenarios, with the flexibility to use proceeds from one transaction to fund another. 