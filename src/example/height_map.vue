<template>
  <div id="svg" ref="mainViewport"></div>
  <div id="map" ref="miniViewport"></div>
  <div id="coordinate-display">坐标: (0, 0)</div>
</template>
<script setup>
import { ref,onMounted} from 'vue'
// 引入 Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

onMounted(()=>{
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);  
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const view1Elem = document.getElementById('svg');
    view1Elem.appendChild(renderer.domElement);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    // 相机位置
    camera.position.set(0, 10, 20);
    renderer.shadowMap.enabled = true;
    
    // 创建一个平面网格
    const width = 256; // 地形宽度
    const height = 256; // 地形高度
    const geometry = new THREE.PlaneGeometry(10, 10, width - 1, height - 1);

    // 加载高度图
    const heightMapTexture = new THREE.TextureLoader().load('./height/Terrain_001.jpg', () => {
        // 创建一个 Canvas 来加载和处理图像数据
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        // 加载图像到 Canvas
        const image = new Image();
        image.src = './height/Terrain_001.jpg';
        image.onload = () => {
            context.drawImage(image, 0, 0, width, height);
            const pixelData = context.getImageData(0, 0, width, height).data;

            // 遍历网格的顶点，根据高度图的像素值调整顶点高度
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = Math.floor((positions[i] + 5) * (width - 1) / 10);
                const y = Math.floor((positions[i + 1] + 5) * (height - 1) / 10);
                const index = (y * width + x) * 4;
                const heightValue = pixelData[index] / 255; // 灰度值范围为 0 到 1
                positions[i + 2] = heightValue * 1; // 缩放高度值
            }

            geometry.attributes.position.needsUpdate = true;
        };
    });

    // 加载纹理贴图
    const texture = new THREE.TextureLoader().load('./height/Terrainc_001.jpg');

    // 设置材质
    const material = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        wireframe: false,
        displacementMap: heightMapTexture,
        displacementScale: 5,
        map: texture, // 添加纹理贴图
        roughness: 0.7, // 设置材质的粗糙度
        metalness: 0.1 // 设置材质的金属度
    });

    // 创建网格对象
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotateX(-Math.PI / 2)
    terrain.receiveShadow = true;
    scene.add(terrain);
    const axesHelper = new THREE.AxesHelper(80); // 坐标轴
    scene.add(axesHelper);
    // 添加环境光和点光源
    const ambientLight = new THREE.AmbientLight(0xffffff,1);
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 1); // 平行光

    light.position.set(-80, 140, -80);
    light.castShadow = true; // 产生阴影
    // 设置阴影相机参数
    light.shadow.camera.left   = -40;
    light.shadow.camera.right  =  40;
    light.shadow.camera.top    =  40;
    light.shadow.camera.bottom = -40;
    light.shadow.camera.near   = 10;
    light.shadow.camera.far    = 180;
    light.shadow.bias          = -0.001; // 防止阴影痤疮
    light.shadow.mapSize.width = 1512;
    light.shadow.mapSize.height = 1512;
    scene.add(light);

    // 可视化阴影相机范围
    const helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})


</script>

<style scoped>
#map{
  width: 150px;
  height: 150px;
  bottom: 10px;
  right: 10px;
  border-radius: 50%;
  position: absolute;
}
#coordinate-display {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}
</style>
