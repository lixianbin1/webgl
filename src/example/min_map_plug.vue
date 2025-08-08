<template>
  <div id="svg"></div>
  <div id="map"></div>
</template>

<script setup>
/* eslint-disable */
import { onMounted,onBeforeUnmount  } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from '@/utils/OrbitControls.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

/* ---------- 常量 ---------- */
const SIZE = 20
const CHUNK = 4
let frameId = null
/* 纹理缓存 */
const GRASS_TEX = new THREE.TextureLoader().load('/map/grass.png')
GRASS_TEX.wrapS = GRASS_TEX.wrapT = THREE.RepeatWrapping
GRASS_TEX.repeat.set(20, 20)

/* 共享几何体 */
const PLANE_GEO = new THREE.PlaneGeometry(SIZE, SIZE)
PLANE_GEO.rotateX(-Math.PI / 2)

/* ---------- ChunkManager ---------- */
class ChunkManager {
  constructor(scene) {
    this.scene = scene
    this.chunks = new Map() // key = "cx,cz"
  }

  update(centerX, centerZ, radius = 2) {
    const cx = Math.floor(centerX / (CHUNK * SIZE))
    const cz = Math.floor(centerZ / (CHUNK * SIZE))
    const needed = new Set()

    for (let x = cx - radius; x <= cx + radius; x++) {
      for (let z = cz - radius; z <= cz + radius; z++) {
        const key = `${x},${z}`
        needed.add(key)
        if (!this.chunks.has(key)) this.create(x, z)
      }
    }

    for (const [key, chunk] of this.chunks.entries()) {
      if (!needed.has(key)) {
        chunk.dispose()
        this.chunks.delete(key)
      }
    }
  }

  create(cx, cz) {
    /* 0. 底层白色地面（整块接收阴影） */
    const baseGeo = new THREE.PlaneGeometry(CHUNK * SIZE, CHUNK * SIZE)
    baseGeo.rotateX(-Math.PI / 2)
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.receiveShadow = true
    base.position.set((cx + 0.5) * CHUNK * SIZE, -0.01, (cz + 0.5) * CHUNK * SIZE)
    
    this.scene.add(base)

    /* 1. 数据 */
    const tiles = []
    for (let i = 0; i < CHUNK * CHUNK; i++) {
      tiles.push({
        name: `C(${cx},${cz})-T${i}`,
        population: Math.floor(Math.random() * 100)
      })
    }

    /* 2. 实例化网格 */
    const mesh = new THREE.InstancedMesh(
      PLANE_GEO,
      new THREE.MeshBasicMaterial({   // 改为 Basic，不受光
        map: GRASS_TEX,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false 
      }),
      CHUNK * CHUNK
    )
    const m = new THREE.Matrix4()
    for (let dx = 0; dx < CHUNK; dx++) {
      for (let dz = 0; dz < CHUNK; dz++) {
        m.setPosition((cx * CHUNK + dx) * SIZE, 0, (cz * CHUNK + dz) * SIZE)
        mesh.setMatrixAt(dx * CHUNK + dz, m)
      }
    }
    this.scene.add(mesh)

    /* 3. 合并网格线 */
    const grid = this.createMergedGrid(cx, cz)
    this.scene.add(grid)

    /* 4. 保存区块 */
    this.chunks.set(`${cx},${cz}`, {
      cx, cz, tiles,
      dispose: () => {
        base.geometry.dispose()
        base.material.dispose()
        this.scene.remove(base)

        mesh.geometry.dispose()
        mesh.material.dispose()
        this.scene.remove(mesh)
      }
    })
  }

