'use client'

import React from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { calculateNetProceeds } from '@/utils/calculations'
import { DollarSign, TrendingUp, Calculator, Home, Receipt, Building2, AlertTriangle } from 'lucide-react'

interface HomeSaleCalculatorProps {
  property: Property
  propertiesCollection?: PropertiesCollection
}

export default function HomeSaleCalculator({ property, propertiesCollection }: HomeSaleCalculatorProps) {
  // Only show for home sale mode
  if (property.activeMode !== 'homeSale') return null
  
  const calculation = calculateNetProceeds(property, propertiesCollection)
  
  if (!calculation) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Home className="w-6 h-6 text-primary-600" />
        Home Sale Calculator
      </h2>

      {/* Results Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6">
        {/* Net Proceeds */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
            <h3 className="font-semibold text-green-800 whitespace-nowrap">Net Proceeds</h3>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-2">
            ${(calculation.netProceeds || 0).toLocaleString()}
          </div>
          <p className="text-sm text-green-700 mt-auto">Cash after all expenses & taxes</p>
        </div>

        {/* Capital Gains Tax */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-red-600 flex-shrink-0" />
            <h3 className="font-semibold text-red-800 whitespace-nowrap">Capital Gains Tax</h3>
          </div>
          <div className="text-2xl font-bold text-red-900 mb-2">
            ${(calculation.capitalGainsTax || 0).toLocaleString()}
          </div>
          <p className="text-sm text-red-700 mt-auto">
            {calculation.use1031Exchange ? 'Tax on boot amount' : 'Tax on property appreciation'}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-blue-800 whitespace-nowrap">Total Expenses</h3>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-2">
            ${(calculation.totalExpenses || 0).toLocaleString()}
          </div>
          <p className="text-sm text-blue-700 mt-auto">Commission, closing costs & fees</p>
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
              <span className="ml-2 font-medium">${(calculation.qiFees || 0).toLocaleString()}</span>
            </div>
            {calculation.boot > 0 && (
              <div>
                <span className="text-blue-700">Boot Amount:</span>
                <span className="ml-2 font-medium text-orange-600">${(calculation.boot || 0).toLocaleString()}</span>
              </div>
            )}
            <div>
              <span className="text-blue-700">Tax Deferral:</span>
              <span className="ml-2 font-medium text-green-600">
                ${((property.salePrice - property.purchasePrice) * (property.capitalGainsTaxRate / 100) - (calculation.capitalGainsTax || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Boot Warning */}
      {calculation.use1031Exchange && (calculation.boot || 0) > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-800">Boot Detected</h3>
              <p className="text-sm text-orange-700 mt-1">
                Your replacement property is worth ${(calculation.boot || 0).toLocaleString()} less than your sale price. 
                This "boot" amount is taxable at your capital gains rate.
              </p>
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
              <span className="font-medium">${(property.salePrice || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Outstanding Mortgage</span>
              <span className="font-medium">-${(property.outstandingMortgageBalance || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Realtor Commission</span>
              <span className="font-medium">-${(calculation.realtorCommission || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Closing Costs</span>
              <span className="font-medium">-${(property.closingCosts || 0).toLocaleString()}</span>
            </div>
            {calculation.use1031Exchange && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">QI Fees</span>
                <span className="font-medium">-${(calculation.qiFees || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Capital Gains Tax</span>
              <span className="font-medium">-${(calculation.capitalGainsTax || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 font-semibold text-lg">
              <span className="text-gray-900">Net Proceeds</span>
              <span className="text-green-600">${(calculation.netProceeds || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tax Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Original Purchase Price</span>
                              <span className="font-medium">${(property.purchasePrice || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Capital Gain</span>
                              <span className="font-medium">${((property.salePrice || 0) - (property.purchasePrice || 0)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Federal Tax Rate</span>
              <span className="font-medium">{property.capitalGainsTaxRate}%</span>
            </div>
            {calculation.use1031Exchange && (calculation.boot || 0) > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Boot Tax</span>
                <span className="font-medium text-orange-600">${(calculation.bootTax || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Tax</span>
              <span className="font-medium text-red-600">${(calculation.capitalGainsTax || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 1031 Exchange Benefits */}
          {calculation.use1031Exchange && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">1031 Exchange Benefits</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Tax deferral on capital gains</p>
                <p>• Reinvest proceeds in like-kind property</p>
                <p>• Maintain investment position</p>
                <p>• Avoid immediate tax liability</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 