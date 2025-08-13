'use client'

import { useEffect } from 'react'
import { initAmplitude } from '@/utils/amplitude'

export default function AmplitudeProvider() {
  useEffect(() => {
    initAmplitude()
  }, [])

  return null
}
