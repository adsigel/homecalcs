'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { createProperty, addCalculatorMode, switchCalculatorMode, supportsCalculatorMode } from '@/utils/propertyManager'
import { savePropertiesCollection, loadPropertiesCollection } from '@/utils/cloudPropertyManager'
import { onAuthStateChange } from '@/utils/firebase'
import { loadProperties } from '@/utils/propertyManager'
import { trackCalculatorModeToggle, trackPropertyAdded, trackPropertyToggle, trackSaveButtonClicked, trackPropertyRenamed, trackFirstPropertyCreated } from '@/utils/amplitude'
import Header from '@/components/Header'
import GlobalInputsPanel from '@/components/GlobalInputsPanel'
import PITICalculator from '@/components/PITICalculator'
import DSCRCalculator from '@/components/DSCRCalculator'
import HomeSaleCalculator from '@/components/HomeSaleCalculator'
import FiveYearAnalysis from '@/components/FiveYearAnalysis'
import PropertyManager from '@/components/PropertyManager'
import AmplitudeProvider from '@/components/AmplitudeProvider'
import EmptyState from '@/components/EmptyState'

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [propertiesCollection, setPropertiesCollection] = useState<PropertiesCollection>({ properties: [], activePropertyId: null })
  const [activeProperty, setActiveProperty] = useState<Property | null>(null)
  const [calculatorMode, setCalculatorMode] = useState<'investment' | 'homeSale' | 'fiveYearAnalysis'>('investment')
  
  // Modal states
  const [showNewPropertyDialog, setShowNewPropertyDialog] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [streetAddress, setStreetAddress] = useState('')
  const [propertyType, setPropertyType] = useState<'investment' | 'homeSale'>('investment')
  const [marketValue, setMarketValue] = useState('')
  const [yearBought, setYearBought] = useState('')
  const [propertyToRename, setPropertyToRename] = useState<Property | null>(null)

  // Handle properties collection changes
  const handlePropertiesCollectionChange = useCallback((updatedCollection: PropertiesCollection) => {
    setPropertiesCollection(updatedCollection)
    savePropertiesCollection(updatedCollection).catch(error => {
      console.error('Failed to save properties collection:', error)
    })
  }, [])

  // Handle property updates
  const handlePropertyUpdate = (updates: Partial<Property>) => {
    if (!activeProperty) return

    const updatedProperty = { ...activeProperty, ...updates }
    setActiveProperty(updatedProperty)
    
    // Update the property in the collection (but don't auto-save)
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? updatedProperty : p
      )
    }
    
    setPropertiesCollection(updatedCollection)
  }

  // Manual save function
  const handleSaveProperty = () => {
    if (!activeProperty) return
    
    console.log('💾 Saving property:', activeProperty.name)
    
    // Update the property in the collection
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? activeProperty : p
      )
    }
    
    setPropertiesCollection(updatedCollection)
    
    // Save to Firebase
    savePropertiesCollection(updatedCollection).then(success => {
      if (success) {
        console.log('✅ Property saved successfully')
        // Could add a toast notification here
      } else {
        console.error('❌ Failed to save property')
        // Could add an error notification here
      }
    }).catch(error => {
      console.error('❌ Error saving property:', error)
    })
  }

  // Monitor activeProperty changes for debugging
  useEffect(() => {
    console.log('🔄 activeProperty changed to:', activeProperty?.name, 'ID:', activeProperty?.id)
    console.log('🔄 activeProperty data:', activeProperty)
  }, [activeProperty])

  // Monitor calculatorMode changes for debugging
  useEffect(() => {
    console.log('🔄 calculatorMode changed to:', calculatorMode)
  }, [calculatorMode])

  // Handle property selection from address field dropdown
  const handleAddressFieldPropertySelect = (selectedProperty: Property) => {
    console.log('🔄 Switching to property:', selectedProperty.name, 'Mode:', selectedProperty.activeMode)
    console.log('📊 Selected property data:', selectedProperty)
    
    // Set the selected property as active (use the original property data)
    setActiveProperty(selectedProperty)
    
    // Set the calculator mode to match the property's active mode
    setCalculatorMode(selectedProperty.activeMode)
    
    // Update the properties collection to set this as the active property
    const updatedCollection = {
      ...propertiesCollection,
      activePropertyId: selectedProperty.id
    }
    
    setPropertiesCollection(updatedCollection)
    
    // Save the selection to Firebase
    savePropertiesCollection(updatedCollection).catch(error => {
      console.error('❌ Failed to save property selection:', error)
    })
    
    console.log('✅ Property selection complete - activeProperty should now be:', selectedProperty.name)
  }

  // Handle calculator mode changes
  const handleCalculatorModeChange = (mode: 'investment' | 'homeSale' | 'fiveYearAnalysis') => {
    console.log('🔄 Attempting to change calculator mode to:', mode)
    console.log('📊 Current active property:', activeProperty)
    console.log('🔍 Property activeMode before change:', activeProperty?.activeMode)
    console.log('🔍 Current calculatorMode before change:', calculatorMode)
    
    if (!activeProperty) {
      console.error('❌ No active property to change mode for')
      return
    }
    
    // Check if property supports this mode
    const supportsMode = supportsCalculatorMode(activeProperty, mode)
    console.log('🔍 Property supports mode:', mode, 'Result:', supportsMode)
    
    let propertyToSwitch = activeProperty
    
    if (!supportsMode) {
      console.log('➕ Adding calculator mode:', mode, 'to property')
      // Add the mode if it's not supported
      propertyToSwitch = addCalculatorMode(activeProperty, mode)
      console.log('✅ Updated property with new mode:', propertyToSwitch)
    }
    
    // Switch to the mode
    console.log('🔄 Switching to mode:', mode)
    const switchedProperty = switchCalculatorMode(propertyToSwitch, mode)
    console.log('✅ Switched property:', switchedProperty)
    console.log('🔍 Property activeMode after switch:', switchedProperty.activeMode)
    setActiveProperty(switchedProperty)
    setCalculatorMode(mode)
    
    // Track calculator mode toggle with Amplitude
    trackCalculatorModeToggle(calculatorMode, mode, activeProperty.id)
    
    // Update the property in the collection
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? switchedProperty : p
      )
    }
    
    setPropertiesCollection(updatedCollection)
    // Don't auto-save - user will save manually when ready
  }

  // Show new property dialog
  const handleShowNewPropertyDialog = () => {
    setStreetAddress(activeProperty?.streetAddress || '')
    setPropertyType('investment')
    setShowNewPropertyDialog(true)
  }

  // Show manage properties modal
  const handleShowManageModal = () => {
    setShowManageModal(true)
  }

  // Show save dialog
  const handleShowSaveDialog = () => {
    if (activeProperty) {
      setStreetAddress(activeProperty.streetAddress)
    }
    setShowSaveDialog(true)
  }

  // Show rename modal
  const handleShowRenameModal = (property: Property) => {
    setShowRenameModal(true)
  }

  // Create new property
  const createNewProperty = () => {
    if (!streetAddress.trim()) return

    const newProperty = createProperty(
      streetAddress.trim(), 
      streetAddress.trim(), 
      propertyType,
      parseFloat(marketValue.replace(/,/g, '')) || 0,
      parseInt(yearBought) || undefined
    )
    const updatedCollection = {
      properties: [...propertiesCollection.properties, newProperty],
      activePropertyId: newProperty.id
    }
    
    setPropertiesCollection(updatedCollection)
    setActiveProperty(newProperty)
    setCalculatorMode(propertyType)
    setShowNewPropertyDialog(false)
    
    // Reset form fields
    setStreetAddress('')
    setMarketValue('')
    setYearBought('')
    setPropertyType('investment')
    
    // Track property addition with Amplitude
    trackPropertyAdded(newProperty.id, propertyType, propertyType)
    
    // Track if this is the first property
    if (propertiesCollection.properties.length === 0) {
      trackFirstPropertyCreated(newProperty.id, propertyType)
    }
    
    savePropertiesCollection(updatedCollection).catch(error => {
      console.error('Failed to save new property:', error)
    })
  }

  // Save current property
  const saveCurrentProperty = () => {
    if (!activeProperty || !streetAddress.trim()) return

    const updatedProperty = { ...activeProperty, name: streetAddress.trim() }
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === activeProperty.id ? updatedProperty : p
      )
    }
    
    setPropertiesCollection(updatedCollection)
    setActiveProperty(updatedProperty)
    setShowSaveDialog(false)
    
    savePropertiesCollection(updatedCollection).catch(error => {
      console.error('Failed to save property:', error)
    })
  }

  // Rename property
  const handleRenameProperty = () => {
    if (!propertyToRename || !streetAddress.trim()) return

    const updatedProperty = { ...propertyToRename, name: streetAddress.trim() }
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === propertyToRename.id ? updatedProperty : p
      )
    }
    
    // Track property rename with Amplitude
    trackPropertyRenamed(
      propertyToRename.id,
      propertyToRename.name || 'Unnamed Property',
      streetAddress.trim()
    )
    
    setPropertiesCollection(updatedCollection)
    if (activeProperty?.id === propertyToRename.id) {
      setActiveProperty(updatedProperty)
    }
    setShowRenameModal(false)
    
    savePropertiesCollection(updatedCollection).catch(error => {
      console.error('Failed to save renamed property:', error)
    })
  }

  // Handle property selection from property manager
  const handlePropertySelect = (property: Property) => {
    const previousPropertyId = activeProperty?.id
    setActiveProperty(property)
    setCalculatorMode(property.activeMode)
    setPropertiesCollection(prev => ({ ...prev, activePropertyId: property.id }))
    
    // Track property toggle with Amplitude
    if (previousPropertyId) {
      trackPropertyToggle(previousPropertyId, property.id, property.activeMode)
    }
  }

  // Handle property deletion
  useEffect(() => {
    if (propertiesCollection.properties.length === 0) return
    
    // If active property was deleted, set first available as active
    if (!propertiesCollection.properties.find(p => p.id === propertiesCollection.activePropertyId)) {
      const firstProperty = propertiesCollection.properties[0]
      setActiveProperty(firstProperty)
      setCalculatorMode(firstProperty.activeMode)
      setPropertiesCollection(prev => ({ ...prev, activePropertyId: firstProperty.id }))
    }
  }, [propertiesCollection.properties])

  // Initialize storage and authentication
  useEffect(() => {
    const initializeStorage = async () => {
      console.log('🔄 Starting authentication initialization...')
      setIsHydrated(true)
      
      const unsubscribe = onAuthStateChange(async (user) => {
        if (user) {
          console.log('✅ User authenticated:', user.email)
          console.log('👤 User ID:', user.uid)
          
          const loaded = await loadPropertiesCollection()
          if (loaded) {
            setPropertiesCollection(loaded)
            if (loaded.properties.length === 0) {
              const defaultProperty = createProperty('New Property', '', 'investment')
              const newCollection = { properties: [defaultProperty], activePropertyId: defaultProperty.id }
              setPropertiesCollection(newCollection)
              savePropertiesCollection(newCollection).catch(error => {
                console.error('❌ Failed to save default property:', error)
              })
              setActiveProperty(defaultProperty)
              setCalculatorMode(defaultProperty.activeMode)
            } else if (loaded.activePropertyId) {
              const active = loaded.properties.find((p: Property) => p.id === loaded.activePropertyId)
              if (active) {
                setActiveProperty(active)
                setCalculatorMode(active.activeMode)
              }
            }
          } else {
            console.error('❌ Failed to load properties collection')
            console.log('🔄 Falling back to localStorage...')
            const loaded = loadProperties()
            setPropertiesCollection(loaded)
            if (loaded.properties.length > 0 && loaded.activePropertyId) {
              const active = loaded.properties.find((p: Property) => p.id === loaded.activePropertyId)
              if (active) {
                setActiveProperty(active)
                setCalculatorMode(active.activeMode)
              }
            }
          }
        } else {
          console.log('👤 No user authenticated, using localStorage...')
          const loaded = loadProperties()
          setPropertiesCollection(loaded)
          if (loaded.properties.length > 0 && loaded.activePropertyId) {
            const active = loaded.properties.find((p: Property) => p.id === loaded.activePropertyId)
            if (active) {
              setActiveProperty(active)
              setCalculatorMode(active.activeMode)
            }
          }
        }
      })
      return () => unsubscribe()
    }
    initializeStorage()
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HomeCalcs...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AmplitudeProvider />
      <div className="min-h-screen bg-gray-50">
        <Header
        onShowManageModal={handleShowManageModal}
        onAuthStateChange={(user: any) => {
          console.log('Auth state changed:', user?.email || 'Signed out')
        }}
      />
      
      <main className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
        {!activeProperty ? (
          <EmptyState onShowNewPropertyDialog={handleShowNewPropertyDialog} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Calculator Inputs */}
          <div className="lg:col-span-1">
            {activeProperty && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Property Inputs</h2>
                    <p className="text-sm text-gray-600">Enter your property details and financial information</p>
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={() => {
                      // Track save button click with Amplitude
                      trackSaveButtonClicked(activeProperty.id, calculatorMode, true)
                      handleSaveProperty()
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-[80%] rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    title="Save all changes to this property"
                  >
                    Save
                  </button>
                </div>
                
                {/* Calculator Mode Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculator Mode</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCalculatorModeChange('investment')}
                      className={`px-4 py-2 rounded-md font-medium text-[90%] transition-colors ${
                        calculatorMode === 'investment'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      Investment Analysis
                    </button>
                    <button
                      onClick={() => handleCalculatorModeChange('homeSale')}
                      className={`px-4 py-2 rounded-md font-medium text-[90%] transition-colors ${
                        calculatorMode === 'homeSale'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                    >
                      Sale Analysis
                    </button>
                    <button
                      onClick={() => handleCalculatorModeChange('fiveYearAnalysis')}
                      className={`px-4 py-2 rounded-md font-medium text-[90%] transition-colors ${
                        calculatorMode === 'fiveYearAnalysis'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                    >
                      5-Year Analysis
                    </button>
                  </div>
                </div>
                {/* Debug info */}
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <strong>Debug:</strong> calculatorMode: {calculatorMode}, activeProperty.activeMode: {activeProperty?.activeMode}
                </div>
                <GlobalInputsPanel
                  property={activeProperty}
                  onUpdate={handlePropertyUpdate}
                  propertiesCollection={propertiesCollection}
                  onPropertiesCollectionChange={handlePropertiesCollectionChange}
                  onShowNewPropertyDialog={handleShowNewPropertyDialog}
                  calculatorMode={calculatorMode}
                  onPropertySelect={handleAddressFieldPropertySelect}
                />
              </>
            )}
          </div>

          {/* Right Column - Calculator Results */}
          {activeProperty && (
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculation Results</h2>
                <p className="text-sm text-gray-600">View your financial analysis and projections</p>
              </div>
              <div className="space-y-6">
                {calculatorMode === 'investment' && (
                  <>
                    <PITICalculator
                      property={activeProperty}
                      onUpdate={handlePropertyUpdate}
                      propertiesCollection={propertiesCollection}
                      calculatorMode={calculatorMode}
                    />
                    <DSCRCalculator
                      property={activeProperty}
                      onUpdate={handlePropertyUpdate}
                      calculatorMode={calculatorMode}
                      propertiesCollection={propertiesCollection}
                    />
                  </>
                )}
                {calculatorMode === 'homeSale' && (
                  <HomeSaleCalculator
                    property={activeProperty}
                    propertiesCollection={propertiesCollection}
                  />
                )}
                {calculatorMode === 'fiveYearAnalysis' && (
                  <FiveYearAnalysis propertiesCollection={propertiesCollection} />
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </main>

      {/* New Property Dialog */}
      {showNewPropertyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter street address"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Value</label>
                <input
                  type="text"
                  value={marketValue}
                  onChange={(e) => setMarketValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter market value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Bought</label>
                <input
                  type="number"
                  value={yearBought}
                  onChange={(e) => setYearBought(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter year purchased"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Calculator Mode</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as 'investment' | 'homeSale')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="investment">Investment Property</option>
                  <option value="homeSale">Home Sale</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewPropertyDialog(false)
                  // Reset form fields
                  setStreetAddress('')
                  setMarketValue('')
                  setYearBought('')
                  setPropertyType('investment')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewProperty}
                disabled={!streetAddress.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Create Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Properties Modal */}
      {showManageModal && (
        <PropertyManager
          propertiesCollection={propertiesCollection}
          onPropertiesCollectionChange={handlePropertiesCollectionChange}
          onPropertySelect={handlePropertySelect}
          onShowRenameModal={handleShowRenameModal}
          onClose={() => setShowManageModal(false)}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter street address"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentProperty}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Property Modal */}
      {showRenameModal && propertyToRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Rename Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter new property name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameProperty}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Rename Property
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
} 