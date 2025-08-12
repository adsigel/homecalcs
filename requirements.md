# HomeCalcs - Homeowner Calculator Tools

## Project Overview
HomeCalcs is a collection of financial calculator tools designed for homeowners to make informed decisions about their properties. The system is architected to share common inputs across multiple calculators, allowing users to efficiently analyze different financial scenarios.

## Key Achievements & Current Capabilities ✅

**Status: Production Ready with Advanced Features**

### 🏆 **Core Functionality Delivered:**
- **Multi-Property Management**: Full support for investment and home sale properties with seamless switching
- **Advanced Calculators**: PITI, DSCR, Cap Rate, and Home Sale calculators with professional-grade accuracy
- **1031 Exchange Support**: Complete tax-deferred exchange calculations including boot detection and QI fees
- **Cross-Property Integration**: Use home sale proceeds as down payments for investment properties
- **Smart Property Management**: Auto-save, rename, and manage properties with intuitive interface
- **Cloud Storage**: Firebase Firestore integration for cross-device property access and real-time sync

### 🎯 **Professional Features:**
- **Decimal Precision**: Mortgage rates up to 3 decimals (7.125%), percentages up to 2 decimals (20.5%)
- **Expense Transparency**: All expenses always visible in breakdown, checkboxes control DSCR inclusion
- **Number Formatting**: Consistent comma separators for all dollar amounts (25,000 vs 25000)
- **Performance Optimized**: No infinite loops, smooth property switching, efficient state management
- **Responsive Design**: 2-column layout optimized for desktop and mobile use

### 🔧 **Technical Excellence:**
- **TypeScript**: Full type safety across complex multi-property data structures
- **React Best Practices**: Proper state management, useCallback optimization, controlled components
- **LocalStorage Persistence**: All data saved locally with automatic loading and synchronization
- **Error Handling**: Robust error handling for edge cases and state synchronization
- **Build Stability**: Clean builds with no TypeScript errors or linting issues

### 🚀 **Production Readiness:**
- **Stable Builds**: All builds complete successfully with no compilation errors
- **Performance Optimized**: No memory leaks, infinite loops, or performance bottlenecks
- **User Experience**: Intuitive interface with professional-grade functionality
- **Data Integrity**: Robust property management with proper state synchronization
- **Cross-Browser**: Tested and optimized for modern browsers
- **Mobile Responsive**: Responsive design that works across device sizes

## Architecture Principles
- **Shared Input Management**: Common inputs (purchase price, market value, mortgage rates, etc.) are stored and can be reused across calculators
- **Modular Calculator Design**: Each calculator is a self-contained module that can access shared inputs
- **Consistent User Experience**: Unified interface for input management and calculator access
- **Extensible Framework**: Easy to add new calculators that leverage existing shared inputs
- **Multi-Property Architecture**: Support for managing multiple properties with inter-property dependencies

## Core Calculators

### 1. PITI Calculator ✅
**Status: Implemented and Enhanced**

- Calculate monthly mortgage payment (Principal, Interest, Taxes, Insurance)
- Show annual PITI costs
- Include PMI calculations when down payment < 20%
- ~~Generate amortization schedule~~ (Removed per user feedback)
- Display total interest paid over loan term
- **Enhanced**: Integrates with home sale proceeds for down payment calculations
- **Enhanced**: Supports both investment and home sale property types

### 2. DSCR Calculator ✅
**Status: Implemented and Enhanced**

- Calculate Debt Service Coverage Ratio
- Include rental income analysis
- Factor in vacancy and maintenance reserves
- Show expense breakdown (annual/monthly toggle)
- Calculate cash flow projections
- **Cap Rate Analysis**: Calculate capitalization rate (Net Operating Income / Property Value) to evaluate investment returns relative to property value
- **Enhanced**: Integrates with PITI calculations for accurate debt service calculations
- **Enhanced**: Full expense transparency - all expenses are always shown in breakdown when values exist, regardless of DSCR inclusion settings

