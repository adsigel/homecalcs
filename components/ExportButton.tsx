'use client'

import React from 'react'
import { Download, FileText } from 'lucide-react'
import { Property } from '@/types/property'

interface ExportButtonProps {
  property: Property
}

export default function ExportButton({ property }: ExportButtonProps) {
  const exportToCSV = () => {
    // Create CSV content
    const csvContent = [
      ['Property Name', property.name || 'Unnamed Property'],
      ['Street Address', property.streetAddress || ''],
      ['Property Type', property.propertyType || ''],
      ['Year Bought', property.yearBought || ''],
      ['Purchase Price', property.purchasePrice || ''],
              ['Original Purchase Price', property.originalPurchasePrice || property.purchasePrice || ''],
      ['Market Value', property.marketValue || ''],
      ['Active Calculator Mode', property.activeMode || ''],
      ['Supported Modes', property.supportedModes.join(', ') || ''],
      ['', ''], // Empty row for spacing
      ['Investment Data', ''],
      ['Down Payment', property.downPayment || ''],
      ['Interest Rate', property.interestRate || ''],
      ['Loan Term', property.loanTerm || ''],
      ['Annual Taxes', property.annualTaxes || ''],
      ['Annual Insurance', property.annualInsurance || ''],
      ['Gross Rental Income', property.grossRentalIncome || ''],
      ['Rental Income Type', property.rentalIncomeInputType || ''],
      ['Rental Income Discount', property.rentalIncomeDiscount || ''],
      ['Property Management Fee', property.propertyManagementFee || ''],
      ['Maintenance Reserve', property.maintenanceReserve || ''],
      ['HOA Fees', property.hoaFees || ''],
      ['', ''], // Empty row for spacing
      ['Home Sale Data', ''],
      ['Sale Price', property.salePrice || ''],
      ['Outstanding Mortgage Balance', property.outstandingMortgageBalance || ''],
      ['Realtor Commission', property.realtorCommission || ''],
      ['Closing Costs', property.closingCosts || ''],
      ['Capital Gains Tax Rate', property.capitalGainsTaxRate || ''],
      ['Use 1031 Exchange', property.use1031Exchange || ''],
      ['QI Fees', property.qiFees || ''],
      ['', ''], // Empty row for spacing
      ['Last Updated', property.lastUpdated || '']
    ]

    // Convert to CSV string
    const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${property.name || 'property'}_export.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    // Create JSON content
    const jsonContent = JSON.stringify(property, null, 2)
    
    // Create and download file
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${property.name || 'property'}_export.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="btn-secondary flex items-center gap-2"
        title="Export to CSV"
      >
        <Download className="w-4 h-4" />
        CSV
      </button>
      <button
        onClick={exportToJSON}
        className="btn-secondary flex items-center gap-2"
        title="Export to JSON"
      >
        <FileText className="w-4 h-4" />
        JSON
      </button>
    </div>
  )
} 