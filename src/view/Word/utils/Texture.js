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
    const SenlinTexture = loader.load('/map/senlin.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    const ShanTexture = loader.load('/map/shan.png', (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    // 材质（网络格）
    const material = new THREE.MeshBasicMaterial({
        map: GTexture, //草
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const Basematerial = new THREE.MeshLambertMaterial({
        map: BaseTexture, //平原
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const Senlinmaterial = new THREE.MeshLambertMaterial({
        map: SenlinTexture, //树木
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
    });
    const Shanmaterial = new THREE.MeshLambertMaterial({
        map: ShanTexture, //石头
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
    this.Texture.set('mater',material);
    this.Texture.set('Base_mater',Basematerial);
    this.Texture.set('Nongtian_mater',Senlinmaterial);
    this.Texture.set('Senlin_mater',Senlinmaterial);
    this.Texture.set('Shan_mater',Shanmaterial);
    this.Texture.set('Tie_mater',Shanmaterial);

    this.Texture.set('grid_geo', grid_geo);
    this.Texture.set('grid_mat', grid_mat);
    this.Texture.set('line_mat', lineMat);
}