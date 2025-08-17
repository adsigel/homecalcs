'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { createProperty, addCalculatorMode, switchCalculatorMode, supportsCalculatorMode } from '@/utils/propertyManager'
import { savePropertiesCollection, loadPropertiesCollection } from '@/utils/cloudPropertyManager'
import { onAuthStateChange } from '@/utils/firebase'
import { loadProperties } from '@/utils/propertyManager'
import { trackCalculatorModeToggle, trackPropertyAdded, trackPropertyToggle, trackSaveButtonClicked, trackPropertyRenamed, trackFirstPropertyCreated } from '@/utils/amplitude'
import { formatNumber } from '@/utils/calculations'
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
  
  // First property modal fields
  const [purchasePrice, setPurchasePrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Format handlers for first property modal
  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '')
    if (value === '') {
      setPurchasePrice('')
    } else {
      const numValue = parseInt(value)
      setPurchasePrice(formatNumber(numValue))
    }
  }
  
  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '')
    if (value === '') {
      setDownPayment('')
    } else {
      const numValue = parseInt(value)
      setDownPayment(formatNumber(numValue))
    }
  }
  
  // Toast notification functions
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000) // Auto-hide after 3 seconds
  }

  // Handle properties collection changes
  const handlePropertiesCollectionChange = useCallback((updatedCollection: PropertiesCollection) => {
    setPropertiesCollection(updatedCollection)
    savePropertiesCollection(updatedCollection).then(success => {
      if (success) {
        showToast('Properties updated successfully!', 'success')
      } else {
        showToast('Failed to save property changes. Please try again.', 'error')
      }
    }).catch(error => {
      console.error('Failed to save properties collection:', error)
      showToast('Error saving property changes. Please try again.', 'error')
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
        showToast('Property saved successfully!', 'success')
      } else {
        console.error('❌ Failed to save property')
        showToast('Failed to save property. Please try again.', 'error')
      }
    }).catch(error => {
      console.error('❌ Error saving property:', error)
      showToast('Error saving property. Please try again.', 'error')
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

  // Show edit address modal
  const handleShowRenameModal = (property: Property) => {
    setPropertyToRename(property)
    setStreetAddress(property.streetAddress)
    setShowRenameModal(true)
  }

  // Create new property
  const createNewProperty = () => {
    if (!streetAddress.trim()) return

    const newProperty = createProperty(
      streetAddress.trim(), 
      streetAddress.trim(), 
      'investment', // Always start with investment mode for first property
      parseFloat(marketValue.replace(/,/g, '')) || 0,
      parseInt(yearBought) || undefined
    )
    
    // If this is the first property, set additional mortgage data
    if (propertiesCollection.properties.length === 0) {
      newProperty.purchasePrice = parseFloat(purchasePrice.replace(/,/g, '')) || 0
      newProperty.downPayment = parseFloat(downPayment.replace(/,/g, '')) || 0
      newProperty.interestRate = parseFloat(interestRate) || 0
      newProperty.loanTerm = 30 // Default to 30 years
      newProperty.marketValue = parseFloat(purchasePrice.replace(/,/g, '')) || 0 // Use purchase price as initial market value
    }
    
    const updatedCollection = {
      properties: [...propertiesCollection.properties, newProperty],
      activePropertyId: newProperty.id
    }
    
    setPropertiesCollection(updatedCollection)
    setActiveProperty(newProperty)
    setCalculatorMode('investment') // Always start with investment calculator
    setShowNewPropertyDialog(false)
    
    // Reset form fields
    setStreetAddress('')
    setMarketValue('')
    setYearBought('')
    setPropertyType('investment')
    setPurchasePrice('')
    setDownPayment('')
    setInterestRate('')
    
    // Track property addition with Amplitude
    trackPropertyAdded(newProperty.id, 'investment', 'investment')
    
    // Track if this is the first property
    if (propertiesCollection.properties.length === 0) {
      trackFirstPropertyCreated(newProperty.id, 'investment')
    }
    
    savePropertiesCollection(updatedCollection).then(success => {
      if (success) {
        showToast('Property created successfully!', 'success')
      } else {
        showToast('Failed to save new property. Please try again.', 'error')
      }
    }).catch(error => {
      console.error('Failed to save new property:', error)
      showToast('Error creating property. Please try again.', 'error')
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

  // Update property address
  const handleRenameProperty = () => {
    if (!propertyToRename || !streetAddress.trim()) return

    const updatedProperty = { ...propertyToRename, streetAddress: streetAddress.trim() }
    const updatedCollection = {
      ...propertiesCollection,
      properties: propertiesCollection.properties.map(p => 
        p.id === propertyToRename.id ? updatedProperty : p
      )
    }
    
    // Track property address update with Amplitude
    trackPropertyRenamed(
      propertyToRename.id,
      propertyToRename.streetAddress || 'Unknown Address',
      streetAddress.trim()
    )
    
    setPropertiesCollection(updatedCollection)
    if (activeProperty?.id === propertyToRename.id) {
      setActiveProperty(updatedProperty)
    }
    setShowRenameModal(false)
    
    savePropertiesCollection(updatedCollection).then(success => {
      if (success) {
        showToast('Property address updated successfully!', 'success')
      } else {
        showToast('Failed to save address update. Please try again.', 'error')
      }
    }).catch(error => {
      console.error('Failed to save address update:', error)
      showToast('Error updating address. Please try again.', 'error')
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setToast(null)}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Property Dialog */}
      {showNewPropertyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {propertiesCollection.properties.length === 0 ? 'Add Your First Property' : 'Create New Property'}
            </h3>
            
            {propertiesCollection.properties.length === 0 ? (
              // First property modal - focused on mortgage basics
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                  <input
                    type="text"
                    value={purchasePrice}
                    onChange={handlePurchasePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter purchase price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (Optional)</label>
                  <input
                    type="text"
                    value={downPayment}
                    onChange={handleDownPaymentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter down payment amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter interest rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Bought (Optional)</label>
                  <input
                    type="number"
                    value={yearBought}
                    onChange={(e) => setYearBought(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter year purchased"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Required fields. We'll start you in the Investment Calculator to see your PITI payments.
                </p>
              </div>
            ) : (
              // Regular property modal for subsequent properties
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
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewPropertyDialog(false)
                  // Reset form fields
                  setStreetAddress('')
                  setMarketValue('')
                  setYearBought('')
                  setPropertyType('investment')
                  setPurchasePrice('')
                  setDownPayment('')
                  setInterestRate('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewProperty}
                disabled={!streetAddress.trim() || (propertiesCollection.properties.length === 0 && (!purchasePrice.trim() || !interestRate.trim()))}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {propertiesCollection.properties.length === 0 ? 'Add Property' : 'Create Property'}
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
                disabled={!streetAddress.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Address Modal */}
      {showRenameModal && propertyToRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Property Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter new street address"
                  autoComplete="off"
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
                disabled={!streetAddress.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Update Address
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
} 