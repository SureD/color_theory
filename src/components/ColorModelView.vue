<template>
  <div>
    <div class="frame">
      <div ref="container" style="width: 500px; height: 500px"></div>
      <div class="controls">
        <div v-for="color in ['R', 'G', 'B']" :key="color" class="color-control">
          <label>{{ color }}:</label>
          <input
            type="range"
            v-model="primaryWavelengths[color]"
            :min="wavelengthRange.min"
            :max="wavelengthRange.max"
            @input="updatePrimaryTriangle"
          />
          <span>{{ primaryWavelengths[color] }} nm</span>
        </div>
      </div>
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

    const selectedWavelength = ref(550)
    const wavelengthRange = reactive(colorModelGenerator.getWavelengthRange())
    let wavelengthLine

    const primaryWavelengths = reactive({
      R: 700,
      G: 546,
      B: 435
    })
    let primaryTriangle

    onMounted(() => {
      console.log('Component mounted')
      loadFont().then(() => {
        console.log('Font loaded')
        initThreeJS()
        drawColorSpaceModel()
        drawLoctus()
        drawWavelengthLine()
        drawPrimaryTriangle()
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
      scene.background = new THREE.Color(0xffffff)
      const ambientLight = new THREE.AmbientLight(0x404040)
      scene.add(ambientLight)

      const aspect = 1
      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
      camera.position.set(10, 10, 10)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(500, 500)
      container.value.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableRotate = true
      controls.enableZoom = true
      controls.enablePan = true
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
      const axesHelper = new THREE.AxesHelper(6)
      axesHelper.material.linewidth = 3
      axesHelper.setColors(0x00ff00, 0x0000ff, 0xff0000)
      scene.add(axesHelper)

      const axisLabels = ['Green', 'Blue', 'Red']
      const positions = [
        new THREE.Vector3(5.2, 0, 0),
        new THREE.Vector3(0, 5.2, 0),
        new THREE.Vector3(0, 0, 5.2)
      ]

      axisLabels.forEach((label, index) => {
        const textGeometry = new TextGeometry(label, {
          font: font,
          size: 0.5,
          height: 0.1
        })
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.copy(positions[index])
        scene.add(textMesh)
      })

      const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xcccccc)
      gridHelper.material.opacity = 0.5
      gridHelper.material.transparent = true
      gridHelper.position.y = -0.01
      scene.add(gridHelper)
    }

    function drawPoint(positions = []) {
      console.log(positions)
      positions.forEach((position, index) => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(
          position[0] * scaleFactor,
          position[1] * scaleFactor,
          position[2] * scaleFactor
        )
        scene.add(sphere)

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

    function drawPrimaryTriangle() {
      const geometry = new THREE.BufferGeometry()
      primaryTriangle = new THREE.Line(geometry)
      scene.add(primaryTriangle)

      // Create geometries for the lines from origin to each point
      const lineGeometries = [
        new THREE.BufferGeometry(),
        new THREE.BufferGeometry(),
        new THREE.BufferGeometry()
      ]
      primaryTriangle.originLines = lineGeometries.map((geo) => new THREE.Line(geo))
      primaryTriangle.originLines.forEach((line) => scene.add(line))

      updatePrimaryTriangle()
    }

    function updatePrimaryTriangle() {
      const positions = []
      const colors = []
      const originLinePositions = [[], [], []]

      for (let i = 0; i < 3; i++) {
        const color = ['R', 'G', 'B'][i]
        const sensitivity = colorModelGenerator.wavelengthToSensitivity(
          primaryWavelengths[color],
          true
        )
        const position = [
          sensitivity.y * scaleFactor,
          sensitivity.z * scaleFactor,
          sensitivity.x * scaleFactor
        ]
        positions.push(...position)

        const rgbColor = colorModelGenerator.wavelengthToRGB(primaryWavelengths[color])
        colors.push(rgbColor.x, rgbColor.y, rgbColor.z)

        // Add positions for lines from origin to each point
        originLinePositions[i] = [0, 0, 0, ...position]
      }

      // Close the triangle
      positions.push(positions[0], positions[1], positions[2])
      colors.push(colors[0], colors[1], colors[2])

      // Update main triangle
      primaryTriangle.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      )
      primaryTriangle.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      primaryTriangle.geometry.attributes.position.needsUpdate = true
      primaryTriangle.geometry.attributes.color.needsUpdate = true

      // Update material for main triangle
      primaryTriangle.material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      })

      // Update or create mesh for the filled triangle
      if (!primaryTriangle.mesh) {
        primaryTriangle.mesh = new THREE.Mesh(primaryTriangle.geometry, primaryTriangle.material)
        scene.add(primaryTriangle.mesh)
      } else {
        primaryTriangle.mesh.geometry = primaryTriangle.geometry
        primaryTriangle.mesh.material = primaryTriangle.material
      }

      // Update lines from origin to each point
      primaryTriangle.originLines.forEach((line, index) => {
        line.geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(originLinePositions[index], 3)
        )
        line.geometry.attributes.position.needsUpdate = true
        line.material = new THREE.LineBasicMaterial({
          color: new THREE.Color().fromArray(colors.slice(index * 3, index * 3 + 3))
        })
      })
    }

    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    return {
      container,
      selectedWavelength,
      wavelengthRange,
      updateWavelengthLine,
      primaryWavelengths,
      updatePrimaryTriangle
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

.controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.color-control {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input[type='range'] {
  width: 100%;
  margin-top: 5px;
}
</style>
