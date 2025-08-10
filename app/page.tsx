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

export default function HomePage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('piti')
  const [propertyData, setPropertyData] = useState<PropertyData>({
    purchasePrice: 0,
    downPayment: 0,
    interestRate: 0,
    loanTerm: 30,
    annualTaxes: 0,
    annualInsurance: 0,
    marketValue: 0,
    propertyAddress: '',
    propertyType: 'single-family',
    yearBuilt: new Date().getFullYear(),
    taxInputType: 'annual',
    insuranceInputType: 'annual',
    downPaymentInputType: 'dollars',
    // DSCR Calculator defaults
    grossRentalIncome: 0,
    rentalIncomeInputType: 'annual',
    rentalIncomeDiscount: 25,
    propertyManagementFee: 10,
    propertyManagementInputType: 'percentage',
    includePropertyManagement: true,
    maintenanceReserve: 5,
    maintenanceInputType: 'percentage',
    includeMaintenance: true,
    hoaFees: 0,
    hoaInputType: 'annual',
    includeHoaFees: false,
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

  const updatePropertyData = (updates: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...updates }))
  }

  // Calculate PITI for DSCR calculator
  const pitiCalculation = useMemo(() => calculatePITI(propertyData), [propertyData])
  
  // Calculate DSCR if we have rental income
  const dscrCalculation = useMemo(() => {
    if (propertyData.grossRentalIncome > 0 && pitiCalculation.totalMonthlyPITI > 0) {
      const { calculateDSCR } = require('@/utils/calculations')
      return calculateDSCR(propertyData, pitiCalculation)
    }
    return undefined
  }, [propertyData, pitiCalculation])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              HomeCalcs
            </h1>
            <p className="text-xl text-gray-600">
              Financial calculator tools for homeowners
            </p>
          </div>
          <div className="flex-1 flex justify-end gap-2">
            <SampleDataButton onLoadSampleData={setPropertyData} />
            <ExportButton 
              propertyData={propertyData}
              pitiCalculation={pitiCalculation}
              dscrCalculation={dscrCalculation}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        {/* Global Inputs Panel */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-y-auto pr-4">
            <GlobalInputsPanel 
              propertyData={propertyData}
              onUpdate={updatePropertyData}
            />
          </div>
        </div>

        {/* Main Calculator Area */}
        <div className="lg:col-span-2">
          <div className="h-full overflow-y-auto pl-4">
            <CalculatorNavigation 
              activeCalculator={activeCalculator}
              onCalculatorChange={setActiveCalculator}
            />
            
            {activeCalculator === 'piti' && (
              <PITICalculator 
                propertyData={propertyData}
                onUpdate={updatePropertyData}
              />
            )}
            
            {activeCalculator === 'dscr' && (
              <DSCRCalculator 
                propertyData={propertyData}
                onUpdate={updatePropertyData}
                pitiCalculation={pitiCalculation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 