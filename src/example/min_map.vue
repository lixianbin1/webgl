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

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const init = () => {
  // 创建场景实例
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);  //设置场景背景色
  scene.fog = new THREE.Fog(0xa0a0a0, 80, 120);  //添加雾效

  // 透视相机：视野 75°、宽高比（窗口宽高比）、近平面 0.1、远平面 1000
  const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,500);
  const lengthX = 0, lengthZ = 0, lengthY = 50; //相机初始位置
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
  const size = 20; // 地格大小
  const length = 4 // 地图长度
  const MAPS=[]
  function initMap(x, y) {
    for (let i = - length; i <= length; i++) {
      for (let k = - length; k <= length; k++) {
        let has = false;
        const xy = `${i + x},${k + y}`; // 字符串化坐标作为唯一标识
        // 判断是否已存在
        for (const j in MAPS) {
          if (MAPS[j] === xy) {
            has = true;
            break;
          }
        }
        if (!has) {
          MAPS.push(xy);                // 记录已创建
          iniPlane(size * (i + x), 0, size * (k + y)); // 生成地面
        }
      }
    }
  }



  // 自定义地板
  function iniPlane(x, y, z) {
    const loader = new THREE.TextureLoader();
    loader.load('/map/grass.png', (texture) => {
      // 设置重复
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);   // 20×20 个小贴图拼满
      const material = new THREE.MeshToonMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
      });

      const planeGeo = new THREE.PlaneGeometry(size, size); //地板大小
      const plane = new THREE.Mesh(planeGeo, material);
      plane.receiveShadow = true; // 接收阴影
      plane.position.set(x, y, z);
      plane.rotation.x = - 0.5 * Math.PI; // 旋转 90° 使平面水平

      // 网格辅助线
      const grid = new THREE.GridHelper(size, 1, 0x000000, 0x000000);
      grid.material.transparent = true;
      grid.material.opacity = 0.5;
      grid.position.set(x, y, z);
      scene.add(plane);
      scene.add(grid);
    })

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


/* 相机轨道控制 */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT:  THREE.MOUSE.PAN,   // 左键 → 平移
    MIDDLE:THREE.MOUSE.DOLLY, // 中键 → 缩放
    RIGHT: THREE.MOUSE.ROTATE // 右键 → 旋转
  };
  controls.screenSpacePanning = false; // 禁止y轴平移
  controls.enableDamping = true;
  controls.minPolarAngle= Math.PI/8; // 限制角度
  controls.maxPolarAngle= Math.PI/3;
  controls.panSpeed=0.5 // 速度
  controls.rotateSpeed=0.5
  controls.update();

/* 相机可视化 */
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

/* 启动图形用户界面 gui.add(controls,'autoRotate').name('自动旋转'); */
  const gui = new GUI();
  gui.add(camera,'fov',1,180).name('主视野角度');
  gui.add(camera,'near',0.1,1000).name('近裁剪面');
  gui.add(camera,'far',0.1,1000).name('远裁剪面');
  gui.add(controls,'enableDamping').name('阻尼');
  gui.add(controls,'dampingFactor',0.1,1).name('阻尼系数');

/* 小地图相机 */
  const mini_camera = new THREE.PerspectiveCamera(
    60,  // fov
    2,   // aspect
    0.1, // near
    500, // far
  );
  mini_camera.position.set(30, 30, 30);
  mini_camera.lookAt(0, 0, 0);
  gui.add(mini_camera,'fov',1,180).name('主视野角度');
  gui.add(mini_camera,'near',0.1,1000).name('近裁剪面');
  gui.add(mini_camera,'far',0.1,1000).name('远裁剪面');


/* 循环动画 */
  (function animate() {
    requestAnimationFrame( animate ); //请求下一帧
    controls.update(); // 更新摄像机
    renderer.setScissorTest(true); //开启裁剪
    // 渲染主视野
    {
      const view1Elem = document.querySelector('#svg');
      const aspect = setScissorForElement(view1Elem);
      // 用计算出的aspect修改摄像机参数
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();
      cameraHelper.visible = false;
      // 渲染
      renderer.render(scene, camera);
    }
 

    
    // 渲染第二台摄像机
    {
      const view2Elem = document.querySelector('#map');
      const aspect = setScissorForElement(view2Elem);
 
      // 调整aspect
      mini_camera.aspect = aspect;
      mini_camera.updateProjectionMatrix();

      // 在第二台摄像机中绘制cameraHelper
      cameraHelper.visible = true;
      renderer.render(scene, mini_camera);
    }

      var target=controls.target
      let tarX,tarY
      if(Math.abs(target.x-0)>(size/2)){
        if(target.x>0){
          tarX=Math.ceil((target.x-(size/2))/size)
        }else{
          tarX=Math.floor((target.x+(size/2))/size)
        }
      }else{
        tarX=0
      }
      if(Math.abs(target.z-0)>(size/2)){
        if(target.z>0){
          tarY=Math.ceil((target.z-(size/2))/size)
        }else{
          tarY=Math.floor((target.z+(size/2))/size)
        }
      }else{
        tarY=0
      }
      initMap(tarX,tarY)
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
  bottom: 10px;
  right: 10px;
  border-radius: 50%;
  position: absolute;
}
</style>
