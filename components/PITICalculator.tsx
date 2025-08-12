'use client'

import React, { useMemo } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { calculatePITIWithHomeSaleProceeds, validatePropertyData, formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { Calculator, DollarSign, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'

interface PITICalculatorProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
  propertiesCollection?: PropertiesCollection
  calculatorMode: 'investment' | 'homeSale'
}

export default function PITICalculator({ property, onUpdate, propertiesCollection, calculatorMode }: PITICalculatorProps) {
  // Only show for investment mode
  if (calculatorMode !== 'investment') return null
  
  console.log('🔍 PITICalculator render - property:', property)
  console.log('🔍 PITICalculator render - property.activeMode:', property.activeMode)
  console.log('🔍 PITICalculator render - calculatorMode:', calculatorMode)
  
  const validationErrors = useMemo(() => validatePropertyData(property, calculatorMode), [property, calculatorMode])
  const pitiCalculation = useMemo(() => {
    console.log('🧮 Calculating PITI for property:', property)
    const result = calculatePITIWithHomeSaleProceeds(property, propertiesCollection)
    console.log('🧮 PITI calculation result:', result)
    return result
  }, [property, propertiesCollection])
  
  const hasValidInputs = validationErrors.isValid && 
    property.purchasePrice > 0 && 
    property.interestRate > 0
    
  console.log('🔍 PITICalculator - hasValidInputs:', hasValidInputs)
  console.log('🔍 PITICalculator - validationErrors:', validationErrors)
  console.log('🔍 PITICalculator - pitiCalculation:', pitiCalculation)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary-600" />
          PITI Calculator
        </h2>
        <p className="text-gray-600">
          Calculate your monthly mortgage payment including Principal, Interest, Taxes, and Insurance
        </p>
      </div>

      {/* Validation Errors */}
      {!validationErrors.isValid && (
        <div className="card border-l-4 border-warning-500 bg-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning-800">Please fix the following issues:</h3>
              <ul className="mt-2 text-sm text-warning-700 space-y-1">
                {validationErrors.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasValidInputs && pitiCalculation && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monthly Payment Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <div className="text-2xl font-bold text-primary-600">
                  ${formatNumber(pitiCalculation.totalMonthlyPITI)}
                </div>
                <div className="text-sm text-primary-600">Total Monthly PITI</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal & Interest:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.principal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Taxes:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.taxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.insurance)}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <div className="text-lg font-semibold text-gray-700">
                  ${formatNumber(pitiCalculation.totalAnnualPITI)}
                </div>
                <div className="text-sm text-primary-600">Annual PITI</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">{formatCurrency(property.purchasePrice - property.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-medium">{formatCurrency(property.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-medium">{formatPercentage(property.interestRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Validation Warning */}
      {!hasValidInputs && (
        <div className="card border-l-4 border-warning-500 bg-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning-800">Complete Required Fields</h3>
              <p className="text-sm text-warning-700 mt-1">
                Please enter a purchase price and interest rate to see PITI calculations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 