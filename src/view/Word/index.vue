<template>
  <div id="Word">
    <div id="svg" ref="mainViewport"></div>
    <div id="map" ref="miniViewport"></div>
    <div id="coordinate-display">坐标: (0, 0)</div>
  </div>
</template>
<script setup>
import { ref,onMounted,onBeforeUnmount} from 'vue'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import ThreeEngine from '@/view/Word/utils/ThreeEngine.js'


const init = (engine) => {

  const disposeThree = () => {
    engine.dispose();
  }
  onBeforeUnmount(() => disposeThree())

  const scene = engine.scene;
  const camera = engine.camera;
  const renderer = engine.renderer;
  let selectedGrid = null;
  function onMouseClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      if (obj.name === 'grid') {
        console.log(obj.userData)
        const { x, z } = obj.userData;
        document.getElementById('coordinate-display').textContent = `坐标: (${x}, ${z})`;

        // 如果已经选中了其他格子，先取消选中
        if (selectedGrid) {
          selectedGrid.parent.children.forEach((child) => {
            if (child instanceof THREE.LineSegments) {
              child.material.color.set(0x000000); // 恢复默认颜色
              child.material.opacity = 1; // 恢复默认透明度
              child.position.y = 0.01;
            }
          });
        }

        // 选中当前格子
        selectedGrid = obj;

        // 改变边框线的颜色
        obj.parent.children.forEach((child) => {
          if (child instanceof THREE.LineSegments) {
            child.material.color.set(0x51e7ff); // 设置为红色
            child.material.opacity = 1; // 设置初始透明度
            child.position.y = 0.2;
          }
        });
        engine.ndRender = true;
        break;
      }
    }
  }

  renderer.domElement.addEventListener('click', onMouseClick);

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
        object.position.set(0,-6.3,0)
        object.transparent=true;
        object.opacity=0
        scene.add(object);
        engine.ndRender = true;
        renderer.render(scene,camera);
      },undefined,function(error){
        console.log(error)
      });
    });

}
const mainViewport = ref(null);
const miniViewport  = ref(null);

onMounted(() => { 
  const engine = new ThreeEngine(mainViewport.value, miniViewport.value);
  init(engine)
})

</script>

<style scoped>
#Word{ 
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}
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
