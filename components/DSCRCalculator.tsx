'use client'

import React, { useMemo, useState } from 'react'
import { Property } from '@/types/property'
import { calculateDSCR, calculateCapRate, formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { Calculator, DollarSign, TrendingUp, AlertTriangle, Building2, Wrench, Home, Calendar, Clock, Percent } from 'lucide-react'

interface DSCRCalculatorProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
  calculatorMode: 'investment' | 'homeSale'
}

export default function DSCRCalculator({ property, onUpdate, calculatorMode }: DSCRCalculatorProps) {
  // Only show for investment mode
  if (calculatorMode !== 'investment') return null
  
  console.log('🔍 DSCRCalculator render - property:', property)
  console.log('🔍 DSCRCalculator render - property.activeMode:', property.activeMode)
  console.log('🔍 DSCRCalculator render - calculatorMode:', calculatorMode)
  
  const [expenseViewMode, setExpenseViewMode] = useState<'annual' | 'monthly'>('annual')
  
  // Calculate PITI internally for DSCR calculations
  const pitiCalculation = useMemo(() => {
    console.log('🧮 DSCR - Calculating PITI for property:', property)
    // Import and use the calculation function directly
    const { calculatePITIWithHomeSaleProceeds } = require('@/utils/calculations')
    const result = calculatePITIWithHomeSaleProceeds(property, undefined)
    console.log('🧮 DSCR - PITI calculation result:', result)
    return result
  }, [property])
  
  // Only calculate DSCR if we have valid PITI data
  const dscrCalculation = useMemo(() => {
    console.log('🧮 DSCR - Calculating DSCR with PITI:', pitiCalculation)
    if (pitiCalculation && pitiCalculation.totalMonthlyPITI > 0) {
      const result = calculateDSCR(property, pitiCalculation)
      console.log('🧮 DSCR - DSCR calculation result:', result)
      return result
    }
    console.log('🧮 DSCR - No valid PITI data for DSCR calculation')
    return undefined
  }, [property, pitiCalculation])
  
  const capRate = useMemo(() => {
    if (pitiCalculation && pitiCalculation.totalMonthlyPITI > 0) {
      return calculateCapRate(property)
    }
    return null
  }, [property, pitiCalculation])

  const hasValidInputs = property.grossRentalIncome > 0 && pitiCalculation?.totalMonthlyPITI && pitiCalculation.totalMonthlyPITI > 0
  
  console.log('🔍 DSCRCalculator - hasValidInputs:', hasValidInputs)
  console.log('🔍 DSCRCalculator - pitiCalculation:', pitiCalculation)
  console.log('🔍 DSCRCalculator - dscrCalculation:', dscrCalculation)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary-600" />
          DSCR Calculator
        </h2>
        <p className="text-gray-600">
          Calculate Debt Service Coverage Ratio and Cap Rate to evaluate rental property investment potential
        </p>
      </div>

      {/* Results Summary */}
      {hasValidInputs && dscrCalculation && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Investment Analysis Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DSCR Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <div className="text-2xl font-bold text-primary-600">
                  {formatNumber(dscrCalculation.dscrRatio)}
                </div>
                <div className="text-sm text-primary-600">DSCR Ratio</div>
                <div className={`text-xs mt-1 ${
                  dscrCalculation.dscrRatio >= 1.25 ? 'text-green-600' :
                  dscrCalculation.dscrRatio >= 1.0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dscrCalculation.dscrRatio >= 1.25 ? 'Excellent' :
                   dscrCalculation.dscrRatio >= 1.0 ? 'Acceptable' : 'Poor'}
                </div>
              </div>
            </div>

            {/* Cap Rate Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {capRate ? formatPercentage(capRate.capRate) : '0%'}
                </div>
                <div className="text-sm text-blue-600">Cap Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  NOI ÷ Property Value
                </div>
              </div>
            </div>

            {/* Cash Flow Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className={`text-lg font-semibold ${
                  (dscrCalculation.grossAnnualRentalIncome - dscrCalculation.dscrExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency((dscrCalculation.grossAnnualRentalIncome - dscrCalculation.dscrExpenses) / 12)}
                </div>
                <div className="text-sm text-green-600">Monthly Cash Flow</div>
                <div className="text-xs text-gray-500 mt-1">
                  Net Income - Expenses
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
                Please enter rental income and complete PITI calculations to see DSCR analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {hasValidInputs && dscrCalculation && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setExpenseViewMode('annual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  expenseViewMode === 'annual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setExpenseViewMode('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  expenseViewMode === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* PITI Expenses */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                PITI Expenses
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal & Interest:</span>
                  <span className="font-medium">
                    {expenseViewMode === 'annual' 
                      ? formatCurrency(dscrCalculation.annualPITI)
                      : formatCurrency(dscrCalculation.annualPITI / 12)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Taxes:</span>
                  <span className="font-medium">
                    {expenseViewMode === 'annual' 
                      ? formatCurrency(property.annualTaxes)
                      : formatCurrency(property.annualTaxes / 12)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium">
                    {expenseViewMode === 'annual' 
                      ? formatCurrency(property.annualInsurance)
                      : formatCurrency(property.annualInsurance / 12)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary-600" />
                Operating Expenses
              </h4>
              <div className="space-y-3">
                {/* Property Management */}
                {dscrCalculation.annualExpenses.propertyManagement > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Property Management</span>
                      <div className={`w-3 h-3 rounded-full ${
                        property.includePropertyManagement ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={property.includePropertyManagement ? 'Included in DSCR' : 'Not included in DSCR'}></div>
                    </div>
                    <span className="font-medium">
                      {expenseViewMode === 'annual' 
                        ? formatCurrency(dscrCalculation.annualExpenses.propertyManagement)
                        : formatCurrency(dscrCalculation.annualExpenses.propertyManagement / 12)
                      }
                    </span>
                  </div>
                )}

                {/* Maintenance */}
                {dscrCalculation.annualExpenses.maintenance > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Maintenance Reserve</span>
                      <div className={`w-3 h-3 rounded-full ${
                        property.includeMaintenance ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={property.includeMaintenance ? 'Included in DSCR' : 'Not included in DSCR'}></div>
                    </div>
                    <span className="font-medium">
                      {expenseViewMode === 'annual' 
                        ? formatCurrency(dscrCalculation.annualExpenses.maintenance)
                        : formatCurrency(dscrCalculation.annualExpenses.maintenance / 12)
                      }
                    </span>
                  </div>
                )}

                {/* HOA Fees */}
                {dscrCalculation.annualExpenses.hoaFees > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">HOA Fees</span>
                      <div className={`w-3 h-3 rounded-full ${
                        property.includeHoaFees ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={property.includeHoaFees ? 'Included in DSCR' : 'Not included in DSCR'}></div>
                    </div>
                    <span className="font-medium">
                      {expenseViewMode === 'annual' 
                        ? formatCurrency(dscrCalculation.annualExpenses.hoaFees)
                        : formatCurrency(dscrCalculation.annualExpenses.hoaFees / 12)
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total DSCR Expenses */}
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-primary-900">Total DSCR Expenses:</span>
                <span className="text-lg font-semibold text-primary-900">
                  {expenseViewMode === 'annual' 
                    ? formatCurrency(dscrCalculation.dscrExpenses)
                    : formatCurrency(dscrCalculation.dscrExpenses / 12)
                  }
                </span>
              </div>
              <p className="text-xs text-primary-700 mt-1">
                Only expenses with checked boxes are included in DSCR calculation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
