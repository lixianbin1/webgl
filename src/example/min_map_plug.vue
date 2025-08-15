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

import * as THREE from 'three';

// 初始化地图
export function initMap(targetX = 0, targetZ = 0) {
  // 清除旧地图
  this.scene.children.forEach(child => {
    if (child.userData && child.userData.isMapTile) {
      this.scene.remove(child);
      child.geometry.dispose();
      child.material.dispose();
    }
  });
  
  // 创建新地图块
  const renderRange = 5; // 渲染范围
  for (let x = -renderRange; x <= renderRange; x++) {
    for (let z = -renderRange; z <= renderRange; z++) {
      const worldX = (targetX + x) * this.GridSize;
      const worldZ = (targetZ + z) * this.GridSize;
      this._createMapTile(worldX, worldZ, this._getTerrainType(x, z));
    }
  }
}

// 创建地图块
function _createMapTile(x, z, type) {
  const size = this.GridSize;
  
  // 创建平面几何体
  const geometry = new THREE.PlaneGeometry(size, size);
  geometry.rotateX(-Math.PI / 2);
  
  // 创建材质 - 结合宣纸底色和地形水墨纹理
  const material = new THREE.MeshStandardMaterial({
    map: this.Texture.get('paper'),
    aoMap: this.Texture.get(type),
    aoMapIntensity: 1.2,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide
  });
  
  // 创建网格
  const tile = new THREE.Mesh(geometry, material);
  tile.position.set(x, 0, z);
  tile.userData.isMapTile = true;
  tile.userData.terrainType = type;
  
  // 添加边界
  this._addTileBorder(tile, size);
  
  // 添加阴影效果
  if (type === 'mountain') {
    tile.position.y = 5 + Math.random() * 3; // 山地略微抬高
    this._addShadowEffect(tile, size);
  }
  
  this.scene.add(tile);
  return tile;
}

// 添加地图块边界
function _addTileBorder(tile, size) {
  const borderGeometry = new THREE.EdgesGeometry(tile.geometry);
  const borderMaterial = new THREE.LineBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.2,
    linewidth: 1
  });
  
  const border = new THREE.LineSegments(borderGeometry, borderMaterial);
  border.position.copy(tile.position);
  border.rotation.copy(tile.rotation);
  border.userData.isMapTile = true;
  
  tile.add(border);
}

// 添加阴影效果
function _addShadowEffect(tile, size) {
  const shadowGeometry = new THREE.PlaneGeometry(size * 1.2, size * 1.2);
  shadowGeometry.rotateX(-Math.PI / 2);
  
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: this.Texture.get('shadow'),
    transparent: true,
    opacity: 0.5
  });
  
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.set(0, -0.1, 0); // 略低于地形
  shadow.userData.isMapTile = true;
  
  tile.add(shadow);
}

// 确定地形类型（简化的随机生成）
function _getTerrainType(x, z) {
  // 使用简单的哈希算法生成伪随机但一致的地形
  const hash = (x * 92837111) ^ (z * 689287499);
  const rand = (hash % 100) / 100;
  
  // 根据概率分配地形类型
  if (rand < 0.5) return 'plain';      // 50% 平原
  if (rand < 0.7) return 'forest';     // 20% 森林
  if (rand < 0.85) return 'mountain';  // 15% 山地
  return 'river';                      // 15% 河流
}

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