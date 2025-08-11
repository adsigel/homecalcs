'use client'

import React from 'react'
import { HomeSaleProperty, PropertiesCollection } from '@/types/property'
import { calculateNetProceeds } from '@/utils/calculations'
import { DollarSign, TrendingUp, Calculator, Home, Receipt, Building2, AlertTriangle } from 'lucide-react'

interface HomeSaleCalculatorProps {
  property: HomeSaleProperty
  propertiesCollection?: PropertiesCollection
}

export default function HomeSaleCalculator({ property, propertiesCollection }: HomeSaleCalculatorProps) {
  const calculation = calculateNetProceeds(property, propertiesCollection)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Home className="w-6 h-6 text-primary-600" />
        Home Sale Calculator
      </h2>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Net Proceeds */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Net Proceeds</h3>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${calculation.netProceeds.toLocaleString()}
          </div>
          <p className="text-sm text-green-700">Cash after all expenses & taxes</p>
        </div>

        {/* Capital Gains Tax */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Capital Gains Tax</h3>
          </div>
          <div className="text-2xl font-bold text-red-900">
            ${calculation.capitalGainsTax.toLocaleString()}
          </div>
          <p className="text-sm text-red-700">
            {calculation.use1031Exchange ? 'Tax on boot amount' : 'Tax on property appreciation'}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Total Expenses</h3>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${calculation.totalExpenses.toLocaleString()}
          </div>
          <p className="text-sm text-blue-700">Commission, closing costs & fees</p>
        </div>
      </div>

      {/* 1031 Exchange Information */}
      {calculation.use1031Exchange && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            1031 Exchange Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">QI Fees:</span>
              <span className="ml-2 font-medium">${calculation.qiFees.toLocaleString()}</span>
            </div>
            {calculation.boot > 0 && (
              <div>
                <span className="text-blue-700">Boot Amount:</span>
                <span className="ml-2 font-medium text-orange-600">${calculation.boot.toLocaleString()}</span>
              </div>
            )}
            <div>
              <span className="text-blue-700">Tax Deferral:</span>
              <span className="ml-2 font-medium text-green-600">
                ${((property.salePrice - property.originalPurchasePrice) * (property.capitalGainsTaxRate / 100) - calculation.capitalGainsTax).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Sale Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sale Price</span>
              <span className="font-medium">${property.salePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Outstanding Mortgage</span>
              <span className="font-medium text-red-600">-${property.outstandingMortgageBalance.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Realtor Commission</span>
              <span className="font-medium text-red-600">
                -${(property.realtorCommissionInputType === 'percentage' 
                  ? (property.salePrice * property.realtorCommission) / 100
                  : property.realtorCommission).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Closing Costs</span>
              <span className="font-medium text-red-600">-${property.closingCosts.toLocaleString()}</span>
            </div>

            {calculation.use1031Exchange && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">QI Fees (1031 Exchange)</span>
                <span className="font-medium text-red-600">-${calculation.qiFees.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Capital Gains Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Original Purchase Price</span>
              <span className="font-medium">${property.originalPurchasePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Adjusted Basis</span>
              <span className="font-medium">${property.originalPurchasePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Capital Gain</span>
              <span className="font-medium text-green-600">
                ${(property.salePrice - property.originalPurchasePrice).toLocaleString()}
              </span>
            </div>

            {/* Boot Warning */}
            {calculation.use1031Exchange && calculation.boot > 0 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Boot Detected</p>
                    <p className="mt-1">
                      Your replacement property purchase price (${property.selectedReplacementPropertyId ? 
                        (propertiesCollection?.properties.find(p => p.id === property.selectedReplacementPropertyId) as any)?.purchasePrice?.toLocaleString() || '0' : 
                        '0'}) is lower than your sale price. 
                      The difference of ${calculation.boot.toLocaleString()} is subject to immediate capital gains tax.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Net Proceeds Calculation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Net Proceeds Calculation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sale Price</span>
            <span>${property.salePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- Outstanding Mortgage</span>
            <span>-${property.outstandingMortgageBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- Total Expenses</span>
            <span>-${calculation.totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- Capital Gains Tax</span>
            <span>-${calculation.capitalGainsTax.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 font-semibold">
            <div className="flex justify-between">
              <span>= Net Proceeds</span>
              <span>${calculation.netProceeds.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 