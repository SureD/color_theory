import { Vector3 } from 'three'
import { wavelengthData, coneData } from './wavelength'

export class ColorModelGenerator {
  private originalWavelengthMap: Map<number, { r: number; g: number; b: number }>
  private wavelengthRange: { min: number; max: number }
  private sortedWavelengths: number[]
  private coneWaveData: Map<number, { r: number; g: number; b: number }>

  constructor() {
    // Store original data
    this.originalWavelengthMap = new Map(
      Object.entries(wavelengthData).map(([key, value]) => [parseInt(key), value])
    )

    // Parse cone data
    this.coneWaveData = this.parseConeData()

    const wavelengths = Array.from(this.originalWavelengthMap.keys())
    this.wavelengthRange = {
      min: Math.min(...wavelengths),
      max: Math.max(...wavelengths)
    }
    this.sortedWavelengths = wavelengths.sort((a, b) => a - b)
  }

  private parseConeData() {
    return new Map(
      coneData.Root.Records.Record.map((record) => [
        record.Field1,
        {
          r: Number(record.Field2),
          g: Number(record.Field3),
          b: Number(record.Field4)
        }
      ])
    )
  }

  getWavelengthRange(): { min: number; max: number } {
    return this.wavelengthRange
  }

  wavelengthToSensitivity(wavelength: number, useNormalized: boolean): Vector3 {
    const sensitivity = this.interpolateWavelength(wavelength, useNormalized)
    const result = new Vector3(sensitivity.r, sensitivity.g, sensitivity.b)
    return result
  }

  private interpolateWavelength(
    wavelength: number,
    useNormalized: boolean
  ): { r: number; g: number; b: number } {
    const wMap = useNormalized ? this.coneWaveData : this.originalWavelengthMap
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
  wavelengthToRGB(wavelength: number): Vector3 {
    return RgbCalculator.calc(wavelength)
  }
}

// https://stackoverflow.com/questions/1472514/convert-light-frequency-to-rgb
export class RgbCalculator {
  private static readonly LEN_MIN = 380
  private static readonly LEN_MAX = 780
  private static readonly LEN_STEP = 5

  private static readonly X = [
    0.00016, 0.000662, 0.002362, 0.007242, 0.01911, 0.0434, 0.084736, 0.140638, 0.204492, 0.264737,
    0.314679, 0.357719, 0.383734, 0.386726, 0.370702, 0.342957, 0.302273, 0.254085, 0.195618,
    0.132349, 0.080507, 0.041072, 0.016172, 0.005132, 0.003816, 0.015444, 0.037465, 0.071358,
    0.117749, 0.172953, 0.236491, 0.304213, 0.376772, 0.451584, 0.529826, 0.616053, 0.705224,
    0.793832, 0.878655, 0.951162, 1.01416, 1.0743, 1.11852, 1.1343, 1.12399, 1.0891, 1.03048,
    0.95074, 0.856297, 0.75493, 0.647467, 0.53511, 0.431567, 0.34369, 0.268329, 0.2043, 0.152568,
    0.11221, 0.081261, 0.05793, 0.040851, 0.028623, 0.019941, 0.013842, 0.009577, 0.006605,
    0.004553, 0.003145, 0.002175, 0.001506, 0.001045, 0.000727, 0.000508, 0.000356, 0.000251,
    0.000178, 0.000126, 0.00009, 0.000065, 0.000046, 0.000033
  ]

  private static readonly Y = [
    0.000017, 0.000072, 0.000253, 0.000769, 0.002004, 0.004509, 0.008756, 0.014456, 0.021391,
    0.029497, 0.038676, 0.049602, 0.062077, 0.074704, 0.089456, 0.106256, 0.128201, 0.152761,
    0.18519, 0.21994, 0.253589, 0.297665, 0.339133, 0.395379, 0.460777, 0.53136, 0.606741, 0.68566,
    0.761757, 0.82333, 0.875211, 0.92381, 0.961988, 0.9822, 0.991761, 0.99911, 0.99734, 0.98238,
    0.955552, 0.915175, 0.868934, 0.825623, 0.777405, 0.720353, 0.658341, 0.593878, 0.527963,
    0.461834, 0.398057, 0.339554, 0.283493, 0.228254, 0.179828, 0.140211, 0.107633, 0.081187,
    0.060281, 0.044096, 0.0318, 0.022602, 0.015905, 0.01113, 0.007749, 0.005375, 0.003718, 0.002565,
    0.001768, 0.001222, 0.000846, 0.000586, 0.000407, 0.000284, 0.000199, 0.00014, 0.000098,
    0.00007, 0.00005, 0.000036, 0.000025, 0.000018, 0.000013
  ]

  private static readonly Z = [
    0.000705, 0.002928, 0.010482, 0.032344, 0.086011, 0.19712, 0.389366, 0.65676, 0.972542, 1.2825,
    1.55348, 1.7985, 1.96728, 2.0273, 1.9948, 1.9007, 1.74537, 1.5549, 1.31756, 1.0302, 0.772125,
    0.57006, 0.415254, 0.302356, 0.218502, 0.159249, 0.112044, 0.082248, 0.060709, 0.04305,
    0.030451, 0.020584, 0.013676, 0.007918, 0.003988, 0.001091, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
  ]

  private static readonly MATRIX_SRGB_D65 = [
    3.2404542, -1.5371385, -0.4985314, -0.969266, 1.8760108, 0.041556, 0.0556434, -0.2040259,
    1.0572252
  ]

  static calc(len: number): Vector3 {
    if (len < RgbCalculator.LEN_MIN || len > RgbCalculator.LEN_MAX) {
      return new Vector3(0, 0, 0)
    }

    len -= RgbCalculator.LEN_MIN
    const index = Math.floor(len / RgbCalculator.LEN_STEP)
    const offset = len - RgbCalculator.LEN_STEP * index

    const x = RgbCalculator.interpolate(RgbCalculator.X, index, offset)
    const y = RgbCalculator.interpolate(RgbCalculator.Y, index, offset)
    const z = RgbCalculator.interpolate(RgbCalculator.Z, index, offset)

    const m = RgbCalculator.MATRIX_SRGB_D65

    let r = m[0] * x + m[1] * y + m[2] * z
    let g = m[3] * x + m[4] * y + m[5] * z
    let b = m[6] * x + m[7] * y + m[8] * z

    r = RgbCalculator.clip(RgbCalculator.gammaCorrect_sRGB(r))
    g = RgbCalculator.clip(RgbCalculator.gammaCorrect_sRGB(g))
    b = RgbCalculator.clip(RgbCalculator.gammaCorrect_sRGB(b))

    return new Vector3(r, g, b)
  }

  private static interpolate(values: number[], index: number, offset: number): number {
    if (offset === 0) {
      return values[index]
    }

    const x0 = index * RgbCalculator.LEN_STEP
    const x1 = x0 + RgbCalculator.LEN_STEP
    const y0 = values[index]
    const y1 = values[index + 1]

    return y0 + (offset * (y1 - y0)) / (x1 - x0)
  }

  private static gammaCorrect_sRGB(c: number): number {
    if (c <= 0.0031308) {
      return 12.92 * c
    }

    const a = 0.055
    return (1 + a) * Math.pow(c, 1 / 2.4) - a
  }

  private static clip(c: number): number {
    return Math.max(0, Math.min(1, c))
  }
}
