import { Vector3 } from 'three'
import { wavelengthData } from './wavelength'

export class ColorModelGenerator {
  private wavelengthMap: Map<number, { r: number; g: number; b: number }>
  private wavelengthRange: { min: number; max: number }
  private sortedWavelengths: number[]

  constructor() {
    this.wavelengthMap = new Map(
      Object.entries(wavelengthData).map(([key, value]) => [parseInt(key), value])
    )
    const wavelengths = Array.from(this.wavelengthMap.keys())
    this.wavelengthRange = {
      min: Math.min(...wavelengths),
      max: Math.max(...wavelengths)
    }
    this.sortedWavelengths = Array.from(this.wavelengthMap.keys()).sort((a, b) => a - b)
  }

  getWavelengthRange(): { min: number; max: number } {
    return this.wavelengthRange
  }

  wavelengthToSensitivity(wavelength: number): Vector3 {
    const sensitivity = this.interpolateWavelength(wavelength)
    return new Vector3(sensitivity.r, sensitivity.g, sensitivity.b)
  }

  private interpolateWavelength(wavelength: number): { r: number; g: number; b: number } {
    const lowerIndex = this.sortedWavelengths.findIndex((w) => w >= wavelength) - 1
    const upperIndex = lowerIndex + 1

    if (lowerIndex < 0) return this.wavelengthMap.get(this.sortedWavelengths[0])!
    if (upperIndex >= this.sortedWavelengths.length)
      return this.wavelengthMap.get(this.sortedWavelengths[this.sortedWavelengths.length - 1])!

    const lowerWavelength = this.sortedWavelengths[lowerIndex]
    const upperWavelength = this.sortedWavelengths[upperIndex]
    const t = (wavelength - lowerWavelength) / (upperWavelength - lowerWavelength)

    const lower = this.wavelengthMap.get(lowerWavelength)!
    const upper = this.wavelengthMap.get(upperWavelength)!

    return {
      r: lower.r + (upper.r - lower.r) * t,
      g: lower.g + (upper.g - lower.g) * t,
      b: lower.b + (upper.b - lower.b) * t
    }
  }
}
