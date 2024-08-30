export default class ColorSensitivity {
  private colorType: 'red' | 'green' | 'blue' | string
  private xRange: number[]
  private yRange: number[]
  private sensitivityData: { x: number; y: number }[] = []

  constructor(colorType: 'red' | 'green' | 'blue' | string) {
    this.colorType = colorType
    this.xRange = this.getXRange()
    this.yRange = this.getYRange()
    this.loadSensitivityData()
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

  private async loadSensitivityData(): Promise<void> {
    this.sensitivityData = []
  }

  getYFromX(x: number): number {
    switch (this.colorType) {
      case 'red':
        return Math.sin(((x - 380) / 400) * Math.PI)
      case 'green':
        return Math.sin(((x - 400) / 300) * Math.PI)
      case 'blue':
        return Math.sin(((x - 420) / 260) * Math.PI)
      default:
        return 0
    }
  }
}
