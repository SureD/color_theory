<template>
  <div class="human-sensitivity">
    <h1>Human Color Sensitivity</h1>
    <p>
      This graph shows human sensitivity to different wavelengths of light for red, green, and blue
      color receptors.
    </p>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
    <div class="wavelength-slider">
      <input
        type="range"
        :min="xRange[0]"
        :max="xRange[1]"
        v-model.number="selectedWavelength"
        @input="updateWavelength"
        :style="sliderStyle"
      />
      <span>Selected Wavelength: {{ selectedWavelength }} nm</span>
    </div>
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
    },
    yMin: {
      type: Number,
      default: -0.5
    },
    yMax: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      colorTypes: ['red', 'green', 'blue'],
      colorSensitivities: {},
      xRange: [380, 780],
      margin: { top: 40, right: 40, bottom: 100, left: 60 },
      selectedWavelength: 550
    }
  },
  computed: {
    graphWidth() {
      return this.width - this.margin.left - this.margin.right
    },
    graphHeight() {
      return this.height - this.margin.top - this.margin.bottom
    },
    yRange() {
      return [this.yMin, this.yMax]
    },
    sliderStyle() {
      const color = this.wavelengthToColor(this.selectedWavelength)
      return {
        background: `linear-gradient(to right, ${color}, ${color})`,
        WebkitAppearance: 'none'
      }
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

      // Draw legend
      this.drawLegend(ctx)

      // Draw wavelength indicator
      this.drawWavelengthIndicator()
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
      const yStep = (this.yMax - this.yMin) / 10
      for (let y = this.yMin; y <= this.yMax; y += yStep) {
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
      ctx.strokeStyle = this.getColorForType(colorType)
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
    drawLegend(ctx) {
      const legendX = this.width - this.margin.right - 100
      const legendY = this.margin.top + 20
      const lineLength = 20
      const lineSpacing = 25

      this.colorTypes.forEach((colorType, index) => {
        const y = legendY + index * lineSpacing

        ctx.beginPath()
        ctx.strokeStyle = this.getColorForType(colorType)
        ctx.lineWidth = 2
        ctx.moveTo(legendX, y)
        ctx.lineTo(legendX + lineLength, y)
        ctx.stroke()

        ctx.fillStyle = '#000000'
        ctx.font = '14px Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          colorType.charAt(0).toUpperCase() + colorType.slice(1),
          legendX + lineLength + 5,
          y
        )
      })
    },
    drawWavelengthIndicator() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      const x = this.mapX(this.selectedWavelength)

      // Draw vertical line
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.moveTo(x, this.margin.top)
      ctx.lineTo(x, this.height - this.margin.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw wavelength value
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${this.selectedWavelength} nm`, x, this.margin.top - 10)

      // Draw sensitivity values for each color type
      this.colorTypes.forEach((colorType, index) => {
        const sensitivity = this.colorSensitivities[colorType].getYFromX(this.selectedWavelength)
        const y = this.mapY(sensitivity)

        // Draw point
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = this.getColorForType(colorType)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw text background
        const text = `${colorType}: ${sensitivity.toFixed(3)}`
        const textWidth = ctx.measureText(text).width
        const padding = 4
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fillRect(x + 10, y - 10 + index * 20, textWidth + padding * 2, 20)

        // Draw text
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, x + 10 + padding, y + index * 20)
      })
    },
    wavelengthToColor(wavelength) {
      const color = ColorSensitivity.getColor(wavelength)
      return `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`
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
    },
    updateWavelength() {
      this.drawGraph()
      this.drawWavelengthIndicator()
    },
    getColorForType(colorType) {
      const colors = {
        red: 'rgb(255, 0, 0)',
        green: 'rgb(0, 128, 0)',
        blue: 'rgb(0, 0, 255)'
      }
      return colors[colorType] || colorType
    }
  }
}
</script>

<style scoped>
.human-sensitivity {
  display: inline-block;
}

.wavelength-slider {
  margin-top: 20px;
  text-align: center;
}

.wavelength-slider input[type='range'] {
  -webkit-appearance: none;
  width: 80%;
  height: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.wavelength-slider input[type='range']:hover {
  opacity: 1;
}

.wavelength-slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.wavelength-slider input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
</style>
