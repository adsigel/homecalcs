'use client'

import React from 'react'
import { PropertyData } from '@/types/property'
import { Home, DollarSign, MapPin, Building2, Calendar, TrendingUp, Wrench, Calculator } from 'lucide-react'
import { formatNumber, calculateNetProceeds } from '@/utils/calculations'
import PropertyManager from './PropertyManager'

interface GlobalInputsPanelProps {
  propertyData: PropertyData
  onUpdate: (updates: Partial<PropertyData>) => void
  onLoadProperty: (property: PropertyData) => void
}

export default function GlobalInputsPanel({ propertyData, onUpdate, onLoadProperty }: GlobalInputsPanelProps) {
  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    onUpdate({ [field]: numValue })
  }

  const handleTextChange = (field: keyof PropertyData, value: string) => {
    onUpdate({ [field]: value })
  }

  const handleToggle = (field: keyof PropertyData, value: boolean) => {
    onUpdate({ [field]: value })
  }

  const handleSelectChange = (field: keyof PropertyData, value: string) => {
    onUpdate({ [field]: value })
  }

  const handleModeChange = (mode: 'investment' | 'homeSale') => {
    onUpdate({ calculatorMode: mode })
  }

  // Calculate home sale proceeds for down payment
  const getHomeSaleProceeds = () => {
    // Check if we have valid home sale data (regardless of current calculator mode)
    if (propertyData.salePrice > 0 && propertyData.originalPurchasePrice > 0) {
      const calculation = calculateNetProceeds(propertyData)
      return calculation.netProceeds
    }
    return 0
  }

  // Check if home sale proceeds are available
  const hasHomeSaleProceeds = () => {
    return getHomeSaleProceeds() > 0
  }

  // Get the effective down payment value
  const getEffectiveDownPayment = () => {
    if (propertyData.useHomeSaleProceedsAsDownPayment) {
      const proceeds = getHomeSaleProceeds()
      if (proceeds > 0) {
        return proceeds
      }
    }
    return propertyData.downPayment
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
      {/* Calculator Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Calculator Mode
        </label>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('investment')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              propertyData.calculatorMode === 'investment'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Investment Property
          </button>
          <button
            onClick={() => handleModeChange('homeSale')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              propertyData.calculatorMode === 'homeSale'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="w-4 h-4" />
            Home Sale
          </button>
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
          
          {/* Address */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Property Address
            </label>
            <input
              type="text"
              value={propertyData.streetAddress}
              onChange={(e) => onUpdate({ streetAddress: e.target.value })}
              placeholder="Enter property address"
              className="input-field w-full"
            />
          </div>

          {/* Property Manager - moved up for better UX flow */}
          <div className="pt-4 border-t border-gray-200">
            <PropertyManager
              propertyData={propertyData}
              onLoadProperty={onLoadProperty}
              onUpdate={onUpdate}
            />
          </div>
        </div>

        {/* Investment Property Inputs */}
        {propertyData.calculatorMode === 'investment' && (
          <>
            {/* Purchase Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Purchase Details
              </h3>
              
              {/* Home Sale Proceeds Toggle */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propertyData.useHomeSaleProceedsAsDownPayment}
                    onChange={(e) => handleToggle('useHomeSaleProceedsAsDownPayment', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-blue-800">
                    Use Home Sale Proceeds as Down Payment
                  </span>
                </label>
                {propertyData.useHomeSaleProceedsAsDownPayment && (
                  <div className="mt-2 ml-6">
                    {hasHomeSaleProceeds() ? (
                      <p className="text-xs text-blue-600">
                        Down payment will be automatically set to ${getHomeSaleProceeds().toLocaleString()} from home sale proceeds
                      </p>
                    ) : (
                      <div className="text-xs text-amber-600">
                        <p>To use home sale proceeds as down payment, you need:</p>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          {propertyData.salePrice <= 0 && <li>Sale price of your current home</li>}
                          {propertyData.originalPurchasePrice <= 0 && <li>Original purchase price</li>}
                          {propertyData.outstandingMortgageBalance <= 0 && <li>Outstanding mortgage balance</li>}
                        </ul>
                        <p className="mt-1">Fill out the Home Sale calculator first, then return here.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Property Type
                  </label>
                  <select
                    value={propertyData.propertyType}
                    onChange={(e) => handleTextChange('propertyType', e.target.value)}
                    className="input-field"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                  </select>
                </div>

                {/* Year Built */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year Built
                  </label>
                  <input
                    type="number"
                    value={propertyData.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                    min="1800"
                    max={new Date().getFullYear() + 1}
                    className="input-field"
                  />
                </div>

                {/* Market Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Current Market Value
                  </label>
                  <input
                    type="text"
                    value={formatNumber(propertyData.marketValue)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('marketValue', value)
                    }}
                    placeholder="0"
                    className="input-field"
                  />
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Purchase Price
                  </label>
                  <input
                    type="text"
                    value={formatNumber(propertyData.purchasePrice)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('purchasePrice', value)
                    }}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="input-field"
                  />
                </div>

                {/* Down Payment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Down Payment
                      {propertyData.useHomeSaleProceedsAsDownPayment && hasHomeSaleProceeds() && (
                        <span className="text-xs text-blue-600">(from home sale)</span>
                      )}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onUpdate({ downPaymentInputType: 'dollars' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.downPaymentInputType === 'dollars' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Dollars
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ downPaymentInputType: 'percentage' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.downPaymentInputType === 'percentage' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Percentage
                      </button>
                    </div>
                  </div>
                  <input
                    type={propertyData.downPaymentInputType === 'percentage' ? 'number' : 'text'}
                    value={propertyData.downPaymentInputType === 'percentage' 
                      ? (propertyData.purchasePrice > 0 ? ((getEffectiveDownPayment() / propertyData.purchasePrice) * 100) : 0) || ''
                      : formatNumber(getEffectiveDownPayment())
                    }
                    onChange={(e) => {
                      if (propertyData.useHomeSaleProceedsAsDownPayment) {
                        // Don't allow manual changes when using home sale proceeds
                        return
                      }
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      if (propertyData.downPaymentInputType === 'percentage') {
                        const percentageValue = value / 100
                        const dollarValue = propertyData.purchasePrice * percentageValue
                        handleInputChange('downPayment', dollarValue)
                      } else {
                        handleInputChange('downPayment', value)
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step={propertyData.downPaymentInputType === 'percentage' ? 0.1 : 1000}
                    className={`input-field ${propertyData.useHomeSaleProceedsAsDownPayment ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={propertyData.useHomeSaleProceedsAsDownPayment}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {propertyData.downPaymentInputType === 'percentage' ? 'Percentage of purchase price' : 'Dollar amount'}
                    {propertyData.downPaymentInputType === 'percentage' && propertyData.purchasePrice > 0 && getEffectiveDownPayment() > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Dollar amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getEffectiveDownPayment())}
                      </span>
                    )}
                    {propertyData.downPaymentInputType === 'dollars' && propertyData.purchasePrice > 0 && getEffectiveDownPayment() > 0 && (
                      <span className="block mt-1 text-gray-600">
                        {((getEffectiveDownPayment() / propertyData.purchasePrice) * 100).toFixed(1)}% of purchase price
                      </span>
                    )}
                  </p>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="text"
                    value={propertyData.interestRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      handleInputChange('interestRate', value)
                    }}
                    placeholder="0"
                    min="0"
                    max="25"
                    step="0.125"
                    className="input-field"
                  />
                </div>

                {/* Loan Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Term (years)
                  </label>
                  <select
                    value={propertyData.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                    className="input-field"
                  >
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={30}>30 years</option>
                    <option value={40}>40 years</option>
                  </select>
                </div>

                {/* Tax Input Toggle and Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Property Taxes
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onUpdate({ taxInputType: 'annual' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.taxInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ taxInputType: 'monthly' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.taxInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type={propertyData.taxInputType === 'monthly' ? 'number' : 'text'}
                    value={propertyData.taxInputType === 'monthly' ? (propertyData.annualTaxes / 12) || '' : formatNumber(propertyData.annualTaxes)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = propertyData.taxInputType === 'monthly' ? value * 12 : value
                      handleInputChange('annualTaxes', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={propertyData.taxInputType === 'monthly' ? 100 : 1000}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {propertyData.taxInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                    {propertyData.taxInputType === 'monthly' && propertyData.annualTaxes > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Annual total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(propertyData.annualTaxes)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Insurance Input Toggle and Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Insurance
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onUpdate({ insuranceInputType: 'annual' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.insuranceInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ insuranceInputType: 'monthly' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.insuranceInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type={propertyData.insuranceInputType === 'monthly' ? 'number' : 'text'}
                    value={propertyData.insuranceInputType === 'monthly' ? (propertyData.annualInsurance / 12) || '' : formatNumber(propertyData.annualInsurance)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = propertyData.insuranceInputType === 'monthly' ? value * 12 : value
                      handleInputChange('annualInsurance', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={propertyData.insuranceInputType === 'monthly' ? 100 : 1000}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {propertyData.taxInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                    {propertyData.insuranceInputType === 'monthly' && propertyData.annualInsurance > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Annual total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(propertyData.annualInsurance)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* DSCR Calculator Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Rental Property Analysis
                </h3>
                
                {/* Rental Income */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Gross Rental Income
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onUpdate({ rentalIncomeInputType: 'annual' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.rentalIncomeInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ rentalIncomeInputType: 'monthly' })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          propertyData.rentalIncomeInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type={propertyData.rentalIncomeInputType === 'monthly' ? 'number' : 'text'}
                    value={propertyData.rentalIncomeInputType === 'monthly' ? (propertyData.grossRentalIncome / 12) || '' : formatNumber(propertyData.grossRentalIncome)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = propertyData.rentalIncomeInputType === 'monthly' ? value * 12 : value
                      handleInputChange('grossRentalIncome', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={propertyData.rentalIncomeInputType === 'monthly' ? 100 : 1000}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {propertyData.rentalIncomeInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                  </p>
                </div>

                {/* Rental Income Discount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vacancy & Maintenance Discount (%)
                  </label>
                  <input
                    type="number"
                    value={propertyData.rentalIncomeDiscount || ''}
                    onChange={(e) => handleInputChange('rentalIncomeDiscount', e.target.value)}
                    placeholder="25"
                    min="0"
                    max="50"
                    step="1"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard discount for vacancy, maintenance, and unexpected expenses
                  </p>
                </div>

                {/* Property Management */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Property Management
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={propertyData.includePropertyManagement}
                        onChange={(e) => onUpdate({ includePropertyManagement: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include</span>
                    </label>
                  </div>
                  {propertyData.includePropertyManagement && (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          type="button"
                          onClick={() => onUpdate({ propertyManagementInputType: 'dollars' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.propertyManagementInputType === 'dollars' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Dollars
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate({ propertyManagementInputType: 'percentage' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.propertyManagementInputType === 'percentage' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Percentage
                        </button>
                      </div>
                      <input
                        type={propertyData.propertyManagementInputType === 'percentage' ? 'number' : 'text'}
                        value={propertyData.propertyManagementInputType === 'percentage' ? propertyData.propertyManagementFee : formatNumber(propertyData.propertyManagementFee)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                          if (propertyData.propertyManagementInputType === 'percentage') {
                            // Store the raw percentage value (e.g., "10" for 10%)
                            // Round to 2 decimal places to avoid floating-point precision issues
                            const roundedValue = Math.round(value * 100) / 100
                            handleInputChange('propertyManagementFee', roundedValue)
                          } else {
                            handleInputChange('propertyManagementFee', value)
                          }
                        }}
                        placeholder="0"
                        min="0"
                        step={propertyData.propertyManagementInputType === 'percentage' ? 1 : 1000}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {propertyData.propertyManagementInputType === 'percentage' ? 'Percentage of rental income' : 'Annual dollar amount'}
                      </p>
                    </>
                  )}
                </div>

                {/* Maintenance Reserves */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Maintenance Reserves
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={propertyData.includeMaintenance}
                        onChange={(e) => onUpdate({ includeMaintenance: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include</span>
                    </label>
                  </div>
                  {propertyData.includeMaintenance && (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          type="button"
                          onClick={() => onUpdate({ maintenanceInputType: 'dollars' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.maintenanceInputType === 'dollars' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Dollars
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate({ maintenanceInputType: 'percentage' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.maintenanceInputType === 'percentage' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Percentage
                        </button>
                      </div>
                      <input
                        type={propertyData.maintenanceInputType === 'percentage' ? 'number' : 'text'}
                        value={propertyData.maintenanceInputType === 'percentage' ? propertyData.maintenanceReserve : formatNumber(propertyData.maintenanceReserve)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                          if (propertyData.maintenanceInputType === 'percentage') {
                            // Store the raw percentage value (e.g., "10" for 10%)
                            // Round to 2 decimal places to avoid floating-point precision issues
                            const roundedValue = Math.round(value * 100) / 100
                            handleInputChange('maintenanceReserve', roundedValue)
                          } else {
                            handleInputChange('maintenanceReserve', value)
                          }
                        }}
                        placeholder="0"
                        min="0"
                        step={propertyData.maintenanceInputType === 'percentage' ? 1 : 1000}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {propertyData.maintenanceInputType === 'percentage' ? 'Percentage of rental income' : 'Annual dollar amount'}
                      </p>
                    </>
                  )}
                </div>

                {/* HOA Fees */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      HOA Fees
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={propertyData.includeHoaFees}
                        onChange={(e) => onUpdate({ includeHoaFees: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include</span>
                    </label>
                  </div>
                  {propertyData.includeHoaFees && (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          type="button"
                          onClick={() => onUpdate({ hoaInputType: 'annual' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.hoaInputType === 'annual' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Annual
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate({ hoaInputType: 'monthly' })}
                          className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            propertyData.hoaInputType === 'monthly' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                      <input
                        type={propertyData.hoaInputType === 'monthly' ? 'number' : 'text'}
                        value={propertyData.hoaInputType === 'monthly' ? (propertyData.hoaFees / 12) || '' : formatNumber(propertyData.hoaFees)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                          const annualValue = propertyData.hoaInputType === 'monthly' ? value * 12 : value
                          handleInputChange('hoaFees', annualValue)
                        }}
                        placeholder="0"
                        min="0"
                        step={propertyData.hoaInputType === 'monthly' ? 100 : 1000}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {propertyData.hoaInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Home Sale Inputs */}
        {propertyData.calculatorMode === 'homeSale' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary-600" />
              Home Sale Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Sale Price
                </label>
                <input
                  type="text"
                  value={formatNumber(propertyData.salePrice)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('salePrice', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="input-field"
                />
              </div>

              {/* Outstanding Mortgage Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Outstanding Mortgage Balance
                </label>
                <input
                  type="text"
                  value={formatNumber(propertyData.outstandingMortgageBalance)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('outstandingMortgageBalance', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="input-field"
                />
              </div>

              {/* Original Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Original Purchase Price
                </label>
                <input
                  type="text"
                  value={formatNumber(propertyData.originalPurchasePrice)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('originalPurchasePrice', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="input-field"
                />
              </div>

              {/* Realtor Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Realtor Commission
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={propertyData.realtorCommissionInputType === 'percentage' 
                      ? propertyData.realtorCommission 
                      : formatNumber(propertyData.realtorCommission)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('realtorCommission', value)
                    }}
                    placeholder="0"
                    min="0"
                    step={propertyData.realtorCommissionInputType === 'percentage' ? 0.1 : 1000}
                    className="input-field flex-1"
                  />
                  <select
                    value={propertyData.realtorCommissionInputType}
                    onChange={(e) => onUpdate({ realtorCommissionInputType: e.target.value as 'dollars' | 'percentage' })}
                    className="input-field w-24"
                  >
                    <option value="dollars">$</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              {/* Closing Costs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Closing Costs
                </label>
                <input
                  type="text"
                  value={formatNumber(propertyData.closingCosts)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('closingCosts', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="input-field"
                />
              </div>

              {/* Capital Gains Tax Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Gains Tax Rate (%)
                </label>
                <input
                  type="text"
                  value={propertyData.capitalGainsTaxRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    handleInputChange('capitalGainsTaxRate', value)
                  }}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}