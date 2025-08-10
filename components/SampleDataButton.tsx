'use client'

import React from 'react'
import { Database } from 'lucide-react'
import { PropertyData } from '@/types/property'

interface SampleDataButtonProps {
  onLoadSampleData: (data: PropertyData) => void
}

export default function SampleDataButton({ onLoadSampleData }: SampleDataButtonProps) {
  const loadSampleData = () => {
    const sampleData: PropertyData = {
      purchasePrice: 450000,
      downPayment: 90000,
      interestRate: 6.5,
      loanTerm: 30,
      annualTaxes: 5400,
      annualInsurance: 1200,
      marketValue: 450000,
      streetAddress: '123 Sample Street, Anytown, USA',
      propertyType: 'single-family',
      yearBuilt: 2010,
      taxInputType: 'annual',
      insuranceInputType: 'annual',
      downPaymentInputType: 'dollars',
      // DSCR Calculator sample data
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
      hoaInputType: 'annual',
      includeHoaFees: false,
      // Home Sale Calculator sample data
      salePrice: 500000,
      outstandingMortgageBalance: 350000,
      realtorCommission: 6,
      realtorCommissionInputType: 'percentage',
      closingCosts: 8000,
      capitalGainsTaxRate: 15,
      originalPurchasePrice: 400000,
      // Calculator mode
      calculatorMode: 'investment',
      // Use home sale proceeds as down payment
      useHomeSaleProceedsAsDownPayment: false,
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