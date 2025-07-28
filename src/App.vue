<template>

</template>
<script setup>
import { ref,onMounted } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

const init = () => { 
  // 创建场景实例
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);  //设置场景背景色
  scene.fog = new THREE.Fog(0xa0a0a0, 80, 120);  //添加雾效

  // 透视相机：视野 75°、宽高比（窗口宽高比）、近平面 0.1、远平面 1000
  const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
  const lengthX = 10, lengthZ = 10, lengthY = 10; //相机初始位置
  camera.position.set(lengthX, lengthY, lengthZ);
  camera.lookAt(0, 0, 0); //让相机看向原点

  // 渲染器
   const renderer = new THREE.WebGLRenderer({
    antialias: true, // 抗锯齿
    alpha: true      // 画布透明（可透到 body 背景）
  });
  renderer.shadowMap.enabled = true  // 开启阴影映射
  renderer.setClearColor(0x000000);  // 设置清除色
  renderer.setSize(window.innerWidth, window.innerHeight); // 画布尺寸
  document.body.appendChild(renderer.domElement); // 挂载

  // 辅助显示:XYZ 轴：红色 X，绿色 Y，蓝色 Z，每轴长度 80
  const axesHelper = new THREE.AxesHelper(80);
  scene.add(axesHelper);

  // 光照（DirectionalLight）
  const light = new THREE.DirectionalLight(0xffffff, 0.8); // 平行光
  const lightC = 40; // 阴影相机半宽
  light.position.set(20, 40, 20);
  light.castShadow = true; // 产生阴影
  // 阴影相机参数：正交投影盒子
  light.shadow.camera.left   = -lightC;
  light.shadow.camera.right  =  lightC;
  light.shadow.camera.top    =  lightC;
  light.shadow.camera.bottom = -lightC;
  light.shadow.camera.near   = 10;
  light.shadow.camera.far    = 180;
  light.shadow.bias          = -0.001; // 防止阴影痤疮
  light.shadow.mapSize.width = 1512;
  light.shadow.mapSize.height = 1512;
  scene.add(light);

  // 可视化阴影相机范围
  const helper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(helper);

  // 自定义地图
  const MAPS=[]
  function initMap(x, y) {
    for (let i = -2; i <= 2; i++) {
      for (let k = -2; k <= 2; k++) {
        let has = true;
        const xy = `${i + x},${k + y}`; // 字符串化坐标作为唯一标识
        // 判断是否已存在
        for (const j in MAPS) {
          if (MAPS[j] === xy) {
            has = false;
            break;
          }
        }
        if (has) {
          MAPS.push(xy);                // 记录已创建
          iniPlane(80 * (i + x), 0, 80 * (k + y)); // 生成地面
        }
      }
    }
  }
  // 自定义地板
  function iniPlane(x, y, z) {
    const planeGeo = new THREE.PlaneGeometry(80, 80);
    const planeMat = new THREE.MeshLambertMaterial({
      color: 0xf1f1f1,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true; // 接收阴影
    plane.castShadow   = true;  // 也能投射（虽然一般地面不需要）
    plane.position.set(x, y, z);
    plane.position.y = -0.01;        // 向下沉一点，避免 z-fighting
    plane.rotation.x = 0.5 * Math.PI; // 旋转 90° 使平面水平

    // 网格辅助线
    const grid = new THREE.GridHelper(80, 40, 0x000000, 0x000000);
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    grid.position.set(x, y, z);
    scene.add(plane);
    scene.add(grid);
  }
  initMap(0, 0); // 初始化地图

  // 轨道控制相机
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT:  THREE.MOUSE.PAN,   // 左键 → 平移
    MIDDLE:THREE.MOUSE.DOLLY, // 中键 → 缩放
    RIGHT: THREE.MOUSE.ROTATE // 右键 → 旋转
  };
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  // 每帧动画
  (function animate() {
      requestAnimationFrame( animate );
      var target=controls.target
      let tarX,tarY
      if(Math.abs(target.x-0)>40){
        if(target.x>0){
          tarX=Math.ceil((target.x-40)/80)
        }else{
          tarX=Math.floor((target.x+40)/80)
        }
      }else{
        tarX=0
      }
      if(Math.abs(target.z-0)>40){
        if(target.z>0){
          tarY=Math.ceil((target.z-40)/80)
        }else{
          tarY=Math.floor((target.z+40)/80)
        }
      }else{
        tarY=0
      }
      initMap(tarX,tarY)
      controls.update();
      renderer.render( scene, camera );
    })()
}

onMounted(() => { 
  init()
})

</script>

<style scoped>
</style>
