'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { Plus, ChevronDown, Check } from 'lucide-react'

interface EnhancedAddressFieldProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
  propertiesCollection: PropertiesCollection
  onShowNewPropertyDialog: () => void
  onPropertySelect: (property: Property) => void
}

export default function EnhancedAddressField({ 
  property, 
  onUpdate, 
  propertiesCollection,
  onShowNewPropertyDialog,
  onPropertySelect
}: EnhancedAddressFieldProps) {
  const [tempAddress, setTempAddress] = useState(property.streetAddress)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Update tempAddress when property changes
  useEffect(() => {
    setTempAddress(property.streetAddress)
  }, [property.streetAddress])

  // Find existing property with this address
  const existingProperty = useMemo(() => {
    return propertiesCollection.properties.find(p => 
      p.id !== property.id && 
      p.streetAddress.toLowerCase() === tempAddress.toLowerCase()
    )
  }, [tempAddress, propertiesCollection.properties, property.id])

  // Get all properties for the dropdown
  const allProperties = useMemo(() => {
    return propertiesCollection.properties.filter(p => p.id !== property.id)
  }, [propertiesCollection.properties, property.id])

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setTempAddress(value)
    onUpdate({ streetAddress: value })
  }

  // Handle property selection from dropdown
  const handlePropertySelect = (selectedProperty: Property) => {
    console.log('🔍 EnhancedAddressField - Property selected:', selectedProperty.name)
    console.log('🔍 EnhancedAddressField - Property data:', selectedProperty)
    
    // Switch to the selected property instead of copying data
    onPropertySelect(selectedProperty)
    
    // Update the temp address to match the selected property
    setTempAddress(selectedProperty.streetAddress)
    
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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Property Address
      </label>
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={tempAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              onClick={() => allProperties.length > 0 && setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
              placeholder="Enter street address"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
            
            {/* Dropdown Indicator */}
            {allProperties.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            )}
          </div>
          
          {/* Add New Property Button */}
          <button
            type="button"
            onClick={handleAddNew}
            className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            title="Add new property with this address"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && allProperties.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {allProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => handlePropertySelect(prop)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{prop.name || 'Unnamed Property'}</div>
                      <div className="text-sm text-gray-500">{prop.streetAddress}</div>
                      <div className="text-xs text-gray-400">
                        {prop.activeMode === 'investment' ? 'Investment Property' : 'Home Sale Property'}
                      </div>
                    </div>
                    {existingProperty?.id === prop.id && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {/* {existingProperty && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
          ✓ Found existing property: {existingProperty.name || 'Unnamed'} 
          ({existingProperty.activeMode === 'investment' ? 'Investment' : 'Home Sale'})
        </div>
      )}
      
      {tempAddress && !existingProperty && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
          This appears to be a new address. Click the + button to create a new property.
        </div>
      )} */}
    </div>
  )
}
