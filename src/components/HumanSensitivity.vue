<template>
  <div class="human-sensitivity">
    <h1>Human Color Sensitivity</h1>
    <p>
      This graph shows human sensitivity to different wavelengths of light for red, green, and blue
      color receptors.
    </p>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import ColorSensitivity from '@/utils/ColorSensitivity'

export default {
  name: 'HumanSensitivity',
  props: {
    width: {
      type: Number,
      default: 700
    },
    height: {
      type: Number,
      default: 550
    }
  },
  data() {
    return {
      colorTypes: ['red', 'green', 'blue'],
      colorSensitivities: {},
      xRange: [380, 780],
      yRange: [0, 1],
      margin: { top: 40, right: 40, bottom: 100, left: 60 }
    }
  },
  computed: {
    graphWidth() {
      return this.width - this.margin.left - this.margin.right
    },
    graphHeight() {
      return this.height - this.margin.top - this.margin.bottom
    }
  },
  mounted() {
    this.initializeColorSensitivities()
    this.drawGraph()
  },
  methods: {
    initializeColorSensitivities() {
      this.colorTypes.forEach((colorType) => {
        const sensitivity = new ColorSensitivity(colorType)
        this.colorSensitivities[colorType] = sensitivity
      })
    },
    drawGraph() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      // Clear canvas
      ctx.clearRect(0, 0, this.width, this.height)

      // Draw grid
      this.drawGrid(ctx)

      // Draw axes and labels
      this.drawAxes(ctx)
      this.drawAxisLabels(ctx)

      // Plot functions for each color type
      this.colorTypes.forEach((colorType) => {
        this.plotFunction(ctx, colorType)
      })

      // Draw color bar
      this.drawColorBar(ctx)
    },
    drawGrid(ctx) {
      ctx.beginPath()
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 0.5

      // Vertical grid lines
      for (let x = 400; x <= 700; x += 50) {
        const canvasX = this.mapX(x)
        ctx.moveTo(canvasX, this.margin.top)
        ctx.lineTo(canvasX, this.height - this.margin.bottom)
      }

      // Horizontal grid lines
      for (let y = 0; y <= 1; y += 0.2) {
        const canvasY = this.mapY(y)
        ctx.moveTo(this.margin.left, canvasY)
        ctx.lineTo(this.width - this.margin.right, canvasY)
      }

      ctx.stroke()
    },
    drawAxes(ctx) {
      ctx.beginPath()
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2

      // X-axis
      ctx.moveTo(this.margin.left, this.height - this.margin.bottom)
      ctx.lineTo(this.width - this.margin.right, this.height - this.margin.bottom)

      // Y-axis
      ctx.moveTo(this.margin.left, this.margin.top)
      ctx.lineTo(this.margin.left, this.height - this.margin.bottom)

      ctx.stroke()

      // Draw tick marks
      this.drawTickMarks(ctx)
    },
    drawTickMarks(ctx) {
      ctx.font = '12px Arial'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // X-axis tick marks
      for (let x = 400; x <= 700; x += 50) {
        const canvasX = this.mapX(x)
        ctx.moveTo(canvasX, this.height - this.margin.bottom)
        ctx.lineTo(canvasX, this.height - this.margin.bottom + 5)
        ctx.fillText(x.toString(), canvasX, this.height - this.margin.bottom + 10)
      }

      // Y-axis tick marks
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let y = 0; y <= 1; y += 0.2) {
        const canvasY = this.mapY(y)
        ctx.moveTo(this.margin.left - 5, canvasY)
        ctx.lineTo(this.margin.left, canvasY)
        ctx.fillText(y.toFixed(1), this.margin.left - 10, canvasY)
      }

      ctx.stroke()
    },
    drawAxisLabels(ctx) {
      ctx.font = 'bold 14px Arial'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'

      // X-axis label
      ctx.fillText('Wavelength (nm)', this.width / 2, this.height - 20)

      // Y-axis label
      ctx.save()
      ctx.translate(20, this.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Relative Sensitivity', 0, 0)
      ctx.restore()
    },
    plotFunction(ctx, colorType) {
      ctx.beginPath()
      ctx.strokeStyle = colorType
      ctx.lineWidth = 2

      const sensitivity = this.colorSensitivities[colorType]

      for (let x = this.xRange[0]; x <= this.xRange[1]; x += 1) {
        const y = sensitivity.getYFromX(x)
        const canvasX = this.mapX(x)
        const canvasY = this.mapY(y)

        if (x === this.xRange[0]) {
          ctx.moveTo(canvasX, canvasY)
        } else {
          ctx.lineTo(canvasX, canvasY)
        }
      }

      ctx.stroke()
    },
    drawColorBar(ctx) {
      const barHeight = 20
      const barTop = this.height - this.margin.bottom + 40
      const barBottom = barTop + barHeight

      for (let x = this.xRange[0]; x <= this.xRange[1]; x++) {
        const canvasX = this.mapX(x)
        ctx.fillStyle = this.wavelengthToColor(x)
        ctx.fillRect(canvasX, barTop, 1, barHeight)
      }

      // Draw border around color bar
      ctx.strokeStyle = '#000000'
      ctx.strokeRect(this.margin.left, barTop, this.graphWidth, barHeight)

      // Add labels
      ctx.fillStyle = '#000000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      for (let x = 400; x <= 700; x += 50) {
        const canvasX = this.mapX(x)
        ctx.fillText(x.toString(), canvasX, barBottom + 5)
      }
    },
    wavelengthToColor(wavelength) {
      let r, g, b
      if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380)
        g = 0
        b = 1
      } else if (wavelength >= 440 && wavelength < 490) {
        r = 0
        g = (wavelength - 440) / (490 - 440)
        b = 1
      } else if (wavelength >= 490 && wavelength < 510) {
        r = 0
        g = 1
        b = -(wavelength - 510) / (510 - 490)
      } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510)
        g = 1
        b = 0
      } else if (wavelength >= 580 && wavelength < 645) {
        r = 1
        g = -(wavelength - 645) / (645 - 580)
        b = 0
      } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1
        g = 0
        b = 0
      } else {
        r = 0
        g = 0
        b = 0
      }

      // Intensity correction
      let factor
      if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380)
      } else if (wavelength >= 420 && wavelength < 701) {
        factor = 1
      } else if (wavelength >= 701 && wavelength <= 780) {
        factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700)
      } else {
        factor = 0
      }

      r = Math.round(255 * Math.pow(r * factor, 0.8))
      g = Math.round(255 * Math.pow(g * factor, 0.8))
      b = Math.round(255 * Math.pow(b * factor, 0.8))

      return `rgb(${r},${g},${b})`
    },
    mapX(x) {
      return (
        this.margin.left +
        ((x - this.xRange[0]) / (this.xRange[1] - this.xRange[0])) * this.graphWidth
      )
    },
    mapY(y) {
      return (
        this.height -
        this.margin.bottom -
        ((y - this.yRange[0]) / (this.yRange[1] - this.yRange[0])) * this.graphHeight
      )
    }
  }
}
</script>

<style scoped>
.human-sensitivity {
  display: inline-block;
}
</style>
