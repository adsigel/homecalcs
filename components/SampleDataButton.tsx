'use client'

import React from 'react'
import { Database } from 'lucide-react'
import { Property } from '@/types/property'

interface SampleDataButtonProps {
  onLoadSampleData: (data: Property) => void
}

export default function SampleDataButton({ onLoadSampleData }: SampleDataButtonProps) {
  const loadSampleData = () => {
    const sampleData: Property = {
      id: 'sample-property',
      name: 'Sample Property',
      streetAddress: '123 Sample Street, Anytown, USA',
      lastUpdated: new Date().toISOString(),
      
      // Shared property details
      purchasePrice: 450000,
      originalPurchasePrice: 400000,
      yearBuilt: 2010,
      propertyType: 'single-family',
      
      // Mortgage details
      outstandingMortgageBalance: 350000,
      interestRate: 6.5,
      loanTerm: 30,
      
      // Tax and insurance
      annualTaxes: 5400,
      annualInsurance: 1200,
      taxInputType: 'dollar',
      insuranceInputType: 'dollar',
      
      // Market value
      marketValue: 450000,
      
      // Calculator modes
      supportedModes: ['investment', 'homeSale'],
      activeMode: 'investment',
      
      // Investment data
      grossRentalIncome: 36000,
      rentalIncomeInputType: 'annual',
      rentalIncomeDiscount: 25,
      propertyManagementFee: 10,
      propertyManagementInputType: 'percentage',
      includePropertyManagement: true,
      maintenanceReserve: 5,
      maintenanceInputType: 'percentage',
      includeMaintenance: true,
      hoaFees: 0,
      hoaInputType: 'dollar',
      includeHoaFees: false,
      downPayment: 90000,
      downPaymentInputType: 'dollar',
      useHomeSaleProceedsAsDownPayment: false,
      selectedHomeSalePropertyId: null,
      
      // Home sale data
      salePrice: 500000,
      realtorCommission: 6,
      realtorCommissionInputType: 'percentage',
      closingCosts: 8000,
      capitalGainsTaxRate: 15,
      use1031Exchange: false,
      selectedReplacementPropertyId: null,
      qiFees: 1500,
    }
    
    onLoadSampleData(sampleData)
  }

  return (
    <button
      onClick={loadSampleData}
      className="btn-secondary flex items-center gap-2"
      title="Load sample data for testing"
    >
      <Database className="w-4 h-4" />
      Load Sample Data
    </button>
  )
} 