### 3. Home Sale Calculator ✅
**Status: Implemented and Enhanced**

**Purpose**: Calculate net proceeds from home sales and analyze tax implications

#### Inputs
- Sale Price (USD)
- Outstanding Mortgage Balance (USD)
- Real Estate Agent Commission (%)
- Closing Costs (USD)
- Original Purchase Price (USD)
- Capital Improvements (USD)
- Tax Filing Status (Single, Married, etc.)
- **Enhanced**: 1031 Exchange toggle and replacement property selection

#### Calculations
- Net Sale Proceeds = Sale Price - Outstanding Debt - Commission - Closing Costs
- Capital Gains = Sale Price - Original Purchase Price - Capital Improvements
- Tax Liability (Traditional Sale vs. 1031 Exchange)
- **Enhanced**: 1031 Exchange calculations with boot detection
- **Enhanced**: Qualified Intermediary (QI) fees ($1,500 flat fee)
- **Enhanced**: Boot calculation when replacement property < sale price

#### Outputs
- Net proceeds breakdown
- Tax implications comparison
- **Enhanced**: 1031 exchange details and tax deferral amounts
- **Enhanced**: Boot warning and tax implications
- Investment property down payment potential

### 4. Cap Rate Calculator ✅
**Status: Implemented (Integrated into DSCR Calculator)**

- **Primary Metric**: Net Operating Income / Current Market Value
- **NOI Calculation**: Gross rental income minus operating expenses (excluding mortgage payments)
- **Market Comparison**: Compare cap rates across different properties and markets
- **Investment Analysis**: Help determine if a property is overpriced or undervalued
- **Risk Assessment**: Higher cap rates typically indicate higher risk/return profiles

## Multi-Property Management System ✅

**Status: Fully Implemented**

### Core Features:
- **Property Types**: Support for both Investment Properties and Home Sale Properties
- **Property Collection**: Manage multiple properties with unique IDs and metadata
- **Active Property Management**: Switch between properties with automatic calculator mode switching
- **Property Persistence**: All properties saved to localStorage with automatic loading
- **Smart Save Logic**: Auto-save properties with existing names/addresses, prompt only for new properties

### Advanced Features:
- **Inter-Property Dependencies**: Use home sale proceeds as down payment for investment properties
- **Property Selection**: Choose specific home sale properties to apply proceeds from (not just sum of all)
- **Calculator Mode Integration**: Automatic switching between investment and home sale calculator modes
- **Property Manager Interface**: Clean, intuitive interface for property creation, switching, and management

### Technical Implementation:
- **State Management**: Centralized state management in page component with controlled child components
- **Performance Optimization**: useCallback and useEffect optimizations to prevent infinite re-renders
- **Type Safety**: Full TypeScript support with proper interfaces for all property types
- **Error Handling**: Robust error handling for property deletion and state synchronization

## Cloud Storage & Cross-Device Sync ✅

**Status: Fully Implemented**

### Core Features:
- **Firebase Firestore Integration**: Secure cloud database for property storage
- **Google Authentication**: Secure, single sign-in across all devices using Google accounts
- **Real-Time Sync**: Properties automatically sync across all devices in real-time
- **Offline Support**: Graceful fallback handling for network connectivity issues
- **Data Persistence**: All properties stored securely in the cloud with automatic backup

### Technical Implementation:
- **Firebase SDK**: Modern Firebase v9+ modular API integration
- **Google Auth Provider**: Secure OAuth 2.0 authentication with Google accounts
- **Cloud Property Manager**: Complete replacement of localStorage with cloud storage functions
- **Error Handling**: Comprehensive error handling for network and authentication issues
- **Performance**: Optimized for minimal latency and maximum reliability
- **Security**: Firebase security rules and Google authentication for data protection

### User Experience:
- **Google Sign-In**: One-click authentication with Google account
- **Cross-Device Sync**: Same user ID across all devices for seamless property access
- **Seamless Migration**: No user action required - properties automatically sync to cloud
- **Cross-Device Access**: Access properties from any device with internet connection
- **Automatic Backup**: All data automatically backed up in Firebase
- **Real-Time Updates**: Changes made on one device immediately appear on others

