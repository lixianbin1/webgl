import * as THREE from 'three';
// import { tileMap } from './MapData.js';
import { queryXZData } from '@/DB/maps.js';
// 初始化地图
export async function initMap(cx = 0, cz = 0){ 
    const length = this.size / 2;
    const dataMap = await queryXZData({x: cx, z: cz,range: length})
    for (let dx = -length; dx <= length; dx++) {
      for (let dz = -length; dz <= length; dz++) {
        const x = cx + dx;
        const z = cz + dz;
        const key = `${x},${z}`;
        if (!this.maps.has(key)) {
          this.maps.set(key, [x, z]);
          const data = dataMap.get(key);
          if(data){
            await createGrid.bind(this)(x,0,z,data)
          }
        }
      }
    }
}

// 创建格子
export async function createGrid(centerX, centerY, centerZ,data){ 
    const PX = centerX*this.GridSize;
    const PZ = centerZ*this.GridSize;
    const group = new THREE.Group(); //群
    this.scene.add(group);
    const grid_mat = this.Texture.get('grid_mat');
    const grid_geo = this.Texture.get('grid_geo');
    const lineMat = this.Texture.get('line_mat');
    // 基础底层
    const base = new THREE.Mesh(grid_geo, grid_mat)
    base.receiveShadow = true
    base.position.set(PX, centerY -0.01, PZ);
    group.add(base)

    if(data){
        let MATERIAL = getMaterialByType.call(this,data);
        const grass = new THREE.Mesh(grid_geo, MATERIAL);
        grass.position.set(PX, centerY, PZ);
        grass.receiveShadow = true
        group.add(grass);
        grass.name = 'grid';
        grass.userData = data;
        // 边框线
        const edges = new THREE.EdgesGeometry(grid_geo);
        const lines = new THREE.LineSegments(edges, lineMat.clone())
        lines.position.set(PX, centerY + 0.1, PZ);
        group.add(lines)
    }
};

// 根据类型获取材质
function getMaterialByType(data) {
  const type = String(data.type);
  switch (type){
      case '1':
        return this.Texture.get('Base_mater');
      case '2':
        return this.Texture.get('Nongtian_mater');
      case '3':
        return this.Texture.get('Senlin_mater');
      case '4':
        return this.Texture.get('Shan_mater');
      case '5':
        return this.Texture.get('Tie_mater');
      default:
        return this.Texture.get('mater');
  }
}