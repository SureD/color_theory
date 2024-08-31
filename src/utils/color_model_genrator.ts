import { Vector3, Color } from 'three'
import { wavelengthData } from './wavelength'

export class ColorModelGenerator {
  private originalWavelengthMap: Map<number, { r: number; g: number; b: number }>
  private normalizedWavelengthMap: Map<number, { r: number; g: number; b: number }>
  private wavelengthRange: { min: number; max: number }
  private sortedWavelengths: number[]

  constructor() {
    // Store original data
    this.originalWavelengthMap = new Map(
      Object.entries(wavelengthData).map(([key, value]) => [parseInt(key), value])
    )

    const entries = Array.from(this.originalWavelengthMap.entries())

    // Find min and max values for r, g, b
    const minMax = entries.reduce(
      (acc, [_, value]) => ({
        rMin: Math.min(acc.rMin, value.r),
        rMax: Math.max(acc.rMax, value.r),
        gMin: Math.min(acc.gMin, value.g),
        gMax: Math.max(acc.gMax, value.g),
        bMin: Math.min(acc.bMin, value.b),
        bMax: Math.max(acc.bMax, value.b)
      }),
      {
        rMin: Infinity,
        rMax: -Infinity,
        gMin: Infinity,
        gMax: -Infinity,
        bMin: Infinity,
        bMax: -Infinity
      }
    )

    // Normalize function (updated)
    const normalize = (value: number, min: number, max: number) => {
      if (min === max) return 0 // Handle edge case
      return (value - min) / (max - min)
    }

    // Create normalized data map (updated)
    this.normalizedWavelengthMap = new Map(
      entries.map(([key, value]) => [
        key,
        {
          r: normalize(value.r, minMax.rMin, minMax.rMax),
          g: normalize(value.g, minMax.gMin, minMax.gMax),
          b: normalize(value.b, minMax.bMin, minMax.bMax)
        }
      ])
    )

    const wavelengths = Array.from(this.originalWavelengthMap.keys())
    this.wavelengthRange = {
      min: Math.min(...wavelengths),
      max: Math.max(...wavelengths)
    }
    this.sortedWavelengths = wavelengths.sort((a, b) => a - b)
  }

  getWavelengthRange(): { min: number; max: number } {
    return this.wavelengthRange
  }

  wavelengthToSensitivity(wavelength: number, useNormalized: boolean): Vector3 {
    console.log(wavelength)
    const sensitivity = this.interpolateWavelength(wavelength, useNormalized)
    return new Vector3(sensitivity.g, sensitivity.r, sensitivity.b)
  }

  wavelengthToColor(wavelength: number): Color {
    const hue = (wavelength - 380) / 400
    return new Color().setHSL(hue, 1, 0.5)
  }

  private interpolateWavelength(
    wavelength: number,
    useNormalized: boolean
  ): { r: number; g: number; b: number } {
    const wMap = useNormalized ? this.normalizedWavelengthMap : this.originalWavelengthMap
    const lowerIndex = this.sortedWavelengths.findIndex((w) => w >= wavelength) - 1
    const upperIndex = lowerIndex + 1

    if (lowerIndex < 0) return wMap.get(this.sortedWavelengths[0])!
    if (upperIndex >= this.sortedWavelengths.length)
      return wMap.get(this.sortedWavelengths[this.sortedWavelengths.length - 1])!

    const lowerWavelength = this.sortedWavelengths[lowerIndex]
    const upperWavelength = this.sortedWavelengths[upperIndex]
    const t = (wavelength - lowerWavelength) / (upperWavelength - lowerWavelength)

    const lower = wMap.get(lowerWavelength)!
    const upper = wMap.get(upperWavelength)!

    return {
      r: lower.r + (upper.r - lower.r) * t,
      g: lower.g + (upper.g - lower.g) * t,
      b: lower.b + (upper.b - lower.b) * t
    }
  }
}