## Shared Inputs Framework ✅

**Status: Enhanced and Implemented**

Common inputs that may be reused across calculators:
- Property purchase price
- Current market value
- Mortgage rates (current and original)
- Property taxes
- Insurance costs
- Property details (address, type, year built)
- **Enhanced**: Cross-property data flow (home sale proceeds → investment property down payment)

## Technical Requirements ✅

**Status: Implemented**

- Web-based interface
- Responsive design for mobile and desktop
- Input validation and error handling
- Data persistence for shared inputs
- Export functionality for calculations
- Print-friendly reports
- **Interactive Tooltips**: Add helpful tooltips throughout the interface to explain financial terms, calculation methods, and industry concepts (e.g., DSCR, Cap Rate, NOI, PMI, 1031 Exchange, etc.)

## Property Management System ✅

**Status: Enhanced and Integrated**

- **Save Properties**: Users can save current property inputs with custom names
- **Load Properties**: Dropdown selector to load previously saved properties
- **Manage Properties**: Modal interface for viewing, loading, and deleting saved properties
- **localStorage Integration**: All data persists locally in the browser
- **Address Management**: Single address field for property identification
- **Enhanced**: Multi-property architecture with type-specific calculators
- **Enhanced**: Smart save/update logic with visual indicators

### Features:
- Save button opens a dialog to name and save the current property
- Property selector dropdown shows all saved properties for quick switching
- Manage Properties button opens a modal with full property management interface
- Property list displays with load and delete actions for each property
- Property manager positioned near address field for better UX flow
- Automatic property detection when switching between saved properties
- Clean, focused interface that doesn't clutter the main input area
- **New**: Auto-save indicator and Update button for existing properties
- **New**: Property type labels and calculator mode switching

## User Interface Improvements ✅

**Status: Implemented**

- **Layout Optimization**: Changed from 3-column to 2-column layout for better efficiency and input spacing
- **Property Manager Integration**: Combined property manager and calculator results in left column
- **Calculator Inputs**: Dedicated right column for all calculator inputs
- **Modal System**: Fixed modal display issues by moving all modals to page level
- **Responsive Design**: Improved mobile and desktop experience
- **Property Renaming**: Added ability to rename existing properties in the property manager
- **Expense Breakdown Transparency**: All expense input fields are always visible and editable, with clear separation between display (always show) and DSCR calculation inclusion (checkbox controlled)
- **Decimal Precision**: Enhanced percentage inputs to support decimal precision (mortgage rates up to 3 decimals, other percentages up to 2 decimals)
- **Number Formatting**: Consistent comma separators for all dollar amount inputs including rental income for better readability

## Future Calculator Ideas
- Refinance calculator
- Home improvement ROI calculator
- Property tax assessment calculator
- Insurance premium comparison tool
- Rental property cash flow analyzer

## Future Enhancements

### 1. UI/UX Improvements 🔄
**Status: Partially Implemented - Mobile optimization pending**

- **Optimize Mobile View**: Enhance responsive design for mobile devices, including better touch interactions, optimized layouts for small screens, and mobile-specific navigation patterns

### 2. Multi-Property Management ✅
**Status: Completed**

- **Property Portfolio**: Allow users to store and manage multiple properties for comparison and analysis
- **Property Comparison Tool**: Enable side-by-side comparison of different investment properties to evaluate which offers the best financial returns
- **Scenario Analysis**: Compare different financing options, purchase prices, or rental scenarios for the same property

### 3. Home Sale Calculator ✅
**Status: Completed**

All requirements implemented as detailed above.

### 4. Enhanced Shared Inputs ✅
**Status: Completed**

