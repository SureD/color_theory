<template>
  <div>
    <div ref="container"></div>
    <button @click="toggleView">Toggle View</button>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { onMounted, ref } from 'vue'
import ColorSensitivity from '@/utils/ColorSensitivity.ts' // Adjust the import path as needed

export default {
  name: 'ColorSensitivityView',
  setup() {
    const container = ref(null)
    let scene, camera, renderer, controls
    let currentView = 'sensitivity'
    let font

    onMounted(() => {
      loadFont().then(() => {
        initThreeJS()
        drawSensitivityView()
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

    function toggleView() {
      scene.clear()
      if (currentView === 'sensitivity') {
        currentView = 'colorSpace'
        drawColorSpaceView()
      } else {
        currentView = 'sensitivity'
        drawSensitivityView()
      }
    }

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

    function drawSensitivityView() {
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)
      controls.enableRotate = false
      drawAxes()
      drawColorSensitivityCurves()
    }

    function drawColorSpaceView() {
      camera.position.set(5, 5, 5)
      camera.lookAt(0, 0, 0)
      controls.enableRotate = true
      drawColorCube()
    }

    function drawColorCube() {
      const cubeSize = 2
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      // Add color vertices
      const vertices = [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 1]
      ]

      vertices.forEach(([r, g, b]) => {
        const sphereGeometry = new THREE.SphereGeometry(0.05)
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphere.position.set(
          r * cubeSize - cubeSize / 2,
          g * cubeSize - cubeSize / 2,
          b * cubeSize - cubeSize / 2
        )
        scene.add(sphere)
      })

      // Add axis labels
      addLabel('R', new THREE.Vector3(cubeSize / 2 + 0.2, -cubeSize / 2, -cubeSize / 2))
      addLabel('G', new THREE.Vector3(-cubeSize / 2, cubeSize / 2 + 0.2, -cubeSize / 2))
      addLabel('B', new THREE.Vector3(-cubeSize / 2, -cubeSize / 2, cubeSize / 2 + 0.2))
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
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.2,
        height: 0.01
      })

      const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const textMesh = new THREE.Mesh(textGeometry, material)

      textMesh.position.copy(position)

      if (isVertical) {
        textMesh.rotation.z = -Math.PI / 2
      }

      scene.add(textMesh)
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

    return { container, toggleView }
  }
}
</script>

<style scoped>
.human-sensitivity {
  display: inline-block;
}
</style>
