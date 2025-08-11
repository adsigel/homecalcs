'use client'

import React, { useMemo } from 'react'
import { InvestmentProperty, PropertiesCollection } from '@/types/property'
import { calculatePITIWithHomeSaleProceeds, validatePropertyData, formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { Calculator, DollarSign, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'

interface PITICalculatorProps {
  property: InvestmentProperty
  onUpdate: (updates: Partial<InvestmentProperty>) => void
  propertiesCollection?: PropertiesCollection
}

export default function PITICalculator({ property, onUpdate, propertiesCollection }: PITICalculatorProps) {
  const validationErrors = useMemo(() => validatePropertyData(property), [property])
  const pitiCalculation = useMemo(() => calculatePITIWithHomeSaleProceeds(property, propertiesCollection), [property, propertiesCollection])
  
  const hasValidInputs = validationErrors.length === 0 && 
    property.purchasePrice > 0 && 
    property.interestRate > 0

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
      {validationErrors.length > 0 && (
        <div className="card border-l-4 border-warning-500 bg-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning-800">Please fix the following issues:</h3>
              <ul className="mt-2 text-sm text-warning-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasValidInputs && (
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
                  <span className="font-medium">{formatCurrency(pitiCalculation.monthlyPrincipalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Taxes:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.monthlyTaxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.monthlyInsurance)}</span>
                </div>
                {pitiCalculation.requiresPMI && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PMI:</span>
                    <span className="font-medium">{formatCurrency(pitiCalculation.monthlyPMI)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <div className="text-lg font-semibold text-gray-700">
                  ${formatNumber(pitiCalculation.totalMonthlyPITI * 12)}
                </div>
                <div className="text-sm text-primary-600">Annual PITI</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">{formatCurrency(pitiCalculation.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-medium">{formatPercentage(pitiCalculation.downPaymentPercentage)}</span>
                </div>
                {pitiCalculation.requiresPMI && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PMI Required:</span>
                    <span className="font-medium text-warning-600">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PMI Information */}
      {hasValidInputs && pitiCalculation.requiresPMI && (
        <div className="card border-l-4 border-warning-500 bg-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning-800">Private Mortgage Insurance (PMI)</h3>
              <p className="text-sm text-warning-700 mt-1">
                Your down payment of {formatPercentage(pitiCalculation.downPaymentPercentage)} is less than 20%, 
                so PMI is required. This adds {formatCurrency(pitiCalculation.monthlyPMI)} to your monthly payment. 
                PMI can typically be removed once you reach 20% equity in your home.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Input State */}
      {!hasValidInputs && (
        <div className="card text-center py-12">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Property Details</h3>
          <p className="text-gray-600">
            Fill in the property details on the left to see your PITI calculations
          </p>
        </div>
      )}
    </div>
  )
} 