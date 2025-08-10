'use client'

import React, { useState, useEffect, useMemo } from 'react'
import GlobalInputsPanel from '@/components/GlobalInputsPanel'
import PITICalculator from '@/components/PITICalculator'
import DSCRCalculator from '@/components/DSCRCalculator'
import CalculatorNavigation, { CalculatorType } from '@/components/CalculatorNavigation'
import ExportButton from '@/components/ExportButton'
import SampleDataButton from '@/components/SampleDataButton'
import { PropertyData, PITICalculation } from '@/types/property'
import { calculatePITI } from '@/utils/calculations'
import HomeSaleCalculator from '@/components/HomeSaleCalculator'

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    purchasePrice: 0,
    downPayment: 0,
    interestRate: 0,
    loanTerm: 30,
    annualTaxes: 0,
    annualInsurance: 0,
    marketValue: 0,
    streetAddress: '',
    propertyType: 'single-family',
    yearBuilt: 0,
    taxInputType: 'annual',
    insuranceInputType: 'annual',
    downPaymentInputType: 'dollars',
    // DSCR Calculator inputs
    grossRentalIncome: 0,
    rentalIncomeInputType: 'annual',
    rentalIncomeDiscount: 0,
    propertyManagementFee: 0,
    propertyManagementInputType: 'percentage',
    includePropertyManagement: true,
    maintenanceReserve: 0,
    maintenanceInputType: 'percentage',
    includeMaintenance: true,
    hoaFees: 0,
    hoaInputType: 'annual',
    includeHoaFees: false,
    // Home Sale Calculator inputs
    salePrice: 0,
    outstandingMortgageBalance: 0,
    realtorCommission: 6,
    realtorCommissionInputType: 'percentage',
    closingCosts: 0,
    capitalGainsTaxRate: 15,
    originalPurchasePrice: 0,
    // Calculator mode
    calculatorMode: 'investment',
    // Use home sale proceeds as down payment
    useHomeSaleProceedsAsDownPayment: false,
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('homecalcs-property-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setPropertyData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading saved property data:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('homecalcs-property-data', JSON.stringify(propertyData))
  }, [propertyData])

  const handleUpdate = (updates: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...updates }))
  }

  const loadProperty = (property: PropertyData) => {
    setPropertyData(property)
  }

  // Calculate PITI for DSCR calculator
  const pitiCalculation = useMemo(() => {
    const calculation = calculatePITI(propertyData)
    // Only return valid PITI calculation if we have meaningful values
    if (calculation.totalMonthlyPITI > 0 && propertyData.purchasePrice > 0) {
      return calculation
    }
    return undefined
  }, [propertyData])
  
  // Calculate DSCR if we have rental income
  const dscrCalculation = useMemo(() => {
    if (propertyData.grossRentalIncome > 0 && pitiCalculation?.totalMonthlyPITI && pitiCalculation.totalMonthlyPITI > 0) {
      const { calculateDSCR } = require('@/utils/calculations')
      return calculateDSCR(propertyData, pitiCalculation)
    }
    return undefined
  }, [propertyData, pitiCalculation])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HomeCalcs</h1>
          <p className="text-lg text-gray-600">Real Estate Investment & Home Sale Calculator</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <GlobalInputsPanel
              propertyData={propertyData}
              onUpdate={handleUpdate}
              onLoadProperty={loadProperty}
            />
          </div>

          {/* Right Panel - Outputs */}
          <div className="space-y-6">
            {propertyData.calculatorMode === 'homeSale' ? (
              <HomeSaleCalculator propertyData={propertyData} />
            ) : (
              <>
                <PITICalculator 
                  propertyData={propertyData} 
                  onUpdate={handleUpdate}
                />
                <DSCRCalculator 
                  propertyData={propertyData} 
                  onUpdate={handleUpdate}
                  pitiCalculation={pitiCalculation}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 