<template>
  <div id="svg"></div>
  <div id="map"></div>
</template>
<script setup>
import { ref,onMounted } from 'vue'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from '@/utils/OrbitControls.js';
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
  document.getElementById('svg').appendChild(renderer.domElement); // 挂载

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

  // 剪刀函数
  function setScissorForElement(elem) {
    const canvas = renderer.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();
  
    // 计算canvas的尺寸
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);
  
    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);
  
    // 设置剪函数以仅渲染一部分场景
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);
  
    // 返回aspect
    return width / height;
  }


  //导入模型
  var texture = new THREE.TextureLoader().load( "./a1.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4, 4 );
  var mtlLoader = new MTLLoader()
  var objLoader=new OBJLoader()
    mtlLoader.setPath('obj/')
    mtlLoader.load('room1.mtl',function(materials){
      materials.preload();
      objLoader.setMaterials(materials)
      objLoader.setPath('obj/')
      objLoader.load('room1.obj',function(object){
        object.traverse(function(child) {
          if(child instanceof THREE.Mesh) {
            child.material.transparent=true;
            child.receiveShadow = true;//接收阴影
            child.castShadow = true;
            child.material.map = texture;
          }
        })
        object.position.set(0,-6,0)
        object.transparent=true;
        object.opacity=0.5
        scene.add(object);
        renderer.render(scene,camera);
      },undefined,function(error){
        console.log(error)
      });
    });


  // 轨道控制相机
  const view1Elem = document.querySelector('#svg');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT:  THREE.MOUSE.PAN,   // 左键 → 平移
    MIDDLE:THREE.MOUSE.DOLLY, // 中键 → 缩放
    RIGHT: THREE.MOUSE.ROTATE // 右键 → 旋转
  };
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  // 可视化相机轨道
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  // 每帧动画
  (function animate() {
    requestAnimationFrame( animate );
    controls.update();
    
    // 启用剪刀函数
    renderer.setScissorTest(true);
    // 渲染主视野
    {
      const view1Elem = document.querySelector('#svg');
      const aspect = setScissorForElement(view1Elem);
      // 用计算出的aspect修改摄像机参数
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();
 
      // 来原视野中不要绘制cameraHelper
      cameraHelper.visible = false;
 
 
      // 渲染
      renderer.render(scene, camera);
    }
 

    
    // 渲染第二台摄像机
    {
      // 小地图相机
      const camera2 = new THREE.PerspectiveCamera(
        60,  // fov
        2,   // aspect
        0.1, // near
        500, // far
      );
      camera2.position.set(40, 10, 30);
      camera2.lookAt(0, 5, 0);
      const view2Elem = document.querySelector('#map');
      const controls2 = new OrbitControls(camera2, view2Elem);
      controls2.target.set(0, 5, 0);
      controls2.update();
      const aspect = setScissorForElement(view2Elem);
 
      // 调整aspect
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();
      // 在第二台摄像机中绘制cameraHelper
      cameraHelper.visible = true;
      renderer.render(scene, camera2);
    }


    // const canvas = renderer.domElement;
    // camera.aspect = canvas.clientWidth / canvas.clientHeight;
    // camera.updateProjectionMatrix();


      var target=controls.target
      let tarX,tarY
      if(Math.abs(target.x-0)>40){
        if(target.x>0){
          tarX=Math.ceil((target.x-40)/80)
        }else{s
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

      // renderer.render( scene, camera );
    })()
}

onMounted(() => { 
  init()
})

</script>

<style scoped>
#map{
  width: 150px;
  height: 150px;
  top: 10px;
  right: 10px;
  border-radius: 50%;
  position: absolute;
}
</style>
