import * as THREE from 'three';
import { tileMap } from './MapData.js';

// 初始化地图
export function initMap(cx = 0, cz = 0){ 
    const length = this.size / 2;
    for (let dx = -length; dx <= length; dx++) {
      for (let dz = -length; dz <= length; dz++) {
        const x = cx + dx;
        const z = cz + dz;
        const key = `${x},${z}`;
        if (!this.maps.has(key)) {
          this.maps.set(key, [x, z]);
          createGrid.bind(this)(x*this.GridSize,0,z*this.GridSize)
        }
      }
    }
}


// 创建格子
export function createGrid(centerX, centerY, centerZ){ 
    const group = new THREE.Group(); //群
    this.scene.add(group);
    const grid_mat = this.Texture.get('grid_mat');
    const grid_geo = this.Texture.get('grid_geo');
    const material = this.Texture.get('mesh_mater');
    const Base1_mater = this.Texture.get('Base1_mater');
    const M1_mater = this.Texture.get('m1_mater');
    const S1_mater = this.Texture.get('s1_mater');
    const lineMat = this.Texture.get('line_mat');
    // 基础底层
    const base = new THREE.Mesh(grid_geo, grid_mat)
    base.receiveShadow = true
    base.position.set(centerX, centerY -0.01, centerZ);
    group.add(base)



    const data = tileMap.get(`${centerX/this.GridSize},${centerZ/this.GridSize}`)
    // 创建格子
    let MATERIAL = material
    if(data){
        if(data.type == 'grass'){
            if(data.level == 1){
                MATERIAL = M1_mater
            }else if(data.level == 2){
                MATERIAL = S1_mater
            }
        }else{
            MATERIAL = Base1_mater
            
        }
    }
    const grass = new THREE.Mesh(grid_geo, MATERIAL);
    grass.position.set(centerX, centerY, centerZ);
    grass.receiveShadow = true
    group.add(grass);

    if(data){
        grass.name = 'grid';
        grass.userData = data;
        // 边框线
        const edges = new THREE.EdgesGeometry(grid_geo);
        const lines = new THREE.LineSegments(edges, lineMat.clone())
        lines.position.set(centerX, centerY + 0.1, centerZ);
        group.add(lines)
    }

};