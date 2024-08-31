<template>
  <div>
    <div class="frame">
      <div ref="container" style="width: 500px; height: 500px"></div>
      <p>ColorModelView Component</p>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { onMounted, ref } from 'vue'
import { ColorModelGenerator } from '@/utils/color_model_genrator'

export default {
  name: 'ColorModelView',
  setup() {
    const container = ref(null)
    let scene, camera, renderer, controls
    let font
    let colorModelGenerator = new ColorModelGenerator()
    const scaleFactor = 5

    onMounted(() => {
      console.log('Component mounted')
      loadFont().then(() => {
        console.log('Font loaded')
        initThreeJS()
        drawColorSpaceModel()
        drawLoctus()
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
      // Add a grid for a more techy look
      const gridHelper = new THREE.GridHelper(10, 10, 0x00ff00, 0x00ff00)
      scene.add(gridHelper)

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
        positions.push(v.x * scaleFactor, v.y * scaleFactor, v.z * scaleFactor)

        // Calculate color based on wavelength
        const t = 1 - index / (wavelengths.length - 1) // Invert t so 0 is red (max wavelength) and 1 is violet (min wavelength)
        let r, g, b

        if (t < 0.2) {
          // Violet to Blue
          r = t / 0.2
          g = 0
          b = 1
        } else if (t < 0.4) {
          // Blue to Cyan
          r = 0
          g = (t - 0.2) / 0.2
          b = 1
        } else if (t < 0.6) {
          // Cyan to Green
          r = 0
          g = 1
          b = 1 - (t - 0.4) / 0.2
        } else if (t < 0.8) {
          // Green to Yellow
          r = (t - 0.6) / 0.2
          g = 1
          b = 0
        } else {
          // Yellow to Red
          r = 1
          g = 1 - (t - 0.8) / 0.2
          b = 0
        }

        colors.push(r, g, b)
      })

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

      const material = new THREE.LineBasicMaterial({ vertexColors: true })
      const line = new THREE.Line(geometry, material)

      scene.add(line)
    }

    function drawColorSpaceModel() {
      console.log('Drawing sensitivity view')
      // Draw 3D axes
      const axesHelper = new THREE.AxesHelper(5)
      axesHelper.material.linewidth = 5 // Increase line width for better visibility
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

      // Add a subtle grid for better depth perception
      const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xcccccc)
      gridHelper.material.opacity = 0.5
      gridHelper.material.transparent = true
      scene.add(gridHelper)
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
.frame {
  border: 2px solid black;
  padding: 10px;
  display: inline-block;
}

.human-sensitivity {
  display: inline-block;
}
</style>
