<template>
  <div ref="container"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'
import ColorSensitivity from '@/utils/ColorSensitivity.ts' // Adjust the import path as needed

export default {
  name: 'ColorSensitivityView',
  setup() {
    const container = ref(null)
    let scene, camera, renderer, controls

    onMounted(() => {
      initThreeJS()
      drawAxes()
      drawColorSensitivityCurves()
      animate()
    })

    function initThreeJS() {
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff) // White background

      const aspect = 1 // Square renderer
      const frustumSize = 10
      camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      )
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio) // Adjust for device pixel ratio
      renderer.setSize(500, 500)
      container.value.appendChild(renderer.domElement)

      // Add OrbitControls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableRotate = false // Disable rotation
      controls.screenSpacePanning = true // Enable panning
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }
    }

    function drawAxes() {
      const axesColor = 0x000000 // Black color for axes
      const axesWidth = 2

      // X-axis (wavelength)
      const xAxis = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-4, 0, 0),
          new THREE.Vector3(4, 0, 0)
        ]),
        new THREE.LineBasicMaterial({ color: axesColor, linewidth: axesWidth })
      )
      scene.add(xAxis)

      // Y-axis (sensitivity)
      const yAxis = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-4, -2, 0),
          new THREE.Vector3(-4, 5, 0)
        ]),
        new THREE.LineBasicMaterial({ color: axesColor, linewidth: axesWidth })
      )
      scene.add(yAxis)

      // Add wavelength tick marks and labels
      addWavelengthLabels()

      // Add sensitivity tick marks and labels
      for (let i = -2; i <= 5; i += 1) {
        addTickMark(-4, i, 0.1, false)
        if (i !== 0) {
          // Skip label for y = 0 as it's on the x-axis
          addLabel(i.toString(), new THREE.Vector3(-4.3, i, 0))
        }
      }

      // Add axis labels
      addLabel('Wavelength (nm)', new THREE.Vector3(0, -0.6, 0))
      addLabel('Relative Sensitivity', new THREE.Vector3(-4.6, 1.5, 0), true)
    }

    function addWavelengthLabels() {
      const wavelengths = [400, 500, 600, 700]
      wavelengths.forEach((wavelength) => {
        const x = ((wavelength - 380) / 400) * 8 - 4 // Map 380-780nm to -4 to 4
        addTickMark(x, 0, 0.1, true)
        addLabel(wavelength.toString(), new THREE.Vector3(x, -0.4, 0))
      })
    }

    function addTickMark(x, y, size, isVertical) {
      const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y - (isVertical ? size : 0), 0),
        new THREE.Vector3(x, y + (isVertical ? size : 0), 0),
        new THREE.Vector3(x - (isVertical ? 0 : size), y, 0),
        new THREE.Vector3(x + (isVertical ? 0 : size), y, 0)
      ])
      const tickMark = new THREE.LineSegments(
        tickGeometry,
        new THREE.LineBasicMaterial({ color: 0x000000 })
      )
      scene.add(tickMark)
    }

    function addLabel(text, position, isVertical = false) {
      const canvas = document.createElement('canvas')
      canvas.width = isVertical ? 64 : 128
      canvas.height = isVertical ? 128 : 64
      const context = canvas.getContext('2d')
      context.font = 'bold 48px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = 'black'

      if (isVertical) {
        context.rotate(-Math.PI / 2)
        context.translate(-canvas.height / 2, canvas.width / 2)
      }

      context.fillText(text, isVertical ? 0 : canvas.width / 2, isVertical ? 0 : canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      const material = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(material)
      sprite.position.copy(position)
      sprite.scale.set(isVertical ? 0.375 : 0.375, isVertical ? 0.75 : 0.375, 1) // Adjusted scale for y-axis labels
      scene.add(sprite)
    }

    function drawColorSensitivityCurves() {
      const colors = {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff
      }

      for (const [colorType, hexColor] of Object.entries(colors)) {
        const sensitivity = new ColorSensitivity(colorType)
        const points = []

        for (let wavelength = 380; wavelength <= 780; wavelength++) {
          points.push(
            new THREE.Vector3(
              ((wavelength - 380) / 400) * 8 - 4, // Map 380-780nm to -4 to 4
              sensitivity.getYFromX(wavelength), // Use actual y value without mapping
              0
            )
          )
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color: hexColor })
        const curve = new THREE.Line(geometry, material)
        scene.add(curve)
      }
    }

    function animate() {
      requestAnimationFrame(animate)
      controls.update() // Update controls in the animation loop
      renderer.render(scene, camera)
    }

    return { container }
  }
}
</script>

<style scoped>
.human-sensitivity {
  display: inline-block;
}
</style>
