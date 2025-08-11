'use client'

import React, { useState, useEffect } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { 
  loadProperties, 
  saveProperties, 
  addProperty, 
  updateProperty, 
  deleteProperty, 
  setActiveProperty,
  getActiveProperty,
  createHomeSaleProperty,
  createInvestmentProperty
} from '@/utils/propertyManager'
import { Save, FolderOpen, Trash2, Plus, Home, Building2 } from 'lucide-react'

interface PropertyManagerProps {
  activeProperty: Property | null
  onPropertyChange: (property: Property) => void
  onShowNewPropertyDialog: () => void
  onShowManageModal: () => void
  onShowSaveDialog: () => void
  propertiesCollection: PropertiesCollection
  onPropertiesCollectionChange: (collection: PropertiesCollection) => void
}

export default function PropertyManager({ 
  activeProperty, 
  onPropertyChange,
  onShowNewPropertyDialog,
  onShowManageModal,
  onShowSaveDialog,
  propertiesCollection,
  onPropertiesCollectionChange
}: PropertyManagerProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Load properties from localStorage on component mount
  useEffect(() => {
    setIsHydrated(true)
    // Don't call onPropertiesCollectionChange here to avoid loops
    // The parent component already handles loading properties
  }, []) // Empty dependency array - only run once on mount

  const loadProperty = (propertyId: string) => {
    const property = propertiesCollection.properties.find(p => p.id === propertyId)
    if (property) {
      // Just notify the parent about the property change
      // Don't modify the collection here to avoid loops
      onPropertyChange(property)
    }
  }

  const deletePropertyById = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const updatedCollection = deleteProperty(propertiesCollection, propertyId)
      // Let the parent handle the collection update
      onPropertiesCollectionChange(updatedCollection)
    }
  }

  const getPropertyDisplayName = (property: Property) => {
    return property.name || property.streetAddress || 'Unnamed Property'
  }

  const getPropertyTypeIcon = (property: Property) => {
    return property.calculatorMode === 'homeSale' ? 
      <Home className="w-4 h-4 text-blue-600" /> : 
      <Building2 className="w-4 h-4 text-green-600" />
  }

  const getPropertyTypeLabel = (property: Property) => {
    return property.calculatorMode === 'homeSale' ? 'Home Sale' : 'Investment'
  }

  if (!isHydrated) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Property Manager</h3>
        <div className="flex gap-2">
          <button
            onClick={onShowNewPropertyDialog}
            className="btn-secondary flex items-center gap-2"
            title="Create new property"
          >
            <Plus className="w-4 h-4" />
            New Property
          </button>
          <button
            onClick={onShowManageModal}
            className="btn-secondary flex items-center gap-2"
            title="Manage saved properties"
          >
            <FolderOpen className="w-4 h-4" />
            Manage Properties
          </button>
        </div>
      </div>

      {/* Property Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Property
        </label>
        <div className="flex gap-2">
          <select
            value={activeProperty?.id || ''}
            onChange={(e) => loadProperty(e.target.value)}
            className="flex-1 input-field"
          >
            <option value="">-- Select a property --</option>
            {propertiesCollection.properties.map((property) => (
              <option key={property.id} value={property.id}>
                {getPropertyDisplayName(property)} ({getPropertyTypeLabel(property)})
              </option>
            ))}
          </select>
          {activeProperty && (
            <button
              onClick={onShowSaveDialog}
              className={`flex items-center gap-2 ${
                activeProperty.name && activeProperty.streetAddress 
                  ? 'btn-secondary' 
                  : 'btn-primary'
              }`}
              title={
                activeProperty.name && activeProperty.streetAddress 
                  ? "Property is auto-saved. Click to update." 
                  : "Save current property"
              }
            >
              <Save className="w-4 h-4" />
              {activeProperty.name && activeProperty.streetAddress ? 'Update' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Current Property Info */}
      {activeProperty && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getPropertyTypeIcon(activeProperty)}
            <span className="font-medium text-gray-900">{activeProperty.name}</span>
            <span className="text-sm text-gray-500">({getPropertyTypeLabel(activeProperty)})</span>
            {activeProperty.name && activeProperty.streetAddress && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Auto-saved
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {activeProperty.streetAddress || 'No address specified'}
          </div>
        </div>
      )}
    </div>
  )
} 