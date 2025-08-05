import * as THREE from 'three';

// 光照
const amb = new THREE.AmbientLight(0xffffff, 0.3);    //环境光
const dir = new THREE.DirectionalLight(0xffffff, 0.8);//平行光
export function createLight(){
    this.dir = dir;
    this.amb = amb;
    dir.position.set(20, 40, 20);
    dir.castShadow = true; //开启阴影
    const c = 40;
    dir.shadow.camera.left = -c;
    dir.shadow.camera.right = c;
    dir.shadow.camera.top = c;
    dir.shadow.camera.bottom = -c;
    dir.shadow.mapSize.set(1512, 1512);
    dir.shadow.bias = -0.001;
    // 循环更新： 2.5分更新一次光照
    this.lightTimer = setInterval(() => {
        updateLight.bind(this)()
    }, 150000);
    this.scene.add(amb, dir);
};

// 模拟昼夜
export function updateLight(){ 
    const now = Date.now();
    const t   = (now / 3600000) % 1;      // 60 分钟一圈
    const ang = t * Math.PI * 2;          // 0-2π
    const r   = 120;
    
    // 太阳高度 -1 ~ 1
    const height = Math.sin(ang);
    
    // 太阳位置（y 可负，才会出现黑夜）
    this.dir.position.set(
      Math.cos(ang) * r,
      height * 100,   // 正负都能用，负值就是夜晚
      Math.sin(ang) * r
    );
    this.dir.lookAt(0, 0, 0);
    
    // 光照强度随高度变化
    this.dir.intensity   = Math.max(0, height);               // 白天 >0，夜晚 =0
    this.amb.intensity   = Math.max(0.1, 0.4 + height * 0.2); // 夜晚微光
    this.ndRender = true;
};