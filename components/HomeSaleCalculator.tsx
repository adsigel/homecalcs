'use client'

import React from 'react'
import { PropertyData } from '@/types/property'
import { calculateNetProceeds } from '@/utils/calculations'
import { DollarSign, TrendingUp, Calculator, Home } from 'lucide-react'

interface HomeSaleCalculatorProps {
  propertyData: PropertyData
}

export default function HomeSaleCalculator({ propertyData }: HomeSaleCalculatorProps) {
  const calculation = calculateNetProceeds(propertyData)

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
          <p className="text-sm text-red-700">Tax on property appreciation</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Total Expenses</h3>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${calculation.totalExpenses.toLocaleString()}
          </div>
          <p className="text-sm text-blue-700">Realtor fees + closing costs</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sale Price</span>
              <span className="font-medium">${propertyData.salePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Outstanding Mortgage</span>
              <span className="font-medium text-red-600">-${propertyData.outstandingMortgageBalance.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Realtor Commission</span>
              <span className="font-medium text-red-600">
                -${(propertyData.realtorCommissionInputType === 'percentage' 
                  ? (propertyData.salePrice * propertyData.realtorCommission) / 100
                  : propertyData.realtorCommission).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Closing Costs</span>
              <span className="font-medium text-red-600">-${propertyData.closingCosts.toLocaleString()}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Original Purchase Price</span>
              <span className="font-medium">${propertyData.originalPurchasePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Adjusted Basis</span>
              <span className="font-medium">${propertyData.originalPurchasePrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Capital Gain</span>
              <span className="font-medium text-green-600">
                ${(propertyData.salePrice - propertyData.originalPurchasePrice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Net Proceeds Calculation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Net Proceeds Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sale Price</span>
              <span>${propertyData.salePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>- Outstanding Mortgage</span>
              <span>-${propertyData.outstandingMortgageBalance.toLocaleString()}</span>
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
    </div>
  )
} 