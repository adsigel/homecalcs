'use client'

import { useState, useEffect } from 'react'
import { Property, PropertiesCollection } from '@/types/property'
import { 
  FiveYearAssumptions, 
  PortfolioAnalysis, 
  PropertyAnalysis,
  generateKeepVsSwitchAnalysis 
} from '@/utils/fiveYearAnalysis'

interface FiveYearAnalysisProps {
  propertiesCollection: PropertiesCollection
}

export default function FiveYearAnalysis({ propertiesCollection }: FiveYearAnalysisProps) {
  const [assumptions, setAssumptions] = useState<FiveYearAssumptions>({
    homePriceAppreciation: 3.0,
    annualRentGrowth: 2.0,
    annualInflationRate: 2.5
  })
  
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [cashFlowView, setCashFlowView] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    if (propertiesCollection.properties.length > 0) {
      const analysis = generateKeepVsSwitchAnalysis(propertiesCollection.properties, assumptions)
      setPortfolioAnalysis(analysis)
    }
  }, [propertiesCollection.properties, assumptions])

  const handleAssumptionChange = (field: keyof FiveYearAssumptions, value: number) => {
    const newAssumptions = { ...assumptions, [field]: value }
    setAssumptions(newAssumptions)
    
    if (propertiesCollection.properties.length > 0) {
      const analysis = generateKeepVsSwitchAnalysis(propertiesCollection.properties, newAssumptions)
      setPortfolioAnalysis(analysis)
    }
  }

  if (!portfolioAnalysis) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Year Analysis</h3>
        <p className="text-gray-600">Loading analysis...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global Assumptions Panel */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Price Appreciation (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={assumptions.homePriceAppreciation}
              onChange={(e) => handleAssumptionChange('homePriceAppreciation', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Rent Growth (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={assumptions.annualRentGrowth}
              onChange={(e) => handleAssumptionChange('annualRentGrowth', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Inflation Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={assumptions.annualInflationRate}
              onChange={(e) => handleAssumptionChange('annualInflationRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Decision Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Current Property Value</h4>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolioAnalysis.totalPortfolioValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">5-Year Equity Growth</h4>
          <p className="text-2xl font-bold text-green-600">
            +${portfolioAnalysis.totalEquityGrowth.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">5-Year Cash Flow</h4>
          <p className={`text-2xl font-bold ${portfolioAnalysis.totalCumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioAnalysis.totalCumulativeCashFlow >= 0 ? '+' : ''}${portfolioAnalysis.totalCumulativeCashFlow.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Property Analysis Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Keep vs. Switch Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare your current property with alternatives to make an informed decision
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5-Year Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equity Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash Flow
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioAnalysis.properties
                .filter((property): property is PropertyAnalysis => property !== null)
                .map((property, index) => (
                <tr key={property.propertyId} className={index === 0 ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">
                        {property.propertyName}
                      </div>
                      {index === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                      {index > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Alternative
                        </span>
                        )}
                    </div>
                    {!property.hasSufficientData && (
                      <div className="text-xs text-red-600 mt-1">
                        Missing: {property.missingDataFields.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.hasSufficientData 
                      ? `$${property.projections[0]?.homeValue.toLocaleString() || 0}`
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.hasSufficientData 
                      ? `$${property.projections[5]?.homeValue.toLocaleString() || 0}`
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.hasSufficientData 
                      ? `+$${property.totalEquityGrowth.toLocaleString()}`
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.hasSufficientData 
                      ? (
                        <span className={property.totalCumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {property.totalCumulativeCashFlow >= 0 ? '+' : ''}${property.totalCumulativeCashFlow.toLocaleString()}
                        </span>
                      )
                      : 'N/A'
                    }
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Flow Toggle */}
      <div className="flex justify-center">
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setCashFlowView('monthly')}
              className={`px-4 py-2 text-sm font-medium border border-r-0 rounded-l-md transition-colors ${
                cashFlowView === 'monthly'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCashFlowView('annual')}
              className={`px-4 py-2 text-sm font-medium border rounded-r-md transition-colors ${
                cashFlowView === 'annual'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </div>

      {/* Decision Recommendation */}
      {portfolioAnalysis.bestPerformingProperty && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation</h3>
          <div className="space-y-3">
            {portfolioAnalysis.properties[0]?.hasSufficientData && portfolioAnalysis.bestPerformingProperty && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Keep vs. Switch Analysis</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Current Property:</strong> {portfolioAnalysis.properties[0]?.propertyName}
                  </p>
                  <p>
                    <strong>Best Alternative:</strong> {portfolioAnalysis.bestPerformingProperty.propertyName}
                  </p>
                  <p>
                    <strong>Current Property Equity Growth:</strong> +${portfolioAnalysis.properties[0]?.totalEquityGrowth.toLocaleString()}
                  </p>
                  <p>
                    <strong>Alternative Equity Growth:</strong> +${portfolioAnalysis.bestPerformingProperty.totalEquityGrowth.toLocaleString()}
                  </p>
                  <p>
                    <strong>Current Property Cash Flow:</strong> +${portfolioAnalysis.properties[0]?.totalCumulativeCashFlow.toLocaleString()}
                  </p>
                  <p>
                    <strong>Alternative Cash Flow:</strong> +${portfolioAnalysis.bestPerformingProperty.totalCumulativeCashFlow.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    💡 Compare the total equity growth and cash flow projections to make your decision. 
                    Consider factors like location, property type, and your long-term goals.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Property Charts - Coming Soon */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Projections</h3>
        <p className="text-gray-600">
          Individual property charts and year-by-year breakdowns coming in the next iteration!
        </p>
      </div>
    </div>
  )
}
