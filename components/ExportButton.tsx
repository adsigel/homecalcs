'use client'

import React from 'react'
import { Download, FileText } from 'lucide-react'
import { PropertyData, PITICalculation, DSCRCalculation } from '@/types/property'

interface ExportButtonProps {
  propertyData: PropertyData
  pitiCalculation: PITICalculation
  dscrCalculation?: DSCRCalculation
}

export default function ExportButton({ propertyData, pitiCalculation, dscrCalculation }: ExportButtonProps) {
  const exportData = () => {
    const exportObject = {
      timestamp: new Date().toISOString(),
      propertyData,
      pitiCalculation,
      dscrCalculation,
    }

    const dataStr = JSON.stringify(exportObject, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `homecalcs-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const exportCSV = () => {
    const csvRows = [
      ['Property Analysis Report', ''],
      ['Generated', new Date().toLocaleString()],
      ['', ''],
      ['Property Details', ''],
      ['Address', propertyData.propertyAddress || 'N/A'],
      ['Property Type', propertyData.propertyType],
      ['Year Built', propertyData.yearBuilt],
      ['Purchase Price', `$${propertyData.purchasePrice.toLocaleString()}`],
      ['Down Payment', `$${propertyData.downPayment.toLocaleString()}`],
      ['Interest Rate', `${propertyData.interestRate}%`],
      ['Loan Term', `${propertyData.loanTerm} years`],
      ['Annual Taxes', `$${propertyData.annualTaxes.toLocaleString()}`],
      ['Annual Insurance', `$${propertyData.annualInsurance.toLocaleString()}`],
      ['', ''],
      ['PITI Calculations', ''],
      ['Monthly PITI', `$${pitiCalculation.totalMonthlyPITI.toLocaleString()}`],
      ['Annual PITI', `$${pitiCalculation.annualPITI.toLocaleString()}`],
      ['Loan Amount', `$${pitiCalculation.loanAmount.toLocaleString()}`],
      ['Down Payment %', `${pitiCalculation.downPaymentPercentage.toFixed(1)}%`],
      ['PMI Required', pitiCalculation.requiresPMI ? 'Yes' : 'No'],
      ['', ''],
    ]

    if (dscrCalculation) {
      csvRows.push(
        ['DSCR Analysis', ''],
        ['DSCR Ratio', dscrCalculation.dscrRatio.toFixed(2)],
        ['Monthly Cash Flow', `$${dscrCalculation.monthlyCashFlow.toLocaleString()}`],
        ['Annual Cash Flow', `$${dscrCalculation.annualCashFlow.toLocaleString()}`],
        ['Gross Rental Income', `$${dscrCalculation.grossRentalIncome.toLocaleString()}`],
        ['Net Rental Income', `$${dscrCalculation.discountedRentalIncome.toLocaleString()}`],
        ['Total Annual Expenses', `$${dscrCalculation.totalExpenses.toLocaleString()}`],
        ['', '']
      )
    }

    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homecalcs-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportData}
        className="btn-primary flex items-center gap-2"
        title="Export as JSON"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </button>
      <button
        onClick={exportCSV}
        className="btn-secondary flex items-center gap-2"
        title="Export as CSV"
      >
        <FileText className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  )
} 