  createMergedGrid(cx, cz) {
    const len = CHUNK * SIZE
    const pts = []
    const startX = cx * len
    const startZ = cz * len
    for (let i = 0; i <= CHUNK; i++) {
      const p = i * SIZE
      pts.push(startX + p, 0, startZ, startX + p, 0, startZ + len)
      pts.push(startX, 0, startZ + p, startX + len, 0, startZ + p)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    const mat = new THREE.LineBasicMaterial({ color: 0x000, transparent: true, opacity: 0.3 })
    const lines = new THREE.LineSegments(geo, mat)
    lines.position.set(startX + len / 2, 0, startZ + len / 2)
    return lines
  }

  /* 读取单格数据 */
  getTile(worldX, worldZ) {
    const cx = Math.floor(worldX / (CHUNK * SIZE))
    const cz = Math.floor(worldZ / (CHUNK * SIZE))
    const chunk = this.chunks.get(`${cx},${cz}`)
    if (!chunk) return null
    const dx = Math.floor((worldX / SIZE) % CHUNK)
    const dz = Math.floor((worldZ / SIZE) % CHUNK)
    return chunk.tiles[dz * CHUNK + dx]
  }
}

/* ---------- 初始化 ---------- */
const init = () => {
  const view1Elem = document.querySelector('#svg')
  const view2Elem = document.querySelector('#map')

  const disposeThree = () => {
    cancelAnimationFrame(frameId)
    renderer.dispose()
    gui.destroy()
  }
  onBeforeUnmount(() => disposeThree()) // 销毁
  
  /* 场景 */
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xa0a0a0)
  scene.fog = new THREE.Fog(0xa0a0a0, 80, 120)

  /* 相机 */
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(0, 50, 0)
  camera.lookAt(0, 0, 0)

  /* 渲染器 */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(window.innerWidth, window.innerHeight)
  view1Elem.appendChild(renderer.domElement)

  /* 光照 */
  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(20, 40, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.camera.left = -40
  dirLight.shadow.camera.right = 40
  dirLight.shadow.camera.top = 40
  dirLight.shadow.camera.bottom = -40
  dirLight.shadow.camera.near = 10
  dirLight.shadow.camera.far = 180
  scene.add(dirLight)

  /* 小地图相机 */
  const miniCam = new THREE.PerspectiveCamera(60, 1, 0.1, 500)
  miniCam.position.set(30, 30, 30)
  miniCam.lookAt(0, 0, 0)

  /* 控制器 */
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.screenSpacePanning = false

  /* Chunk 管理器 */
  const chunkMgr = new ChunkManager(scene)
  const updateChunks = () => {
    chunkMgr.update(controls.target.x, controls.target.z, 2)
  }
  updateChunks()

  /* ---------- OBJ 模型加载 ---------- */
  const roomTex = new THREE.TextureLoader().load('./a1.png')
  roomTex.wrapS = roomTex.wrapT = THREE.RepeatWrapping
  roomTex.repeat.set(4, 4)

  const mtlLoader = new MTLLoader()
  mtlLoader.setPath('obj/')
  mtlLoader.load('room1.mtl', (materials) => {
    materials.preload()
    const objLoader = new OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.setPath('obj/')
    objLoader.load(
      'room1.obj',
      (object) => {
        object.traverse((child) => {
          if (child.isMesh) {
            child.material.map = roomTex
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        object.position.set(0, -6, 0)
        scene.add(object)
      },
      undefined,
      (err) => console.error(err)
    )
  })

  /* ---------- GUI ---------- */
  const gui = new GUI()
  gui.add(camera, 'fov', 1, 180).name('主视野')
  gui.add(miniCam, 'fov', 1, 180).name('小地图FOV')

  /* ---------- 双视口裁剪 ---------- */
  function setScissorForElement(elem) {
    const canvas = renderer.domElement
    const canvasRect = canvas.getBoundingClientRect()
    const elemRect = elem.getBoundingClientRect()
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left
    const left = Math.max(0, elemRect.left - canvasRect.left)
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top
    const top = Math.max(0, elemRect.top - canvasRect.top)
    const width = Math.min(canvasRect.width, right - left)
    const height = Math.min(canvasRect.height, bottom - top)
    const positiveYUpBottom = canvasRect.height - bottom
    renderer.setScissor(left, positiveYUpBottom, width, height)
    renderer.setViewport(left, positiveYUpBottom, width, height)
    return width / height
  }

  /* ---------- 动画循环 ---------- */
  (function animate() {
    frameId = requestAnimationFrame(animate)
    controls.update()
    updateChunks()

    renderer.setScissorTest(true)

    /* 主视口 */
    const aspect1 = setScissorForElement(view1Elem)
    camera.aspect = aspect1
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)

    /* 小地图 */
    const aspect2 = setScissorForElement(view2Elem)
    miniCam.aspect = aspect2
    miniCam.updateProjectionMatrix()
    renderer.render(scene, miniCam)
  })()
}

onMounted(init)
</script>

<style scoped>
#map {
  width: 150px;
  height: 150px;
  bottom: 10px;
  right: 10px;
  border-radius: 50%;
  position: absolute;
}
</style>