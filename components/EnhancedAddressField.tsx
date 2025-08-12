'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, ChevronDown, Check } from 'lucide-react'
import { Property, HomeSaleProperty, InvestmentProperty, PropertiesCollection } from '@/types/property'

interface EnhancedAddressFieldProps {
  property: Property
  propertiesCollection: PropertiesCollection
  onUpdate: (updates: Partial<Property>) => void
  onPropertiesCollectionChange: (collection: PropertiesCollection) => void
  onShowNewPropertyDialog: () => void
}

export default function EnhancedAddressField({ 
  property, 
  propertiesCollection, 
  onUpdate, 
  onPropertiesCollectionChange, 
  onShowNewPropertyDialog 
}: EnhancedAddressFieldProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [tempAddress, setTempAddress] = useState(property.streetAddress)

  // Find if current address matches an existing property
  const existingProperty = useMemo(() => {
    if (!property.streetAddress) return null
    return propertiesCollection.properties.find(
      p => p.id !== property.id && 
           p.streetAddress.toLowerCase() === property.streetAddress.toLowerCase()
    )
  }, [property.streetAddress, property.id, propertiesCollection.properties])

  // Get all properties for the dropdown
  const allProperties = useMemo(() => {
    return propertiesCollection.properties.sort((a, b) => {
      // Sort by name if available, otherwise by address
      const aName = a.name || a.streetAddress || ''
      const bName = b.name || b.streetAddress || ''
      return aName.localeCompare(bName)
    })
  }, [propertiesCollection.properties])

  // Handle address change
  const handleAddressChange = (newAddress: string) => {
    setTempAddress(newAddress)
    onUpdate({ streetAddress: newAddress })
  }

  // Handle property selection from dropdown
  const handlePropertySelect = (selectedProperty: Property) => {
    // Copy common properties that exist on both property types
    const updates: Partial<Property> = {
      streetAddress: selectedProperty.streetAddress,
      name: selectedProperty.name
    }
    
    // Copy calculator mode specific properties
    if (selectedProperty.calculatorMode === 'investment' && property.calculatorMode === 'investment') {
      const investmentProperty = selectedProperty as InvestmentProperty
      
      Object.assign(updates, {
        purchasePrice: investmentProperty.purchasePrice,
        downPayment: investmentProperty.downPayment,
        interestRate: investmentProperty.interestRate,
        loanTerm: investmentProperty.loanTerm,
        annualTaxes: investmentProperty.annualTaxes,
        annualInsurance: investmentProperty.annualInsurance,
        marketValue: investmentProperty.marketValue,
        propertyType: investmentProperty.propertyType,
        yearBuilt: investmentProperty.yearBuilt,
        taxInputType: investmentProperty.taxInputType,
        insuranceInputType: investmentProperty.insuranceInputType,
        downPaymentInputType: investmentProperty.downPaymentInputType,
        grossRentalIncome: investmentProperty.grossRentalIncome,
        rentalIncomeInputType: investmentProperty.rentalIncomeInputType,
        rentalIncomeDiscount: investmentProperty.rentalIncomeDiscount,
        propertyManagementFee: investmentProperty.propertyManagementFee,
        propertyManagementInputType: investmentProperty.propertyManagementInputType,
        includePropertyManagement: investmentProperty.includePropertyManagement,
        maintenanceReserve: investmentProperty.maintenanceReserve,
        maintenanceInputType: investmentProperty.maintenanceInputType,
        includeMaintenance: investmentProperty.includeMaintenance,
        hoaFees: investmentProperty.hoaFees,
        hoaInputType: investmentProperty.hoaInputType,
        includeHoaFees: investmentProperty.includeHoaFees,
        useHomeSaleProceedsAsDownPayment: investmentProperty.useHomeSaleProceedsAsDownPayment,
        selectedHomeSalePropertyId: investmentProperty.selectedHomeSalePropertyId
      })
    } else if (selectedProperty.calculatorMode === 'homeSale' && property.calculatorMode === 'homeSale') {
      const homeSaleProperty = selectedProperty as HomeSaleProperty
      
      Object.assign(updates, {
        salePrice: homeSaleProperty.salePrice,
        outstandingMortgageBalance: homeSaleProperty.outstandingMortgageBalance,
        realtorCommission: homeSaleProperty.realtorCommission,
        realtorCommissionInputType: homeSaleProperty.realtorCommissionInputType,
        closingCosts: homeSaleProperty.closingCosts,
        capitalGainsTaxRate: homeSaleProperty.capitalGainsTaxRate,
        originalPurchasePrice: homeSaleProperty.originalPurchasePrice,
        use1031Exchange: homeSaleProperty.use1031Exchange,
        selectedReplacementPropertyId: homeSaleProperty.selectedReplacementPropertyId
      })
    }
    
    onUpdate(updates)
    setIsDropdownOpen(false)
  }

  // Handle add new property
  const handleAddNew = () => {
    if (!tempAddress.trim()) return
    
    // Set the address first so the dialog has the right address
    onUpdate({ streetAddress: tempAddress })
    
    // Show the new property dialog to let the user choose the type
    onShowNewPropertyDialog()
  }

  // Reset temp address when property changes
  useEffect(() => {
    setTempAddress(property.streetAddress)
  }, [property.streetAddress])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Property Address
      </label>
      
      <div className="relative">
        {/* Address Input with Action Buttons */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={tempAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Enter property address"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
            
            {/* Dropdown Toggle Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {!existingProperty && tempAddress.trim() && (
              <button
                onClick={handleAddNew}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                title="Add new property"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Property Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Switch to existing property:</div>
              {allProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => handlePropertySelect(prop)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    prop.id === property.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {prop.name || prop.streetAddress || 'Unnamed Property'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {prop.streetAddress}
                      </div>
                    </div>
                    {prop.id === property.id && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {existingProperty && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Existing Property Found:</strong> {existingProperty.name || existingProperty.streetAddress}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Click the save button to update this property, or modify the address to create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
