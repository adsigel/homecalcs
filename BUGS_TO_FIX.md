# Bugs to Fix - HomeCalcs

## Priority 1: Critical Calculation Errors 🚨

### 1. HOA Fees Calculation Bug
- **Issue**: HOA fees showing $34,708 instead of $917 in monthly breakdown
- **Impact**: Throws off net cash flow calculations
- **Status**: ✅ FIXED
- **Files to check**: `utils/calculations.ts`, `components/DSCRCalculator.tsx`
- **Root Cause**: Input type was 'dollar' but calculation assumed monthly input, causing ×12 multiplication
- **Fix**: Changed HOA input type from 'dollar'/'percentage' to 'monthly'/'annual' and updated calculation logic

### 2. Calculator Mode Switching Issue
- **Issue**: Cannot view investment properties in home sale mode (and vice versa)
- **Impact**: Defeats the purpose of flexible multi-mode architecture
- **Status**: 🔧 FIX APPLIED - TESTING NEEDED
- **Files to check**: `app/page.tsx`, `components/GlobalInputsPanel.tsx`
- **Root Cause**: In `handleCalculatorModeChange`, `switchCalculatorMode` was called with the old `activeProperty` that didn't have the new mode in `supportedModes`
- **Fix Applied**: 
  1. Updated GlobalInputsPanel to use `calculatorMode` prop instead of `property.activeMode`
  2. Fixed `handleCalculatorModeChange` to use the updated property when switching modes
  3. Added debug display to show state mismatch
- **Status**: Fix applied, needs testing to confirm calculator mode switching works

### 3. Rental Income Discount in Monthly Cash Flow
- **Issue**: Rental income discount was being applied to monthly cash flow display
- **Impact**: Monthly cash flow showed incorrect (lower) amounts than actual rental income
- **Status**: ✅ FIXED
- **Files to check**: `components/DSCRCalculator.tsx`
- **Root Cause**: Monthly cash flow was using `netAnnualRentalIncome` (with discount) instead of `grossAnnualRentalIncome`
- **Fix**: Changed monthly cash flow calculation to use gross rental income (no discount)
- **Note**: DSCR calculation still correctly uses discounted income for ratio calculation

## Priority 2: Functionality Issues ⚠️

### 2. Home Sale Proceeds Down Payment
- **Issue**: Down payment input field not becoming read-only when using home sale proceeds
- **Impact**: Users can still edit down payment when it should be calculated automatically
- **Status**: 📋 TODO
- **Files to check**: `components/GlobalInputsPanel.tsx`

## Priority 3: UI/UX Regressions 🎨

### 3. Input Formatting
- **Issue**: Lost comma separators in input fields
- **Impact**: Harder to read large numbers
- **Status**: 📋 TODO
- **Files to check**: `components/GlobalInputsPanel.tsx`

### 4. Annual/Monthly Toggles
- **Issue**: Lost annual/monthly toggle switches for inputs
- **Impact**: Users can't easily switch between input modes
- **Status**: 📋 TODO
- **Files to check**: `components/GlobalInputsPanel.tsx`

### 5. Dollar/Percentage Toggle Styling
- **Issue**: Lost nice styling on dollar/percentage toggle buttons
- **Impact**: UI looks less polished
- **Status**: 📋 TODO
- **Files to check**: `components/GlobalInputsPanel.tsx`

## Notes
- These regressions occurred during the architectural refactor to flexible multi-mode properties
- Core functionality is working, but UI polish was lost
- Calculation accuracy is the highest priority
- UI improvements can be addressed after core bugs are fixed

## Progress
- [x] Flexible property architecture implemented
- [x] Property switching restored
- [x] Runtime errors fixed
- [x] HOA fees calculation bug fixed
- [x] Rental income discount in monthly cash flow fixed
- [x] Calculator mode switching logic fixed (testing needed)
- [ ] Home sale proceeds down payment fixed
- [ ] Input formatting restored
- [ ] Annual/monthly toggles restored
- [ ] Toggle button styling restored

## Current Checkpoint Status ✅
**Date**: Current session
**Major Fixes Applied**:
1. ✅ HOA fees calculation bug - Fixed input type from 'dollar'/'percentage' to 'monthly'/'annual'
2. ✅ Rental income discount in monthly cash flow - Now uses gross income for cash flow, discounted for DSCR
3. ✅ Calculator mode switching logic - Fixed state management in handleCalculatorModeChange
4. ✅ Removed SampleDataButton causing build errors

**Next Session Priorities**:
1. Test calculator mode switching to confirm fix works
2. Fix home sale proceeds down payment read-only issue
3. Restore input formatting (comma separators)
4. Restore annual/monthly toggles
5. Restore toggle button styling
