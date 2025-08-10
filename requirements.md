# HomeCalcs - Homeowner Calculator Tools

## Project Overview
HomeCalcs is a collection of financial calculator tools designed for homeowners to make informed decisions about their properties. The system is architected to share common inputs across multiple calculators, allowing users to efficiently analyze different financial scenarios.

## Architecture Principles
- **Shared Input Management**: Common inputs (purchase price, market value, mortgage rates, etc.) are stored and can be reused across calculators
- **Modular Calculator Design**: Each calculator is a self-contained module that can access shared inputs
- **Consistent User Experience**: Unified interface for input management and calculator access
- **Extensible Framework**: Easy to add new calculators that leverage existing shared inputs

## Core Calculators

### 1. PITI Calculator
- Calculate monthly mortgage payment (Principal, Interest, Taxes, Insurance)
- Show annual PITI costs
- Include PMI calculations when down payment < 20%
- Generate amortization schedule
- Display total interest paid over loan term

### 2. DSCR Calculator
- Calculate Debt Service Coverage Ratio
- Include rental income analysis
- Factor in vacancy and maintenance reserves
- Show expense breakdown (annual/monthly toggle)
- Calculate cash flow projections
- **Cap Rate Analysis**: Calculate capitalization rate (Net Operating Income / Property Value) to evaluate investment returns relative to property value

### 3. Cap Rate Calculator
- **Primary Metric**: Net Operating Income / Current Market Value
- **NOI Calculation**: Gross rental income minus operating expenses (excluding mortgage payments)
- **Market Comparison**: Compare cap rates across different properties and markets
- **Investment Analysis**: Help determine if a property is overpriced or undervalued
- **Risk Assessment**: Higher cap rates typically indicate higher risk/return profiles

## Shared Inputs Framework
Common inputs that may be reused across calculators:
- Property purchase price
- Current market value
- Mortgage rates (current and original)
- Property taxes
- Insurance costs
- Property details (address, type, year built)

## Technical Requirements
- Web-based interface
- Responsive design for mobile and desktop
- Input validation and error handling
- Data persistence for shared inputs
- Export functionality for calculations
- Print-friendly reports
- **Interactive Tooltips**: Add helpful tooltips throughout the interface to explain financial terms, calculation methods, and industry concepts (e.g., DSCR, Cap Rate, NOI, PMI, 1031 Exchange, etc.)

## Future Calculator Ideas
- Refinance calculator
- Home improvement ROI calculator
- Property tax assessment calculator
- Insurance premium comparison tool
- Rental property cash flow analyzer

## Future Enhancements

### 1. UI/UX Improvements
- **Fix Independent Vertical Scrolling**: Implement proper independent scrolling containers for left (inputs) and right (outputs) panels to improve user experience when dealing with many input fields or extensive calculation results
- **Optimize Mobile View**: Enhance responsive design for mobile devices, including better touch interactions, optimized layouts for small screens, and mobile-specific navigation patterns

### 2. Multi-Property Management
- **Property Portfolio**: Allow users to store and manage multiple properties for comparison and analysis
- **Property Comparison Tool**: Enable side-by-side comparison of different investment properties to evaluate which offers the best financial returns
- **Scenario Analysis**: Compare different financing options, purchase prices, or rental scenarios for the same property

### 3. Home Sale Calculator
**Purpose**: Calculate net proceeds from home sales and analyze tax implications

#### Inputs
- Sale Price (USD)
- Outstanding Mortgage Balance (USD)
- Real Estate Agent Commission (%)
- Closing Costs (USD)
- Original Purchase Price (USD)
- Capital Improvements (USD)
- Tax Filing Status (Single, Married, etc.)

#### Calculations
- Net Sale Proceeds = Sale Price - Outstanding Debt - Commission - Closing Costs
- Capital Gains = Sale Price - Original Purchase Price - Capital Improvements
- Tax Liability (Traditional Sale vs. 1031 Exchange)
- 1031 Exchange Benefits and Requirements

#### Outputs
- Net proceeds breakdown
- Tax implications comparison
- 1031 exchange eligibility and benefits
- Investment property down payment potential

### 4. Enhanced Shared Inputs
- **Home Sale Proceeds Integration**: Use proceeds from home sale calculations as down payment input for new property purchases
- **Cross-Calculator Data Flow**: Seamlessly transfer calculated values between calculators (e.g., PITI from one calculator becomes input for DSCR analysis)
- **Historical Data Tracking**: Store and track changes in property values, mortgage rates, and other inputs over time

### 5. External Data Integration
- **Property Data Import**: Pull home details (price, taxes, property type, year built, etc.) from Redfin or Zillow property links to automatically populate input fields
- **Real-Time Mortgage Rates**: Integrate with third-party market data sources to pull current mortgage rates for different loan terms and credit profiles
- **Market Data Validation**: Compare user-entered values with current market data for property values, rental rates, and expense benchmarks

### 6. Forecasting and Projection Tools
- **Cash Flow Projections**: Multi-year cash flow forecasting with configurable annual rent growth rates (e.g., 2-5% annually) to show how rental income and cash flow evolve over time
- **Property Value Appreciation**: Project future property values based on historical appreciation rates and market trends, including scenarios for different market conditions
- **Mortgage Paydown Analysis**: Show how principal balance decreases over time and how this affects cash flow and equity building
- **Tax Implications Projections**: Forecast tax benefits (depreciation, interest deductions) and potential tax liabilities over the investment horizon
- **Break-Even Analysis**: Calculate how many years until the property becomes cash flow positive, considering rent growth, expense inflation, and mortgage paydown
- **ROI Projections**: Multi-year return on investment calculations including both cash flow returns and equity appreciation
- **Refinance Scenarios**: Model potential refinancing opportunities and their impact on cash flow and overall returns
- **Exit Strategy Modeling**: Project net proceeds from selling the property at different time horizons, including tax implications and potential 1031 exchange benefits
- **Cap Rate Evolution**: Track how cap rates change over time as rental income grows and property values appreciate, helping investors understand when to consider selling or refinancing 