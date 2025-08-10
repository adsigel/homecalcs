'use client'

import React, { useState, useEffect } from 'react'
import { PropertyData } from '@/types/property'
import { Save, FolderOpen, Trash2, Plus } from 'lucide-react'

interface SavedProperty {
  id: string
  name: string
  address: string
  data: PropertyData
  createdAt: string
  updatedAt: string
}

interface PropertyManagerProps {
  propertyData: PropertyData
  onLoadProperty: (property: PropertyData) => void
  onUpdate: (updates: Partial<PropertyData>) => void
}

export default function PropertyManager({ propertyData, onLoadProperty, onUpdate }: PropertyManagerProps) {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [showManageModal, setShowManageModal] = useState(false)

  // Load saved properties from localStorage on component mount
  useEffect(() => {
    loadSavedProperties()
  }, [])

  // Update selected property when propertyData changes
  useEffect(() => {
    const currentProperty = savedProperties.find(p => 
      p.data.purchasePrice === propertyData.purchasePrice &&
      p.data.marketValue === propertyData.marketValue &&
      p.data.grossRentalIncome === propertyData.grossRentalIncome
    )
    if (currentProperty) {
      setSelectedPropertyId(currentProperty.id)
    }
  }, [propertyData, savedProperties])

  const loadSavedProperties = () => {
    try {
      const saved = localStorage.getItem('homecalcs_properties')
      if (saved) {
        setSavedProperties(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved properties:', error)
    }
  }

  const saveProperty = () => {
    if (!propertyName.trim()) return

    const address = `${propertyData.streetAddress || 'Unknown Address'}`
    const newProperty: SavedProperty = {
      id: Date.now().toString(),
      name: propertyName.trim(),
      address,
      data: { ...propertyData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedProperties = [...savedProperties, newProperty]
    localStorage.setItem('homecalcs_properties', JSON.stringify(updatedProperties))
    setSavedProperties(updatedProperties)
    setSelectedPropertyId(newProperty.id)
    setShowSaveDialog(false)
    setPropertyName('')
  }

  const loadProperty = (propertyId: string) => {
    const property = savedProperties.find(p => p.id === propertyId)
    if (property) {
      onLoadProperty(property.data)
      setSelectedPropertyId(propertyId)
    }
  }

  const deleteProperty = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const updatedProperties = savedProperties.filter(p => p.id !== propertyId)
      localStorage.setItem('homecalcs_properties', JSON.stringify(updatedProperties))
      setSavedProperties(updatedProperties)
      
      if (selectedPropertyId === propertyId) {
        setSelectedPropertyId('')
      }
    }
  }

  const getPropertyDisplayName = (property: SavedProperty) => {
    return property.name || property.address || 'Unnamed Property'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Property Manager</h3>
        <button
          onClick={() => setShowManageModal(true)}
          className="btn-secondary flex items-center gap-2"
          title="Manage saved properties"
        >
          <FolderOpen className="w-4 h-4" />
          Manage Properties
        </button>
      </div>

      {/* Property Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Property
        </label>
        <div className="flex gap-2">
          <select
            value={selectedPropertyId}
            onChange={(e) => loadProperty(e.target.value)}
            className="flex-1 input-field"
          >
            <option value="">-- Select a property --</option>
            {savedProperties.map((property) => (
              <option key={property.id} value={property.id}>
                {getPropertyDisplayName(property)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="btn-primary flex items-center gap-2"
            title="Save current property"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Manage Properties Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Properties</h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {savedProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No saved properties yet</p>
                  <p className="text-sm">Save your first property to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        selectedPropertyId === property.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {getPropertyDisplayName(property)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {property.address}
                        </div>
                        <div className="text-xs text-gray-400">
                          Updated: {new Date(property.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            loadProperty(property.id)
                            setShowManageModal(false)
                          }}
                          className="btn-primary text-sm px-3 py-1"
                          title="Load this property"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteProperty(property.id)}
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
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Enter property name"
                  className="input-field w-full"
                  autoFocus
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Address: {propertyData.streetAddress || 'Not specified'}</p>
                <p>Purchase Price: ${propertyData.purchasePrice?.toLocaleString() || 'Not specified'}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveProperty}
                  disabled={!propertyName.trim()}
                  className="btn-primary flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 