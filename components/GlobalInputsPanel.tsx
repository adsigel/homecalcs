'use client'

import React from 'react'
import { Property, HomeSaleProperty, InvestmentProperty, PropertiesCollection } from '@/types/property'
import { Home, DollarSign, MapPin, Building2, Calendar, TrendingUp, Wrench, Calculator } from 'lucide-react'
import { formatNumber, calculateNetProceeds } from '@/utils/calculations'
import EnhancedAddressField from './EnhancedAddressField'

interface GlobalInputsPanelProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
  propertiesCollection?: PropertiesCollection
  onPropertiesCollectionChange?: (collection: PropertiesCollection) => void
  onShowNewPropertyDialog: () => void
}

export default function GlobalInputsPanel({ property, onUpdate, propertiesCollection, onPropertiesCollectionChange, onShowNewPropertyDialog }: GlobalInputsPanelProps) {
  const handleInputChange = (field: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    onUpdate({ [field]: numValue } as Partial<Property>)
  }

  const handleTextChange = (field: string, value: string) => {
    onUpdate({ [field]: value } as Partial<Property>)
  }

  const handleToggle = (field: string, value: boolean) => {
    onUpdate({ [field]: value } as Partial<Property>)
  }

  const handleSelectChange = (field: string, value: string) => {
    onUpdate({ [field]: value } as Partial<Property>)
  }

  // Calculate home sale proceeds for down payment (only for investment properties)
  const getHomeSaleProceeds = () => {
    if (property.calculatorMode !== 'investment' || !propertiesCollection) return 0
    
    const investmentProperty = property as InvestmentProperty
    if (!investmentProperty.selectedHomeSalePropertyId) return 0
    
    // Find the selected home sale property
    const selectedHomeSaleProperty = propertiesCollection.properties.find(
      p => p.id === investmentProperty.selectedHomeSalePropertyId && p.calculatorMode === 'homeSale'
    ) as HomeSaleProperty | undefined
    
    if (!selectedHomeSaleProperty) return 0
    
    // Calculate proceeds from the selected property
    const calculation = calculateNetProceeds(selectedHomeSaleProperty, propertiesCollection)
    return calculation.netProceeds
  }

  // Get available home sale properties for selection
  const getAvailableHomeSaleProperties = () => {
    if (!propertiesCollection) return []
    
    return propertiesCollection.properties.filter(
      p => p.calculatorMode === 'homeSale'
    ) as HomeSaleProperty[]
  }

  // Check if home sale proceeds are available
  const hasHomeSaleProceeds = () => {
    return getHomeSaleProceeds() > 0
  }

  // Get the effective down payment value
  const getEffectiveDownPayment = () => {
    if (property.calculatorMode !== 'investment') return 0
    
    const investmentProperty = property as InvestmentProperty
    if (investmentProperty.useHomeSaleProceedsAsDownPayment && hasHomeSaleProceeds()) {
      return getHomeSaleProceeds()
    }
    return investmentProperty.downPayment
  }

  const isHomeSaleProperty = property.calculatorMode === 'homeSale'
  const isInvestmentProperty = property.calculatorMode === 'investment'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
      {/* Property Type Display */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {isHomeSaleProperty ? (
            <Home className="w-5 h-5 text-blue-600" />
          ) : (
            <Building2 className="w-5 h-5 text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {isHomeSaleProperty ? 'Home Sale Property' : 'Investment Property'}
          </span>
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
          
          {/* Address */}
          <div className="space-y-3">
            <EnhancedAddressField
              property={property}
              propertiesCollection={propertiesCollection || { properties: [], activePropertyId: null }}
              onUpdate={onUpdate}
              onPropertiesCollectionChange={onPropertiesCollectionChange || (() => {})}
              onShowNewPropertyDialog={onShowNewPropertyDialog}
            />
          </div>

          {/* Property Manager - moved up for better UX flow */}
          <div className="pt-4 border-t border-gray-200">
            {/* This component is no longer needed as PropertyManager is integrated into Property */}
            {/* For now, we'll just show a placeholder or remove if not used */}
            {/* <PropertyManager
              propertyData={propertyData}
              onLoadProperty={onLoadProperty}
              onUpdate={onUpdate}
            /> */}
          </div>
        </div>

        {/* Investment Property Inputs */}
        {isInvestmentProperty && (
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
                    checked={property.useHomeSaleProceedsAsDownPayment}
                    onChange={(e) => handleToggle('useHomeSaleProceedsAsDownPayment', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-blue-800">
                    Use Home Sale Proceeds as Down Payment
                  </span>
                </label>
                
                {property.useHomeSaleProceedsAsDownPayment && (
                  <div className="mt-3 ml-6 space-y-3">
                    {/* Home Sale Property Selection */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Select Home Sale Property
                      </label>
                      <select
                        value={property.selectedHomeSalePropertyId || ''}
                        onChange={(e) => onUpdate({ selectedHomeSalePropertyId: e.target.value || undefined })}
                        className="w-full h-10 px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">-- Select a home sale property --</option>
                        {getAvailableHomeSaleProperties().map((homeSaleProperty) => (
                          <option key={homeSaleProperty.id} value={homeSaleProperty.id}>
                            {homeSaleProperty.name || homeSaleProperty.streetAddress || 'Unnamed Property'} - 
                            ${calculateNetProceeds(homeSaleProperty, propertiesCollection).netProceeds.toLocaleString()} net proceeds
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Proceeds Display */}
                    {property.selectedHomeSalePropertyId && hasHomeSaleProceeds() ? (
                      <div className="p-2 bg-blue-100 rounded border border-blue-300">
                        <p className="text-xs text-blue-800">
                          <strong>Selected Property:</strong> {
                            getAvailableHomeSaleProperties().find(p => p.id === property.selectedHomeSalePropertyId)?.name || 
                            getAvailableHomeSaleProperties().find(p => p.id === property.selectedHomeSalePropertyId)?.streetAddress || 
                            'Unknown Property'
                          }
                        </p>
                        <p className="text-xs text-blue-800 mt-1">
                          <strong>Net Proceeds:</strong> ${getHomeSaleProceeds().toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Down payment will be automatically set to this amount
                        </p>
                      </div>
                    ) : property.selectedHomeSalePropertyId ? (
                      <div className="p-2 bg-amber-100 rounded border border-amber-300">
                        <p className="text-xs text-amber-800">
                          <strong>Warning:</strong> The selected home sale property has no net proceeds calculated.
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Please fill out the home sale property details first.
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600">
                        <p>To use home sale proceeds as down payment, you need:</p>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>At least one home sale property with calculated net proceeds</li>
                          <li>Select the specific home sale property above</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Property Type
                  </label>
                  <select
                    value={property.propertyType}
                    onChange={(e) => handleTextChange('propertyType', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                  </select>
                </div>

                {/* Year Built */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year Built
                  </label>
                  <input
                    type="number"
                    value={property.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                    min="1800"
                    max={new Date().getFullYear() + 1}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                </div>

                {/* Market Value */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Current Market Value
                  </label>
                  <input
                    type="text"
                    value={formatNumber(property.marketValue)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('marketValue', value)
                    }}
                    placeholder="0"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                </div>

                {/* Purchase Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Purchase Price
                  </label>
                  <input
                    type="text"
                    value={formatNumber(property.purchasePrice)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('purchasePrice', value)
                    }}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Down Payment
                      {property.useHomeSaleProceedsAsDownPayment && hasHomeSaleProceeds() && (
                        <span className="text-xs text-blue-600">
                          (from {getAvailableHomeSaleProperties().find(p => p.id === property.selectedHomeSalePropertyId)?.name || 
                                  getAvailableHomeSaleProperties().find(p => p.id === property.selectedHomeSalePropertyId)?.streetAddress || 
                                  'selected home sale property'})
                        </span>
                      )}
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onUpdate({ downPaymentInputType: 'dollars' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.downPaymentInputType === 'dollars' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Dollars
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ downPaymentInputType: 'percentage' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.downPaymentInputType === 'percentage' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Percentage
                      </button>
                    </div>
                  </div>
                  <input
                    type={property.downPaymentInputType === 'percentage' ? 'number' : 'text'}
                    value={property.downPaymentInputType === 'percentage' 
                      ? (property.purchasePrice > 0 ? ((getEffectiveDownPayment() / property.purchasePrice) * 100) : 0) || ''
                      : formatNumber(getEffectiveDownPayment())
                    }
                    onChange={(e) => {
                      if (property.useHomeSaleProceedsAsDownPayment) {
                        // Don't allow manual changes when using home sale proceeds
                        return
                      }
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      if (property.downPaymentInputType === 'percentage') {
                        const percentageValue = value / 100
                        const dollarValue = property.purchasePrice * percentageValue
                        handleInputChange('downPayment', dollarValue)
                      } else {
                        handleInputChange('downPayment', value)
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step={property.downPaymentInputType === 'percentage' ? 0.01 : 1000}
                    className={`w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${property.useHomeSaleProceedsAsDownPayment ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={property.useHomeSaleProceedsAsDownPayment}
                  />
                  <p className="text-xs text-gray-500">
                    {property.downPaymentInputType === 'percentage' ? 'Percentage of purchase price' : 'Dollar amount'}
                    {property.downPaymentInputType === 'percentage' && property.purchasePrice > 0 && getEffectiveDownPayment() > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Dollar amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getEffectiveDownPayment())}
                      </span>
                    )}
                    {property.downPaymentInputType === 'dollars' && property.purchasePrice > 0 && getEffectiveDownPayment() > 0 && (
                      <span className="block mt-1 text-gray-600">
                        {((getEffectiveDownPayment() / property.purchasePrice) * 100).toFixed(1)}% of purchase price
                      </span>
                    )}
                  </p>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={property.interestRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      handleInputChange('interestRate', value)
                    }}
                    placeholder="0"
                    min="0"
                    max="25"
                    step="0.001"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500">
                    Enter rate with up to 3 decimal places (e.g., 7.125%)
                  </p>
                </div>

                {/* Loan Term */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Loan Term (years)
                  </label>
                  <select
                    value={property.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white"
                  >
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={30}>30 years</option>
                    <option value={40}>40 years</option>
                  </select>
                </div>

                {/* Tax Input Toggle and Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Property Taxes
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onUpdate({ taxInputType: 'annual' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.taxInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ taxInputType: 'monthly' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.taxInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type={property.taxInputType === 'monthly' ? 'number' : 'text'}
                    value={property.taxInputType === 'monthly' ? (property.annualTaxes / 12) || '' : formatNumber(property.annualTaxes)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = property.taxInputType === 'monthly' ? value * 12 : value
                      handleInputChange('annualTaxes', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={property.taxInputType === 'monthly' ? 100 : 1000}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500">
                    {property.taxInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                    {property.taxInputType === 'monthly' && property.annualTaxes > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Annual total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(property.annualTaxes)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Insurance Input Toggle and Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Insurance
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onUpdate({ insuranceInputType: 'annual' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.insuranceInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ insuranceInputType: 'monthly' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.insuranceInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type={property.insuranceInputType === 'monthly' ? 'number' : 'text'}
                    value={property.insuranceInputType === 'monthly' ? (property.annualInsurance / 12) || '' : formatNumber(property.annualInsurance)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = property.insuranceInputType === 'monthly' ? value * 12 : value
                      handleInputChange('annualInsurance', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={property.insuranceInputType === 'monthly' ? 100 : 1000}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500">
                    {property.taxInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                    {property.insuranceInputType === 'monthly' && property.annualInsurance > 0 && (
                      <span className="block mt-1 text-gray-600">
                        Annual total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(property.annualInsurance)}
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
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onUpdate({ rentalIncomeInputType: 'annual' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.rentalIncomeInputType === 'annual' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate({ rentalIncomeInputType: 'monthly' })}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          property.rentalIncomeInputType === 'monthly' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={property.rentalIncomeInputType === 'monthly' ? formatNumber(property.grossRentalIncome / 12) : formatNumber(property.grossRentalIncome)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = property.rentalIncomeInputType === 'monthly' ? value * 12 : value
                      handleInputChange('grossRentalIncome', annualValue)
                    }}
                    placeholder="0"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {property.rentalIncomeInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                  </p>
                </div>

                {/* Rental Income Discount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Income Discount (%)
                  </label>
                  <input
                    type="number"
                    value={property.rentalIncomeDiscount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      handleInputChange('rentalIncomeDiscount', value)
                    }}
                    placeholder="0"
                    min="0"
                    max="50"
                    step="1"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard discount for vacancy, maintenance, and unexpected expenses
                  </p>
                </div>

                {/* Expense Management Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All expenses below are always shown in the expense breakdown when values are entered. 
                    The checkboxes control whether they are included in DSCR (Debt Service Coverage Ratio) calculations.
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
                        checked={property.includePropertyManagement}
                        onChange={(e) => onUpdate({ includePropertyManagement: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include in DSCR</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <button
                      type="button"
                      onClick={() => onUpdate({ propertyManagementInputType: 'dollars' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        property.propertyManagementInputType === 'dollars' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Dollars
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ propertyManagementInputType: 'percentage' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        property.propertyManagementInputType === 'percentage' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Percentage
                    </button>
                  </div>
                  <input
                    type={property.propertyManagementInputType === 'percentage' ? 'number' : 'text'}
                    value={property.propertyManagementInputType === 'percentage' ? property.propertyManagementFee : formatNumber(property.propertyManagementFee)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      if (property.propertyManagementInputType === 'percentage') {
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
                    step={property.propertyManagementInputType === 'percentage' ? 0.01 : 1000}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {property.propertyManagementInputType === 'percentage' ? 'Percentage of rental income' : 'Annual dollar amount'}
                  </p>
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
                        checked={property.includeMaintenance}
                        onChange={(e) => onUpdate({ includeMaintenance: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include in DSCR</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <button
                      type="button"
                      onClick={() => onUpdate({ maintenanceInputType: 'dollars' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        property.maintenanceInputType === 'dollars' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Dollars
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ maintenanceInputType: 'percentage' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        property.maintenanceInputType === 'percentage' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Percentage
                    </button>
                  </div>
                  <input
                    type={property.maintenanceInputType === 'percentage' ? 'number' : 'text'}
                    value={property.maintenanceInputType === 'percentage' ? property.maintenanceReserve : formatNumber(property.maintenanceReserve)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      if (property.maintenanceInputType === 'percentage') {
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
                    step={property.maintenanceInputType === 'percentage' ? 0.01 : 1000}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {property.maintenanceInputType === 'percentage' ? 'Percentage of rental income' : 'Annual dollar amount'}
                  </p>
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
                        checked={property.includeHoaFees}
                        onChange={(e) => onUpdate({ includeHoaFees: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Include in DSCR</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      type="button"
                      onClick={() => onUpdate({ hoaInputType: 'annual' })}
                      className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        property.hoaInputType === 'annual' 
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
                        property.hoaInputType === 'monthly' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                  <input
                    type={property.hoaInputType === 'monthly' ? 'number' : 'text'}
                    value={property.hoaInputType === 'monthly' ? (property.hoaFees / 12) || '' : formatNumber(property.hoaFees)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      const annualValue = property.hoaInputType === 'monthly' ? value * 12 : value
                      handleInputChange('hoaFees', annualValue)
                    }}
                    placeholder="0"
                    min="0"
                    step={property.hoaInputType === 'monthly' ? 100 : 1000}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {property.hoaInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Home Sale Inputs */}
        {isHomeSaleProperty && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary-600" />
              Home Sale Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sale Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Sale Price
                </label>
                <input
                  type="text"
                  value={formatNumber(property.salePrice)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('salePrice', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
              </div>

              {/* Outstanding Mortgage Balance */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Outstanding Mortgage Balance
                </label>
                <input
                  type="text"
                  value={formatNumber(property.outstandingMortgageBalance)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('outstandingMortgageBalance', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
              </div>

              {/* Original Purchase Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Original Purchase Price
                </label>
                <input
                  type="text"
                  value={formatNumber(property.originalPurchasePrice)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('originalPurchasePrice', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
              </div>

              {/* Realtor Commission */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Realtor Commission
                </label>
                <div className="flex gap-2">
                  <input
                    type={property.realtorCommissionInputType === 'percentage' ? 'number' : 'text'}
                    value={property.realtorCommissionInputType === 'percentage' 
                      ? property.realtorCommission 
                      : formatNumber(property.realtorCommission)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                      handleInputChange('realtorCommission', value)
                    }}
                    placeholder="0"
                    min="0"
                    step={property.realtorCommissionInputType === 'percentage' ? 0.01 : 1000}
                    className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <select
                    value={property.realtorCommissionInputType}
                    onChange={(e) => onUpdate({ realtorCommissionInputType: e.target.value as 'dollars' | 'percentage' })}
                    className="w-24 h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white"
                  >
                    <option value="dollars">$</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              {/* Closing Costs */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Closing Costs
                </label>
                <input
                  type="text"
                  value={formatNumber(property.closingCosts)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('closingCosts', value)
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
              </div>

              {/* Capital Gains Tax Rate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Capital Gains Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={property.capitalGainsTaxRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    handleInputChange('capitalGainsTaxRate', value)
                  }}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
                <p className="text-xs text-gray-500">
                  Enter rate with up to 2 decimal places (e.g., 15.5%)
                </p>
              </div>

              {/* 1031 Exchange Toggle */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={property.use1031Exchange}
                    onChange={(e) => handleToggle('use1031Exchange', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Use 1031 Exchange</span>
                </label>
                <p className="text-xs text-gray-500">
                  Defer capital gains tax by exchanging for investment property
                </p>
              </div>

              {/* Replacement Property Selection */}
              {property.use1031Exchange && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Replacement Property
                  </label>
                  <select
                    value={property.selectedReplacementPropertyId || ''}
                    onChange={(e) => onUpdate({ selectedReplacementPropertyId: e.target.value || undefined })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white"
                  >
                    <option value="">Select replacement property</option>
                    {propertiesCollection?.properties
                      .filter(p => p.calculatorMode === 'investment')
                      .map(prop => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name} - ${prop.purchasePrice.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}