import { Color } from 'three'
import { wavelengthData } from './wavelength'

export default class ColorSensitivity {
  private colorType: 'red' | 'green' | 'blue' | string
  private xRange: number[]
  private yRange: number[]
  private static sensitivityData: { x: number; y: number[] }[] = []
  private static wavelengthData: Record<string, { r?: number; g?: number; b?: number }> =
    wavelengthData
  private color: Color

  constructor(colorType: 'red' | 'green' | 'blue' | string) {
    this.colorType = colorType
    this.xRange = this.getXRange()
    this.yRange = this.getYRange()
    this.color = new Color()
    if (ColorSensitivity.sensitivityData.length === 0) {
      this.loadSensitivityData()
    }
  }

  getXRange() {
    switch (this.colorType) {
      case 'red':
        return [380, 780]
      case 'green':
        return [400, 700]
      case 'blue':
        return [420, 680]
      default:
        return [380, 780]
    }
  }

  getYRange() {
    return [0, 1]
  }

  private loadSensitivityData(): void {
    try {
      ColorSensitivity.sensitivityData = Object.entries(ColorSensitivity.wavelengthData).map(
        ([wavelength, values]) => ({
          x: parseInt(wavelength),
          y: [values.r ?? 0, values.g ?? 0, values.b ?? 0]
        })
      )

      // Sort the data by wavelength (x value)
      ColorSensitivity.sensitivityData.sort((a, b) => a.x - b.x)
    } catch (error) {
      console.error('Error processing wavelength data:', error)
      // Fallback to the original method if processing fails
      ColorSensitivity.sensitivityData = []
      for (let x = this.xRange[0]; x <= this.xRange[1]; x += 5) {
        ColorSensitivity.sensitivityData.push({ x, y: [0, 0, 0] })
      }
    }
  }

  getYFromX(x: number): number {
    // Find the two closest data points
    const index = ColorSensitivity.sensitivityData.findIndex((point) => point.x >= x)
    if (index === -1) return 0 // x is out of range

    const lower = ColorSensitivity.sensitivityData[Math.max(0, index - 1)]
    const upper = ColorSensitivity.sensitivityData[index]

    // Interpolate between the two points
    const t = (x - lower.x) / (upper.x - lower.x)
    const colorIndex = this.colorType === 'red' ? 0 : this.colorType === 'green' ? 1 : 2
    return lower.y[colorIndex] + t * (upper.y[colorIndex] - lower.y[colorIndex])
  }

  static getColor(x: number): Color {
    const hue = (x - 380) / 400
    return new Color().setHSL(hue, 1, 0.5)
  }
}
