'use client'

import React, { useState, useEffect } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { FolderOpen, Trash2, Home, Building2, Edit3 } from 'lucide-react'

interface PropertyManagerProps {
  propertiesCollection: PropertiesCollection
  onPropertiesCollectionChange: (collection: PropertiesCollection) => void
  onPropertySelect: (property: Property) => void
  onShowRenameModal: (property: Property) => void
  onClose: () => void
}

export default function PropertyManager({ 
  propertiesCollection,
  onPropertiesCollectionChange,
  onPropertySelect,
  onShowRenameModal,
  onClose
}: PropertyManagerProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Load properties from localStorage on component mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const deletePropertyById = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const updatedCollection = {
        ...propertiesCollection,
        properties: propertiesCollection.properties.filter(p => p.id !== propertyId)
      }
      onPropertiesCollectionChange(updatedCollection)
    }
  }

  const getPropertyDisplayName = (property: Property) => {
    return property.name || property.streetAddress || 'Unnamed Property'
  }

  const getPropertyTypeIcon = (property: Property) => {
    return property.activeMode === 'homeSale' ? 
      <Home className="w-4 h-4 text-blue-600" /> : 
      <Building2 className="w-4 h-4 text-green-600" />
  }

  const getPropertyTypeLabel = (property: Property) => {
    return property.activeMode === 'homeSale' ? 'Home Sale' : 'Investment'
  }

  const getSupportedModes = (property: Property) => {
    return property.supportedModes.map(mode => 
      mode === 'homeSale' ? 'Sale' : 'Investment'
    ).join(', ')
  }

  if (!isHydrated) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Manage Properties</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {propertiesCollection.properties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No saved properties yet</p>
              <p className="text-sm">Create your first property to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {propertiesCollection.properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 rounded-lg border transition-colors border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getPropertyTypeIcon(property)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getPropertyDisplayName(property)}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {property.streetAddress || 'No address'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Active Mode: {getPropertyTypeLabel(property)} | Supported: {getSupportedModes(property)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onPropertySelect(property)
                        onClose()
                      }}
                      className="btn-primary text-sm px-3 py-1"
                      title="Load this property"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onShowRenameModal(property)}
                      className="btn-secondary text-sm px-3 py-1"
                      title="Rename this property"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePropertyById(property.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 