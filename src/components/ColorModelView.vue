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

export default {
  name: 'ColorModelView',
  setup() {
    const container = ref(null)
    let scene, camera, renderer, controls
    let font

    onMounted(() => {
      console.log('Component mounted')
      loadFont().then(() => {
        console.log('Font loaded')
        initThreeJS()
        drawColorSpaceModel()
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
      const frustumSize = 10
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

    function drawColorSpaceModel() {
      console.log('Drawing sensitivity view')
      // Draw 3D axes
      const axesHelper = new THREE.AxesHelper(5)
      axesHelper.material.linewidth = 3 // Increase line width for better visibility
      scene.add(axesHelper)

      // Add labels for axes
      const axisLabels = ['X', 'Y', 'Z']
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
      console.log('Animating')
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
