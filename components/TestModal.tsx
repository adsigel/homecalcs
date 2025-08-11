import React from 'react'

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          TEST MODAL
        </h2>
        <p className="text-center mb-6 text-gray-700">
          If you can see this, the modal system is working!
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Close Modal
        </button>
      </div>
    </div>
  )
}
