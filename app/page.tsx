'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import GlobalInputsPanel from '@/components/GlobalInputsPanel'
import PITICalculator from '@/components/PITICalculator'
import DSCRCalculator from '@/components/DSCRCalculator'
import ExportButton from '@/components/ExportButton'
import SampleDataButton from '@/components/SampleDataButton'
import PropertyManager from '@/components/PropertyManager'
import { Property, HomeSaleProperty, InvestmentProperty, PropertiesCollection } from '@/types/property'
import { calculatePITI, calculatePITIWithHomeSaleProceeds } from '@/utils/calculations'
import HomeSaleCalculator from '@/components/HomeSaleCalculator'
import { loadProperties, saveProperties, createInvestmentProperty, createHomeSaleProperty, addProperty } from '@/utils/propertyManager'
import { FolderOpen, Home as HomeIcon, Building2, Trash2 } from 'lucide-react'

export default function Home() {
  const [propertiesCollection, setPropertiesCollection] = useState<PropertiesCollection>({ properties: [], activePropertyId: null })
  const [activeProperty, setActiveProperty] = useState<Property | null>(null)
  const [calculatorMode, setCalculatorMode] = useState<'homeSale' | 'investment'>('investment')
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Modal states
  const [showNewPropertyDialog, setShowNewPropertyDialog] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [propertyType, setPropertyType] = useState<'homeSale' | 'investment'>('investment')

  // Load properties from localStorage on component mount
  useEffect(() => {
    setIsHydrated(true)
    const loaded = loadProperties()
    setPropertiesCollection(loaded)
    
    // If no properties exist, create a default investment property
    if (loaded.properties.length === 0) {
      const defaultProperty = createInvestmentProperty('New Property', '')
      const newCollection = { properties: [defaultProperty], activePropertyId: defaultProperty.id }
      setPropertiesCollection(newCollection)
      saveProperties(newCollection)
      setActiveProperty(defaultProperty)
      setCalculatorMode(defaultProperty.calculatorMode)
    } else if (loaded.activePropertyId) {
      const active = loaded.properties.find(p => p.id === loaded.activePropertyId)
      if (active) {
        setActiveProperty(active)
        setCalculatorMode(active.calculatorMode)
      }
    }
  }, [])

  // Save properties to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      saveProperties(propertiesCollection)
    }
  }, [propertiesCollection, isHydrated])

  // Handle property deletion and active property updates
  useEffect(() => {
    if (!isHydrated) return
    
    // If the active property was deleted, find a new active property
    if (activeProperty && !propertiesCollection.properties.find(p => p.id === activeProperty.id)) {
      if (propertiesCollection.properties.length > 0) {
        // Set the first available property as active
        const newActive = propertiesCollection.properties[0]
        setActiveProperty(newActive)
        setCalculatorMode(newActive.calculatorMode)
      } else {
        // No properties left, create a default one
        const defaultProperty = createInvestmentProperty('New Property', '')
        const newCollection = { properties: [defaultProperty], activePropertyId: defaultProperty.id }
        setPropertiesCollection(newCollection)
        saveProperties(newCollection)
        setActiveProperty(defaultProperty)
        setCalculatorMode(defaultProperty.calculatorMode)
      }
    }
  }, [propertiesCollection, activeProperty, isHydrated])

  const handlePropertyChange = (property: Property) => {
    setActiveProperty(property)
    setCalculatorMode(property.calculatorMode)
    
    // Update the active property ID in the collection
    const updatedCollection = {
      ...propertiesCollection,
      activePropertyId: property.id
    }
    setPropertiesCollection(updatedCollection)
    saveProperties(updatedCollection)
  }

  const handlePropertyUpdate = (updates: Partial<Property>) => {
    if (!activeProperty) return

    const updatedProperty = { ...activeProperty, ...updates } as Property
    setActiveProperty(updatedProperty)
    
    // Update the property in the collection
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? updatedProperty : p
      )
    }
    setPropertiesCollection(updatedCollection)
  }

  // Modal callback functions
  const handleShowNewPropertyDialog = () => setShowNewPropertyDialog(true)
  const handleShowManageModal = () => setShowManageModal(true)
  const handleShowSaveDialog = () => {
    if (!activeProperty) return
    
    // If property already has a name and address, save it directly
    if (activeProperty.name && activeProperty.streetAddress) {
      const updatedCollection = {
        ...propertiesCollection,
        properties: propertiesCollection.properties.map(p => 
          p.id === activeProperty.id ? activeProperty : p
        )
      }
      
      setPropertiesCollection(updatedCollection)
      saveProperties(updatedCollection)
      return
    }
    
    // Otherwise, show the dialog to get a name
    setShowSaveDialog(true)
  }

  const handlePropertiesCollectionChange = useCallback((collection: PropertiesCollection) => {
    setPropertiesCollection(collection)
  }, [])

  const createNewProperty = () => {
    if (!propertyName.trim() || !streetAddress.trim()) return

    let newProperty: Property
    if (propertyType === 'homeSale') {
      newProperty = createHomeSaleProperty(propertyName.trim(), streetAddress.trim())
    } else {
      newProperty = createInvestmentProperty(propertyName.trim(), streetAddress.trim())
    }

    const updatedCollection = addProperty(propertiesCollection, newProperty)
    setPropertiesCollection(updatedCollection)
    saveProperties(updatedCollection)
    
    setActiveProperty(newProperty)
    setCalculatorMode(newProperty.calculatorMode)
    
    setShowNewPropertyDialog(false)
    setPropertyName('')
    setStreetAddress('')
  }

  const saveCurrentProperty = () => {
    if (!activeProperty) return

    // If property already has a name and address, just save it directly
    if (activeProperty.name && activeProperty.streetAddress) {
      const updatedCollection = {
        ...propertiesCollection,
        properties: propertiesCollection.properties.map(p => 
          p.id === activeProperty.id ? activeProperty : p
        )
      }
      
      setPropertiesCollection(updatedCollection)
      saveProperties(updatedCollection)
      setShowSaveDialog(false)
      return
    }

    // Otherwise, require a property name
    if (!propertyName.trim()) return

    const updatedProperty = { ...activeProperty, name: propertyName.trim() }
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? updatedProperty : p
      )
    }
    
    setPropertiesCollection(updatedCollection)
    saveProperties(updatedCollection)
    setActiveProperty(updatedProperty)
    
    setShowSaveDialog(false)
    setPropertyName('')
  }
  
  // Calculate PITI for DSCR calculator (only for investment properties)
  const pitiCalculation = useMemo(() => {
    if (activeProperty?.calculatorMode !== 'investment') return undefined
    
    const investmentProperty = activeProperty as InvestmentProperty
    const calculation = calculatePITIWithHomeSaleProceeds(investmentProperty, propertiesCollection)
    
    // Only return valid PITI calculation if we have meaningful values
    if (calculation.totalMonthlyPITI > 0 && investmentProperty.purchasePrice > 0) {
      return calculation
    }
    return undefined
  }, [activeProperty, propertiesCollection])
  
  // Calculate DSCR if we have rental income (only for investment properties)
  const dscrCalculation = useMemo(() => {
    if (activeProperty?.calculatorMode !== 'investment') return undefined
    
    const investmentProperty = activeProperty as InvestmentProperty
    if (investmentProperty.grossRentalIncome > 0 && pitiCalculation?.totalMonthlyPITI && pitiCalculation.totalMonthlyPITI > 0) {
      const { calculateDSCR } = require('@/utils/calculations')
      return calculateDSCR(investmentProperty, pitiCalculation)
    }
    return undefined
  }, [activeProperty, pitiCalculation])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HomeCalcs</h1>
          <p className="text-lg text-gray-600">Real Estate Investment & Home Sale Calculator</p>
        </header>

        {/* Calculator Navigation */}
        {activeProperty && (
          <div className="mb-6">
            <div className="card">
              <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  calculatorMode === 'investment' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}>
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Investment Property</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  calculatorMode === 'homeSale' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}>
                  <HomeIcon className="w-5 h-5" />
                  <span className="font-medium">Home Sale Property</span>
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                Current Mode: {calculatorMode === 'homeSale' ? 'Home Sale Calculator' : 'Investment Calculator'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Property Manager + Calculator Results */}
          <div className="space-y-8">
            {/* Property Manager */}
            <PropertyManager
              activeProperty={activeProperty}
              onPropertyChange={handlePropertyChange}
              onShowNewPropertyDialog={handleShowNewPropertyDialog}
              onShowManageModal={handleShowManageModal}
              onShowSaveDialog={handleShowSaveDialog}
              propertiesCollection={propertiesCollection}
              onPropertiesCollectionChange={handlePropertiesCollectionChange}
            />

            {/* Calculator Results */}
            {activeProperty && (
              <div className="space-y-6">
                {activeProperty.calculatorMode === 'investment' && (
                  <>
                    <PITICalculator 
                      property={activeProperty as InvestmentProperty} 
                      onUpdate={handlePropertyUpdate}
                      propertiesCollection={propertiesCollection}
                    />
                    <DSCRCalculator 
                      property={activeProperty as InvestmentProperty} 
                      onUpdate={handlePropertyUpdate}
                      pitiCalculation={pitiCalculation}
                    />
                  </>
                )}
                {activeProperty.calculatorMode === 'homeSale' && (
                  <HomeSaleCalculator 
                    property={activeProperty as HomeSaleProperty} 
                    propertiesCollection={propertiesCollection}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Calculator Inputs */}
          {activeProperty && (
            <div>
              <GlobalInputsPanel 
                property={activeProperty} 
                onUpdate={handlePropertyUpdate}
                propertiesCollection={propertiesCollection}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals - rendered at page level to avoid sticky positioning issues */}
      
      {/* New Property Dialog */}
      {showNewPropertyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Create New Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as 'homeSale' | 'investment')}
                  className="input-field w-full"
                >
                  <option value="investment">Investment Property</option>
                  <option value="homeSale">Home Sale Property</option>
                </select>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Enter street address"
                  className="input-field w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createNewProperty}
                  disabled={!propertyName.trim() || !streetAddress.trim()}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewPropertyDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Properties Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
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
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        activeProperty?.id === property.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {property.calculatorMode === 'homeSale' ? 
                          <HomeIcon className="w-4 h-4 text-blue-600" /> : 
                          <Building2 className="w-4 h-4 text-green-600" />
                        }
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {property.name || property.streetAddress || 'Unnamed Property'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {property.streetAddress || 'No address'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Type: {property.calculatorMode === 'homeSale' ? 'Home Sale' : 'Investment'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const foundProperty = propertiesCollection.properties.find(p => p.id === property.id)
                            if (foundProperty) {
                              setActiveProperty(foundProperty)
                              setCalculatorMode(foundProperty.calculatorMode)
                              setShowManageModal(false)
                            }
                          }}
                          className="btn-primary text-sm px-3 py-1"
                          title="Load this property"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this property?')) {
                              const updatedCollection = {
                                ...propertiesCollection,
                                properties: propertiesCollection.properties.filter(p => p.id !== property.id)
                              }
                              setPropertiesCollection(updatedCollection)
                              saveProperties(updatedCollection)
                              
                              if (activeProperty?.id === property.id) {
                                if (updatedCollection.properties.length > 0) {
                                  setActiveProperty(updatedCollection.properties[0])
                                  setCalculatorMode(updatedCollection.properties[0].calculatorMode)
                                } else {
                                  const defaultProperty = createInvestmentProperty('New Property', '')
                                  const newCollection = { properties: [defaultProperty], activePropertyId: defaultProperty.id }
                                  setPropertiesCollection(newCollection)
                                  saveProperties(newCollection)
                                  setActiveProperty(defaultProperty)
                                  setCalculatorMode(defaultProperty.calculatorMode)
                                }
                              }
                            }
                          }}
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

      {/* Save Dialog - Only show for new properties that need names */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Your Property</h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>This property needs a name to be saved. Properties with names and addresses are automatically saved as you make changes.</p>
              </div>
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
              {activeProperty && (
                <div className="text-sm text-gray-600">
                  <p>Type: {activeProperty.calculatorMode === 'homeSale' ? 'Home Sale' : 'Investment'}</p>
                  <p>Address: {activeProperty.streetAddress || 'Not specified'}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={saveCurrentProperty}
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