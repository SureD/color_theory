<template>
  <div>
    <div class="frame">
      <div ref="container" style="width: 500px; height: 500px"></div>
      <input
        type="range"
        v-model="selectedWavelength"
        :min="wavelengthRange.min"
        :max="wavelengthRange.max"
        @input="updateWavelengthLine"
      />
      <p>Selected Wavelength: {{ selectedWavelength }} nm</p>
      <p>ColorModelView Component</p>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { onMounted, ref, reactive } from 'vue'
import { ColorModelGenerator } from '@/utils/color_model_genrator'

export default {
  name: 'ColorModelView',
  setup() {
    const container = ref(null)
    let scene, camera, renderer, controls
    let font
    let colorModelGenerator = new ColorModelGenerator()
    const scaleFactor = 5

    const selectedWavelength = ref(550) // Default wavelength
    const wavelengthRange = reactive(colorModelGenerator.getWavelengthRange())
    let wavelengthLine

    onMounted(() => {
      console.log('Component mounted')
      loadFont().then(() => {
        console.log('Font loaded')
        initThreeJS()
        drawColorSpaceModel()
        drawLoctus()
        drawWavelengthLine()
        animate()
      })
    })

    function loadFont() {
      return new Promise((resolve) => {
        const loader = new FontLoader()
        loader.load('src/utils/helvetiker_regular.typeface.json', (loadedFont) => {
          font = loadedFont
          resolve()
        })
      })
    }

    function initThreeJS() {
      console.log('Initializing Three.js')
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff) // White background
      // Add some ambient light to make the scene visible
      const ambientLight = new THREE.AmbientLight(0x404040)
      scene.add(ambientLight)

      const aspect = 1 // Square renderer
      camera = new THREE.PerspectiveCamera(
        75, // Field of view
        aspect,
        0.1,
        1000
      )
      camera.position.set(10, 10, 10)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio) // Adjust for device pixel ratio
      renderer.setSize(500, 500)
      container.value.appendChild(renderer.domElement)

      // Add OrbitControls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableRotate = true // Enable rotation for 3D effect
      controls.enableZoom = true // Enable zooming
      controls.enablePan = true // Enable panning
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }
    }

    function drawLoctus() {
      const wavelengthRange = colorModelGenerator.getWavelengthRange()
      const wavelengths = []
      for (let i = wavelengthRange.min; i <= wavelengthRange.max; i++) {
        wavelengths.push(i)
      }
      const sensitivities = wavelengths.map((wavelength) =>
        colorModelGenerator.wavelengthToSensitivity(wavelength, true)
      )

      const geometry = new THREE.BufferGeometry()
      const positions = []
      const colors = []

      sensitivities.forEach((v, index) => {
        positions.push(v.y * scaleFactor, v.z * scaleFactor, v.x * scaleFactor)
        const color = colorModelGenerator.wavelengthToRGB(wavelengths[index])
        colors.push(color.x, color.y, color.z)
      })

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

      const material = new THREE.LineBasicMaterial({ vertexColors: true })
      const line = new THREE.Line(geometry, material)

      scene.add(line)
      drawPoint([0, 0, 1])
    }

    function drawColorSpaceModel() {
      console.log('Drawing sensitivity view')
      // Draw 3D axes
      const axesHelper = new THREE.AxesHelper(6) // Increased size
      axesHelper.material.linewidth = 3 // Reduced linewidth (note: linewidth > 1 may not work in WebGL)
      axesHelper.setColors(0x00ff00, 0x0000ff, 0xff0000) // Set colors: x-green, y-blue, z-red
      scene.add(axesHelper)

      // Add labels for axes
      const axisLabels = ['Green', 'Blue', 'Red']
      const positions = [
        new THREE.Vector3(5.2, 0, 0),
        new THREE.Vector3(0, 5.2, 0),
        new THREE.Vector3(0, 0, 5.2)
      ]

      axisLabels.forEach((label, index) => {
        const textGeometry = new TextGeometry(label, {
          font: font,
          size: 0.5, // Increased size for better visibility
          height: 0.1 // Increased height for better visibility
        })
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.copy(positions[index])
        scene.add(textMesh)
      })

      // Modify the grid
      const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xcccccc) // Lighter color
      gridHelper.material.opacity = 0.5 // Make it semi-transparent
      gridHelper.material.transparent = true
      gridHelper.position.y = -0.01 // Move it slightly below the axes
      scene.add(gridHelper)
    }

    function drawPoint(positions = []) {
      console.log(positions)
      positions.forEach((position, index) => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32) // Create a small sphere
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Yellow color
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(
          position[0] * scaleFactor,
          position[1] * scaleFactor,
          position[2] * scaleFactor
        )
        scene.add(sphere)

        // Add a label for the point
        const textGeometry = new TextGeometry(`${index}`, {
          font: font,
          size: 0.2,
          height: 0.05
        })
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.set(
          position[0] * scaleFactor + 0.2,
          position[1] * scaleFactor,
          position[2] * scaleFactor
        )
        scene.add(textMesh)
      })
    }

    function drawWavelengthLine() {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({ color: 0x000000 })
      wavelengthLine = new THREE.Line(geometry, material)
      scene.add(wavelengthLine)
      updateWavelengthLine()
    }

    function updateWavelengthLine() {
      const sensitivity = colorModelGenerator.wavelengthToSensitivity(
        selectedWavelength.value,
        true
      )
      const positions = [
        0,
        0,
        0,
        sensitivity.y * scaleFactor,
        sensitivity.z * scaleFactor,
        sensitivity.x * scaleFactor
      ]
      wavelengthLine.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      )
      wavelengthLine.geometry.attributes.position.needsUpdate = true
    }

    function animate() {
      requestAnimationFrame(animate)
      controls.update() // Update controls in the animation loop
      renderer.render(scene, camera)
    }

    return {
      container,
      selectedWavelength,
      wavelengthRange,
      updateWavelengthLine
    }
  }
}
</script>

<style scoped>
.frame {
  border: 2px solid black;
  padding: 10px;
  display: inline-block;
}

.human-sensitivity {
  display: inline-block;
}

input[type='range'] {
  width: 100%;
  margin-top: 10px;
}
</style>
