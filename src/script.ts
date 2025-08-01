import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Pane } from 'tweakpane'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

/**
 * Base
 */
// Debug
const pane = new Pane()

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement
const container = document.querySelector('.container') as HTMLDivElement

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#dcffe5')
const cssScene = new THREE.Scene()

/**
 * Models
 */
const gltfLoader = new GLTFLoader()

gltfLoader.load(
    '/models/well.glb',
    (gltf) => {
        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true
        gltf.scene.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        scene.add(gltf.scene)
    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

pane.addBinding(ambientLight, 'intensity', {
    min: 0,
    max: 10,
    step: 0.001,
    label: 'Ambient Light Intensity'
})

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.shadow.normalBias = 0.027
directionalLight.shadow.bias = - 0.004
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

pane.addBinding(directionalLight, 'intensity', {
    min: 0,
    max: 10,
    step: 0.001,
    label: 'Directional Light Intensity'
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    cssRenderer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 2, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// CSS3D renderer (top layer so the iframe is clickable)
const cssRenderer = new CSS3DRenderer()
cssRenderer.setSize(window.innerWidth, window.innerHeight)
cssRenderer.domElement.style.position = 'absolute'
cssRenderer.domElement.style.top = '0'
container.appendChild(cssRenderer.domElement)
cssRenderer.domElement.style.pointerEvents = 'none'

// A 3D “screen” as DOM (YouTube iframe)
const w = 640, h = 360; // iframe pixel size before scaling into world units
const div = document.createElement('div')
div.style.width = `${w}px`
div.style.height = `${h}px`
div.style.background = '#000'

const iframe = document.createElement('iframe')
iframe.width = '100%'
iframe.height = '100%'
iframe.style.border = '0'
// Start at 29s
iframe.src = 'https://www.youtube.com/embed/GCE41Gp5Uto?enablejsapi=1&rel=0&modestbranding=1&controls=1&start=29&playsinline=1'
div.appendChild(iframe)

const cssObj = new CSS3DObject(div)
// Scale the CSS pixel plane into your world units (tune this factor)
cssObj.scale.set(0.005, 0.005, 0.005)
cssObj.position.set(-3, 1, 0)
cssScene.add(cssObj)

const tick = () => {
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    cssRenderer.render(cssScene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()