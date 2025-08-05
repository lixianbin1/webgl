import * as THREE from 'three';
// 注册纹理材质
export function createTexture(){
    // 纹理
    const loader = new THREE.TextureLoader();
    const GTexture = loader.load('/map/grass.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(20, 20);
    });
    const BaseTexture = loader.load('/map/base.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    const L1Texture = loader.load('/map/liang1.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    const L2Texture = loader.load('/map/liang2.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    // 材质（网络格）
    const material = new THREE.MeshBasicMaterial({
        map: GTexture,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const Basematerial = new THREE.MeshLambertMaterial({
        map: BaseTexture,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const L1material = new THREE.MeshLambertMaterial({
        map: L1Texture,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const L2material = new THREE.MeshLambertMaterial({
        map: L2Texture,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    // 材质（非光泽）
    const grid_mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    // 材质（线）
    const lineMat = new THREE.LineBasicMaterial({ color: 0x333333 });


    // 几何体（方格）
    const grid_geo = new THREE.PlaneGeometry(this.GridSize, this.GridSize)
    grid_geo.rotateX( - Math.PI / 2)
    
    /* 注册 */
    this.Texture.set('grid_geo', grid_geo);
    this.Texture.set('grid_mat', grid_mat);
    this.Texture.set('mesh_mater', material);
    this.Texture.set('Base_mater',Basematerial);
    this.Texture.set('l1_mater',L1material);
    this.Texture.set('l2_mater',L2material);
    this.Texture.set('line_mat', lineMat);
}