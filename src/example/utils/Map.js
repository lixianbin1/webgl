import * as THREE from 'three';
import { tileMap } from './MapData.js';

// 创建格子
export function createGrid(centerX, centerY, centerZ){ 
    const group = new THREE.Group(); //群
    this.scene.add(group);
    const grid_mat = this.Texture.get('grid_mat');
    const grid_geo = this.Texture.get('grid_geo');
    const material = this.Texture.get('mesh_mater');
    const lineMat = this.Texture.get('line_mat');
    // 基础底层
    const base = new THREE.Mesh(grid_geo, grid_mat)
    base.receiveShadow = true
    base.position.set(centerX, centerY -0.01, centerZ);
    group.add(base)
    // 创建格子
    const grass = new THREE.Mesh(grid_geo, material);
    grass.position.set(centerX, centerY, centerZ);
    grass.receiveShadow = true
    const data = tileMap.get(`${centerX/this.GridSize},${centerZ/this.GridSize}`)
    if(data){
        grass.name = 'grid';
        grass.userData = data;
        group.add(grass);
        // 边框线
        const edges = new THREE.EdgesGeometry(grid_geo);
        const lines = new THREE.LineSegments(edges, lineMat.clone())
        lines.position.set(centerX, centerY, centerZ);
        group.add(lines)
    }

};