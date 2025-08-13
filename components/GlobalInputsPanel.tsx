'use client'

import React, { useState, useMemo } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { calculateNetProceeds } from '@/utils/calculations'
import { trackInputFieldPopulated, track1031ExchangeToggle, trackHomeSaleProceedsToggle, trackTimeframeToggle, trackInputTypeToggle } from '@/utils/amplitude'
import EnhancedAddressField from './EnhancedAddressField'

interface GlobalInputsPanelProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
  propertiesCollection: PropertiesCollection
  onPropertiesCollectionChange: (updatedCollection: PropertiesCollection) => void
  onShowNewPropertyDialog: () => void
  calculatorMode: 'investment' | 'homeSale'
  onPropertySelect: (property: Property) => void
}

export default function GlobalInputsPanel({ 
  property, 
  onUpdate, 
  propertiesCollection,
  onPropertiesCollectionChange,
  onShowNewPropertyDialog,
  calculatorMode,
  onPropertySelect
}: GlobalInputsPanelProps) {
  // Calculate home sale proceeds for down payment (only for investment properties)
  const getHomeSaleProceeds = () => {
    if (calculatorMode !== 'investment' || !propertiesCollection) return 0
    
    if (!property.useHomeSaleProceedsAsDownPayment || !property.selectedHomeSalePropertyId) return 0
    
    const homeSaleProperty = propertiesCollection.properties.find(p => 
      p.id === property.selectedHomeSalePropertyId && p.activeMode === 'homeSale'
    )
    
    if (!homeSaleProperty) return 0
    
    const netProceeds = calculateNetProceeds(homeSaleProperty, propertiesCollection)
    return netProceeds ? netProceeds.netProceeds : 0
  }

  // Handle input changes
  const handleInputChange = (key: string, value: number) => {
    const updates = { [key]: value } as Partial<Property>
    onUpdate(updates)
    
    // Track input field population with Amplitude
    trackInputFieldPopulated(key, typeof value, property.id, calculatorMode)
  }

  // Handle text changes
  const handleTextChange = (key: string, value: string) => {
    const updates = { [key]: value } as Partial<Property>
    onUpdate(updates)
  }

  // Handle toggle changes
  const handleToggle = (key: string, value: boolean) => {
    const updates = { [key]: value } as Partial<Property>
    onUpdate(updates)
    
    // Track specific toggle events with Amplitude
    if (key === 'use1031Exchange') {
      track1031ExchangeToggle(value, property.id, property.selectedReplacementPropertyId || undefined)
    } else if (key === 'useHomeSaleProceedsAsDownPayment') {
      trackHomeSaleProceedsToggle(value, property.id, property.selectedHomeSalePropertyId || undefined)
    }
  }

  // Handle select changes
  const handleSelectChange = (key: string, value: string) => {
    const updates = { [key]: value } as Partial<Property>
    onUpdate(updates)
    
    // Track specific select changes with Amplitude
    if (key === 'selectedReplacementPropertyId' && value) {
      track1031ExchangeToggle(true, property.id, value)
    } else if (key === 'selectedHomeSalePropertyId' && value) {
      trackHomeSaleProceedsToggle(true, property.id, value)
    }
  }

  // Get available home sale properties for down payment selection
  const availableHomeSaleProperties = useMemo(() => {
    return propertiesCollection.properties.filter(p => 
      p.activeMode === 'homeSale' && p.id !== property.id
    )
  }, [propertiesCollection.properties, property.id, calculatorMode])

  return (
    <div className="space-y-6">
      {/* Property Address */}
      <EnhancedAddressField
        property={property}
        onUpdate={onUpdate}
        propertiesCollection={propertiesCollection}
        onShowNewPropertyDialog={onShowNewPropertyDialog}
        onPropertySelect={onPropertySelect}
      />

      {/* Property Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={property.propertyType}
              onChange={(e) => handleSelectChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
            >
              <option value="single-family">Single Family</option>
              <option value="multi-family">Multi Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Value</label>
            <input
              type="text"
              value={formatNumber(property.marketValue || 0)}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                handleInputChange('marketValue', value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Current market value"
            />
          </div>
        </div>
      </div>

      {/* Purchase Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Purchase Info</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Bought</label>
            <input
              type="number"
              value={property.yearBought || ''}
              onChange={(e) => handleInputChange('yearBought', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Year purchased"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
            <input
              type="text"
              value={formatNumber(property.purchasePrice || 0)}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                handleInputChange('purchasePrice', value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Purchase price"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formatNumber(property.downPayment || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  handleInputChange('downPayment', value)
                }}
                className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  property.useHomeSaleProceedsAsDownPayment
                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300'
                }`}
                placeholder="Down payment"
                readOnly={property.useHomeSaleProceedsAsDownPayment}
                disabled={property.useHomeSaleProceedsAsDownPayment}
              />
              <select
                value={property.downPaymentInputType}
                onChange={(e) => handleSelectChange('downPaymentInputType', e.target.value)}
                className={`px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 ${
                  property.useHomeSaleProceedsAsDownPayment
                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-white border-gray-300'
                }`}
                disabled={property.useHomeSaleProceedsAsDownPayment}
              >
                <option value="dollar">$</option>
                <option value="percentage">%</option>
              </select>
            </div>
            {property.useHomeSaleProceedsAsDownPayment && (
              <p className="text-sm text-gray-600 mt-1">
                Down payment will be calculated from selected property's sale proceeds
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.001"
              value={property.interestRate || ''}
              onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Interest rate"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (years)</label>
            <select
              value={property.loanTerm}
              onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>

        {/* Use Home Sale Proceeds */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useHomeSaleProceeds"
              checked={property.useHomeSaleProceedsAsDownPayment}
              onChange={(e) => handleToggle('useHomeSaleProceedsAsDownPayment', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="useHomeSaleProceeds" className="ml-2 block text-sm text-gray-900">
              Use Home Sale Proceeds as Down Payment
            </label>
          </div>
          
          {property.useHomeSaleProceedsAsDownPayment && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Home Sale Property</label>
                <select
                  value={property.selectedHomeSalePropertyId || ''}
                  onChange={(e) => handleSelectChange('selectedHomeSalePropertyId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                >
                  <option value="">-- Select a property --</option>
                  {availableHomeSaleProperties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name || prop.streetAddress} (${(prop.salePrice || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              
              {property.selectedHomeSalePropertyId && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  Available proceeds: {formatCurrency(getHomeSaleProceeds())}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expenses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Taxes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Property Taxes</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.taxTimeframe
                    handleSelectChange('taxTimeframe', 'annual')
                    if (fromTimeframe !== 'annual') {
                      trackTimeframeToggle('Property Taxes', fromTimeframe, 'annual', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                    property.taxTimeframe === 'annual'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Annual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.taxTimeframe
                    handleSelectChange('taxTimeframe', 'monthly')
                    if (fromTimeframe !== 'monthly') {
                      trackTimeframeToggle('Property Taxes', fromTimeframe, 'monthly', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                    property.taxTimeframe === 'monthly'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <input
              type="text"
              value={formatNumber(property.taxTimeframe === 'monthly' ? (property.annualTaxes || 0) / 12 : (property.annualTaxes || 0))}
              onChange={(e) => {
                const inputValue = parseFloat(e.target.value.replace(/,/g, '')) || 0
                // Convert to annual if input is monthly
                const annualValue = property.taxTimeframe === 'monthly' ? inputValue * 12 : inputValue
                handleInputChange('annualTaxes', annualValue)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder={property.taxTimeframe === 'monthly' ? 'Monthly property taxes' : 'Annual property taxes'}
            />
            <p className="text-sm text-gray-500 mt-1">
              {property.taxTimeframe === 'monthly' ? 'Monthly amount' : 'Annual amount'}
            </p>
          </div>
          
          {/* Insurance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Property Insurance</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.insuranceTimeframe
                    handleSelectChange('insuranceTimeframe', 'annual')
                    if (fromTimeframe !== 'annual') {
                      trackTimeframeToggle('Property Insurance', fromTimeframe, 'annual', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                    property.insuranceTimeframe === 'annual'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Annual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.insuranceTimeframe
                    handleSelectChange('insuranceTimeframe', 'monthly')
                    if (fromTimeframe !== 'monthly') {
                      trackTimeframeToggle('Property Insurance', fromTimeframe, 'monthly', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                    property.insuranceTimeframe === 'monthly'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <input
              type="text"
              value={formatNumber(property.insuranceTimeframe === 'monthly' ? (property.annualInsurance || 0) / 12 : (property.annualInsurance || 0))}
              onChange={(e) => {
                const inputValue = parseFloat(e.target.value.replace(/,/g, '')) || 0
                // Convert to annual if input is monthly
                const annualValue = property.insuranceTimeframe === 'monthly' ? inputValue * 12 : inputValue
                handleInputChange('annualInsurance', annualValue)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder={property.insuranceTimeframe === 'monthly' ? 'Monthly insurance' : 'Annual insurance'}
            />
            <p className="text-sm text-gray-500 mt-1">
              {property.insuranceTimeframe === 'monthly' ? 'Monthly amount' : 'Annual amount'}
            </p>
          </div>
          
          {/* HOA Fees */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">HOA Fees</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.hoaInputType
                    handleSelectChange('hoaInputType', 'annual')
                    if (fromTimeframe !== 'annual') {
                      trackTimeframeToggle('HOA Fees', fromTimeframe, 'annual', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                    property.hoaInputType === 'annual'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Annual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fromTimeframe = property.hoaInputType
                    handleSelectChange('hoaInputType', 'monthly')
                    if (fromTimeframe !== 'monthly') {
                      trackTimeframeToggle('HOA Fees', fromTimeframe, 'monthly', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                    property.hoaInputType === 'monthly'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <input
              type="text"
              value={formatNumber(property.hoaFees || 0)}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                handleInputChange('hoaFees', value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="HOA fees"
            />
            <p className="text-sm text-gray-500 mt-1">
              {property.hoaInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
            </p>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeHoaFees"
                checked={property.includeHoaFees}
                onChange={(e) => handleToggle('includeHoaFees', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includeHoaFees" className="ml-2 block text-sm text-gray-900">
                Include in DSCR
              </label>
            </div>
          </div>
          
          {/* Property Management */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Property Management</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const fromType = property.propertyManagementInputType
                    handleSelectChange('propertyManagementInputType', 'dollar')
                    if (fromType !== 'dollar') {
                      trackInputTypeToggle('Property Management Fee', fromType, 'dollar', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                    property.propertyManagementInputType === 'dollar'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fromType = property.propertyManagementInputType
                    handleSelectChange('propertyManagementInputType', 'percentage')
                    if (fromType !== 'percentage') {
                      trackInputTypeToggle('Property Management Fee', fromType, 'percentage', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                    property.propertyManagementInputType === 'percentage'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              value={property.propertyManagementFee || ''}
              onChange={(e) => handleInputChange('propertyManagementFee', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Property management fee"
            />
            <p className="text-sm text-gray-500 mt-1">
              {property.propertyManagementInputType === 'dollar' ? 'Dollar amount' : 'Percentage of rent'}
            </p>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePropertyManagement"
                checked={property.includePropertyManagement}
                onChange={(e) => handleToggle('includePropertyManagement', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includePropertyManagement" className="ml-2 block text-sm text-gray-900">
                Include in DSCR
              </label>
            </div>
          </div>
          
          {/* Maintenance Reserves */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Maintenance Reserves</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const fromType = property.maintenanceInputType
                    handleSelectChange('maintenanceInputType', 'dollar')
                    if (fromType !== 'dollar') {
                      trackInputTypeToggle('Maintenance Reserve', fromType, 'dollar', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                    property.maintenanceInputType === 'dollar'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fromType = property.maintenanceInputType
                    handleSelectChange('maintenanceInputType', 'percentage')
                    if (fromType !== 'percentage') {
                      trackInputTypeToggle('Maintenance Reserve', fromType, 'percentage', property.id, calculatorMode)
                    }
                  }}
                  className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                    property.maintenanceInputType === 'percentage'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              value={property.maintenanceReserve || ''}
              onChange={(e) => handleInputChange('maintenanceReserve', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Maintenance reserve"
            />
            <p className="text-sm text-gray-500 mt-1">
              {property.maintenanceInputType === 'dollar' ? 'Dollar amount' : 'Percentage of rent'}
            </p>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMaintenance"
                checked={property.includeMaintenance}
                onChange={(e) => handleToggle('includeMaintenance', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includeMaintenance" className="ml-2 block text-sm text-gray-900">
                Include in DSCR
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Home Sale Property Inputs */}
      {calculatorMode === 'homeSale' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Home Sale Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input
                type="text"
                value={formatNumber(property.salePrice || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  handleInputChange('salePrice', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Sale price"
              />
            </div>
            

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Mortgage Balance</label>
              <input
                type="text"
                value={formatNumber(property.outstandingMortgageBalance || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  handleInputChange('outstandingMortgageBalance', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Outstanding mortgage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Realtor Commission</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatNumber(property.realtorCommission || 0)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('realtorCommission', value)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  placeholder="Realtor commission"
                />
                <select
                  value={property.realtorCommissionInputType}
                  onChange={(e) => handleSelectChange('realtorCommissionInputType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                >
                  <option value="dollar">$</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Costs</label>
              <input
                type="text"
                value={formatNumber(property.closingCosts || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  handleInputChange('closingCosts', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Closing costs"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capital Gains Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={property.capitalGainsTaxRate || ''}
                onChange={(e) => handleInputChange('capitalGainsTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Capital gains tax rate"
              />
            </div>
          </div>

          {/* 1031 Exchange */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="use1031Exchange"
                checked={property.use1031Exchange}
                onChange={(e) => handleToggle('use1031Exchange', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="use1031Exchange" className="ml-2 block text-sm text-gray-900">
                Use 1031 Exchange
              </label>
            </div>
            
            {property.use1031Exchange && (
              <div className="ml-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Replacement Property</label>
                  <select
                    value={property.selectedReplacementPropertyId || ''}
                    onChange={(e) => handleSelectChange('selectedReplacementPropertyId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                  >
                    <option value="">-- Select a replacement property --</option>
                    {propertiesCollection.properties
                      .filter(p => p.id !== property.id)
                      .map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name || prop.streetAddress} - {prop.activeMode === 'investment' ? 'Investment' : 'Home Sale'} (${prop.purchasePrice?.toLocaleString() || 0})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  QI Fees: {formatCurrency(property.qiFees || 1500)} (included in closing costs)
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Income */}
      {calculatorMode === 'investment' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Income</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Rental Income</label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const fromTimeframe = property.rentalIncomeInputType
                      handleSelectChange('rentalIncomeInputType', 'annual')
                      if (fromTimeframe !== 'annual') {
                        trackTimeframeToggle('Gross Rental Income', fromTimeframe, 'annual', property.id, calculatorMode)
                      }
                    }}
                    className={`px-2 py-1 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${
                      property.rentalIncomeInputType === 'annual'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Annual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fromTimeframe = property.rentalIncomeInputType
                      handleSelectChange('rentalIncomeInputType', 'monthly')
                      if (fromTimeframe !== 'monthly') {
                        trackTimeframeToggle('Gross Rental Income', fromTimeframe, 'monthly', property.id, calculatorMode)
                      }
                    }}
                    className={`px-2 py-1 text-xs font-medium border rounded-r-md transition-colors ${
                      property.rentalIncomeInputType === 'monthly'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={formatNumber(property.grossRentalIncome || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  handleInputChange('grossRentalIncome', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Gross rental income"
              />
              <p className="text-sm text-gray-500 mt-1">
                {property.rentalIncomeInputType === 'monthly' ? 'Monthly amount' : 'Annual amount'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Income Discount (%)</label>
              <input
                type="number"
                step="0.01"
                value={property.rentalIncomeDiscount || ''}
                onChange={(e) => handleInputChange('rentalIncomeDiscount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Vacancy/maintenance discount"
              />
              <p className="text-sm text-gray-500 mt-1">
                Used for DSCR calculations only. Does not impact monthly cash flow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}