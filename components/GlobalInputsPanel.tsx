'use client'

import React, { useState, useMemo } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations'
import { calculateNetProceeds } from '@/utils/calculations'
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
  }

  // Handle select changes
  const handleSelectChange = (key: string, value: string) => {
    const updates = { [key]: value } as Partial<Property>
    onUpdate(updates)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              value={property.name || ''}
              onChange={(e) => handleTextChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Enter property name"
            />
          </div>
          
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
            <input
              type="number"
              value={property.yearBuilt || ''}
              onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Year built"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Value</label>
            <input
              type="number"
              value={property.marketValue || ''}
              onChange={(e) => handleInputChange('marketValue', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Current market value"
            />
          </div>
        </div>
      </div>

      {/* Investment Property Inputs */}
      {calculatorMode === 'investment' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Investment Property Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                value={property.purchasePrice || ''}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Purchase price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={property.downPayment || ''}
                  onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  placeholder="Down payment"
                />
                <select
                  value={property.downPaymentInputType}
                  onChange={(e) => handleSelectChange('downPaymentInputType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                >
                  <option value="dollar">$</option>
                  <option value="percentage">%</option>
                </select>
              </div>
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
      )}

      {/* Home Sale Property Inputs */}
      {calculatorMode === 'homeSale' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Home Sale Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input
                type="number"
                value={property.salePrice || ''}
                onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Sale price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Purchase Price</label>
              <input
                type="number"
                value={property.originalPurchasePrice || ''}
                onChange={(e) => handleInputChange('originalPurchasePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Original purchase price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Mortgage Balance</label>
              <input
                type="number"
                value={property.outstandingMortgageBalance || ''}
                onChange={(e) => handleInputChange('outstandingMortgageBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Outstanding mortgage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Realtor Commission</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={property.realtorCommission || ''}
                  onChange={(e) => handleInputChange('realtorCommission', parseFloat(e.target.value) || 0)}
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
                type="number"
                value={property.closingCosts || ''}
                onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || 0)}
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
                      .filter(p => p.activeMode === 'investment' && p.id !== property.id)
                      .map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name || prop.streetAddress} (${prop.purchasePrice?.toLocaleString() || 0})
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

      {/* Shared Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Taxes & Insurance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Property Taxes</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={property.annualTaxes || ''}
                onChange={(e) => handleInputChange('annualTaxes', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Annual property taxes"
              />
              <select
                value={property.taxInputType}
                onChange={(e) => handleSelectChange('taxInputType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
              >
                <option value="dollar">$</option>
                <option value="percentage">%</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Insurance</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={property.annualInsurance || ''}
                onChange={(e) => handleInputChange('annualInsurance', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Annual insurance"
              />
              <select
                value={property.insuranceInputType}
                onChange={(e) => handleSelectChange('insuranceInputType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
              >
                <option value="dollar">$</option>
                <option value="percentage">%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Property Specific Inputs */}
      {calculatorMode === 'investment' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Rental Income & Expenses</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Rental Income</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatNumber(property.grossRentalIncome || 0)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    handleInputChange('grossRentalIncome', value)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  placeholder="Gross rental income"
                />
                <select
                  value={property.rentalIncomeInputType}
                  onChange={(e) => handleSelectChange('rentalIncomeInputType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Income Discount (%)</label>
              <input
                type="number"
                step="0.01"
                value={property.rentalIncomeDiscount || ''}
                onChange={(e) => handleInputChange('rentalIncomeDiscount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                placeholder="Vacancy/maintenance discount"
              />
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Operating Expenses</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              Note: All expenses are shown in the breakdown below. Checkboxes control whether they are included in DSCR calculations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Management Fee</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={property.propertyManagementFee || ''}
                      onChange={(e) => handleInputChange('propertyManagementFee', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      placeholder="Property management fee"
                    />
                    <select
                      value={property.propertyManagementInputType}
                      onChange={(e) => handleSelectChange('propertyManagementInputType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                    >
                      <option value="dollar">$</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Reserve</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={property.maintenanceReserve || ''}
                      onChange={(e) => handleInputChange('maintenanceReserve', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      placeholder="Maintenance reserve"
                    />
                    <select
                      value={property.maintenanceInputType}
                      onChange={(e) => handleSelectChange('maintenanceInputType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                    >
                      <option value="dollar">$</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOA Fees</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={property.hoaFees || ''}
                      onChange={(e) => handleInputChange('hoaFees', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      placeholder="HOA fees"
                    />
                    <select
                      value={property.hoaInputType}
                      onChange={(e) => handleSelectChange('hoaInputType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 h-10 bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}