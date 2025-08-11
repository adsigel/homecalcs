'use client'

import React, { useMemo, useState } from 'react'
import { InvestmentProperty, DSCRCalculation, PITICalculation } from '@/types/property'
import { calculateDSCR, calculateCapRate, formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { Calculator, DollarSign, TrendingUp, AlertTriangle, Building2, Wrench, Home, Calendar, Clock, Percent } from 'lucide-react'

interface DSCRCalculatorProps {
  property: InvestmentProperty
  onUpdate: (updates: Partial<InvestmentProperty>) => void
  pitiCalculation: PITICalculation | undefined
}

export default function DSCRCalculator({ property, onUpdate, pitiCalculation }: DSCRCalculatorProps) {
  const [expenseViewMode, setExpenseViewMode] = useState<'annual' | 'monthly'>('annual')
  
  // Only calculate DSCR if we have valid PITI data
  const dscrCalculation = useMemo(() => {
    if (pitiCalculation && pitiCalculation.totalMonthlyPITI > 0) {
      return calculateDSCR(property, pitiCalculation)
    }
    return undefined
  }, [property, pitiCalculation])
  
  const capRate = useMemo(() => {
    if (pitiCalculation && pitiCalculation.totalMonthlyPITI > 0) {
      return calculateCapRate(property, pitiCalculation)
    }
    return 0
  }, [property, pitiCalculation])

  const hasValidInputs = property.grossRentalIncome > 0 && pitiCalculation?.totalMonthlyPITI && pitiCalculation.totalMonthlyPITI > 0

  // Helper function to convert annual to monthly
  const toMonthly = (annualValue: number) => annualValue / 12
  const toAnnual = (monthlyValue: number) => monthlyValue * 12

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
                  {formatPercentage(capRate * 100)}
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
                  dscrCalculation.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(dscrCalculation.monthlyCashFlow)}
                </div>
                <div className="text-sm text-green-600">Monthly Cash Flow</div>
                <div className="text-xs text-gray-500 mt-1">
                  After all expenses
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Cash Flow:</span>
                <span className={`font-medium ${
                  dscrCalculation.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(dscrCalculation.annualCashFlow)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Annual Expenses:</span>
                <span className="font-medium">{formatCurrency(dscrCalculation.totalExpenses)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Rental Income:</span>
                <span className="font-medium">{formatCurrency(dscrCalculation.grossRentalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Operating Income:</span>
                <span className="font-medium">{formatCurrency(dscrCalculation.grossRentalIncome * (1 - property.rentalIncomeDiscount / 100) - (dscrCalculation.totalExpenses - dscrCalculation.breakdown.piti))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {hasValidInputs && dscrCalculation && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Expense Breakdown
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {expenseViewMode === 'annual' ? 'Annual expenses' : 'Monthly expenses (annual ÷ 12)'}
              </p>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setExpenseViewMode('annual')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  expenseViewMode === 'annual'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Annual
              </button>
              <button
                onClick={() => setExpenseViewMode('monthly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  expenseViewMode === 'monthly'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                Monthly
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">PITI Payments:</span>
              <span className="font-medium">
                {expenseViewMode === 'annual'
                  ? formatCurrency(dscrCalculation.breakdown.piti)
                  : formatCurrency(toMonthly(dscrCalculation.breakdown.piti))
                }
              </span>
            </div>

            {dscrCalculation.breakdown.propertyManagement > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Property Management:</span>
                <span className="font-medium">
                  {expenseViewMode === 'annual'
                    ? formatCurrency(dscrCalculation.breakdown.propertyManagement)
                    : formatCurrency(toMonthly(dscrCalculation.breakdown.propertyManagement))
                  }
                </span>
              </div>
            )}

            {dscrCalculation.breakdown.maintenance > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Maintenance Reserves:</span>
                <span className="font-medium">
                  {expenseViewMode === 'annual'
                    ? formatCurrency(dscrCalculation.breakdown.maintenance)
                    : formatCurrency(toMonthly(dscrCalculation.breakdown.maintenance))
                  }
                </span>
              </div>
            )}

            {dscrCalculation.breakdown.hoaFees > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">HOA Fees:</span>
                <span className="font-medium">
                  {expenseViewMode === 'annual'
                    ? formatCurrency(dscrCalculation.breakdown.hoaFees)
                    : formatCurrency(toMonthly(dscrCalculation.breakdown.hoaFees))
                  }
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 font-semibold text-lg">
              <span className="text-gray-900">
                Total {expenseViewMode === 'annual' ? 'Annual' : 'Monthly'} Expenses:
              </span>
              <span className="text-primary-700">
                {expenseViewMode === 'annual'
                  ? formatCurrency(dscrCalculation.totalExpenses)
                  : formatCurrency(toMonthly(dscrCalculation.totalExpenses))
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DSCR Guidelines */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          DSCR Guidelines
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>DSCR ≥ 1.25:</strong> Excellent - Strong cash flow, easy financing</p>
          <p><strong>DSCR 1.0-1.24:</strong> Acceptable - Positive cash flow, may qualify for financing</p>
          <p><strong>DSCR &lt; 1.0:</strong> Poor - Negative cash flow, unlikely to qualify for financing</p>
        </div>
      </div>

      {/* Cap Rate Guidelines */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Cap Rate Guidelines
        </h3>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Cap Rate &gt; 8%:</strong> High return, typically higher risk properties or emerging markets</p>
          <p><strong>Cap Rate 5-8%:</strong> Moderate return, balanced risk-reward, most common for residential</p>
          <p><strong>Cap Rate &lt; 5%:</strong> Lower return, typically premium properties in established markets</p>
          <p className="text-xs text-green-700 mt-2">
            <strong>Note:</strong> Cap rates vary by location, property type, and market conditions. Compare with local market averages.
          </p>
        </div>
      </div>

      {/* No Input State */}
      {!hasValidInputs && (
        <div className="card text-center py-12">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Rental Property Details</h3>
          <p className="text-gray-600">
            Fill in the rental income and expense details to see your DSCR analysis
          </p>
        </div>
      )}
    </div>
  )
} 