- **Home Sale Proceeds Integration**: Use proceeds from home sale calculations as down payment input for new property purchases
- **Cross-Calculator Data Flow**: Seamlessly transfer calculated values between calculators (e.g., PITI from one calculator becomes input for DSCR analysis)
- **Historical Data Tracking**: Store and track changes in property values, mortgage rates, and other inputs over time
- **1031 Exchange Integration**: Seamlessly integrate home sale proceeds with investment property down payments, including boot calculations and tax deferral analysis

### 5. External Data Integration 🔄
**Status: Deprioritized due to budget constraints**

- **Property Data Import**: Pull home details (price, taxes, property type, year built, etc.) from MLS data sources to automatically populate input fields
- **Real-Time Mortgage Rates**: Integrate with third-party market data sources to pull current mortgage rates for different loan terms and credit profiles
- **Market Data Validation**: Compare user-entered values with current market data for property values, rental rates, and expense benchmarks

### 6. Forecasting and Projection Tools 🔄
**Status: Future consideration**

- **Cash Flow Projections**: Multi-year cash flow forecasting with configurable annual rent growth rates (e.g., 2-5% annually) to show how rental income and cash flow evolve over time
- **Property Value Appreciation**: Project future property values based on historical appreciation rates and market trends, including scenarios for different market conditions
- **Mortgage Paydown Analysis**: Show how principal balance decreases over time and how this affects cash flow and equity building
- **Tax Implications Projections**: Forecast tax benefits (depreciation, interest deductions) and potential tax liabilities over the investment horizon
- **Break-Even Analysis**: Calculate how many years until the property becomes cash flow positive, considering rent growth, expense inflation, and mortgage paydown
- **ROI Projections**: Multi-year return on investment calculations including both cash flow returns and equity appreciation
- **Refinance Scenarios**: Model potential refinancing opportunities and their impact on cash flow and overall returns
- **Exit Strategy Modeling**: Project net proceeds from selling the property at different time horizons, including tax implications and potential 1031 exchange benefits
- **Cap Rate Evolution**: Track how cap rates change over time as rental income grows and property values appreciate, helping investors understand when to consider selling or refinancing

### 7. Storage Improvements ☁️
**Status: Future consideration**

- **Transition from local storage to cloud storage**: Allow users to visit the app across multiple devices and persist their information
- **Migration considerations**: No need to worry about migrating data from local storage to the cloud because there's only one user and I'm fine to reenter data manually at this point

## Project Status Summary

**Phase 1: Core Architecture ✅ COMPLETED**
- Basic calculator framework
- Shared inputs system
- Property management system
- PITI and DSCR calculators

**Phase 2: Multi-Property Architecture ✅ COMPLETED**
- Multi-property management
- Property type system (Investment vs Home Sale)
- Inter-property dependencies
- Calculator mode switching
- Enhanced state management

**Phase 3: User Experience ✅ COMPLETED**
- Layout optimization
- Modal system fixes
- Smart save logic
- Performance optimizations
- UI/UX improvements

**Phase 4: Advanced Features ✅ COMPLETED**
- 1031 Exchange calculator with boot detection
- Qualified Intermediary fee integration
- Cross-property down payment calculations
- Enhanced expense breakdown transparency
- Decimal precision for all percentage inputs
- Consistent number formatting with comma separators

**Phase 5: Polish & Testing ✅ COMPLETED**
- Multi-property scenario testing
- Home sale proceeds integration validation
- Performance optimization and infinite loop prevention
- Edge case handling and error resolution
- User experience refinements

**Phase 6: Google Authentication ✅ COMPLETED**
- Google Sign-In component implementation
- Cross-device user identification
- Secure OAuth 2.0 authentication flow
- Real-time property synchronization across devices

## Next Steps
1. **Google Auth Testing**: Test cross-device synchronization with Google authentication
2. **User Testing**: Gather feedback on the enhanced multi-property functionality
3. **Documentation**: Create user guides for 1031 exchanges and advanced features
4. **Performance Monitoring**: Monitor for any performance issues in production
5. **Future Features**: Begin work on external data integration or forecasting tools
6. **Mobile Optimization**: Enhance responsive design for mobile devices
