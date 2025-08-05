import * as THREE from 'three';
import { OrbitControls } from '@/utils/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {createGrid} from "./Map.js"
import {createTexture} from "./Texture.js"
import { tileMap } from './MapData.js';
export default class ThreeEngine {
  constructor(domRoot, miniDom) {
    this.ndRender  = true// 是否需要渲染
    this.size = 8;       // 场景大小（半径）
    this.GridSize = 20;   // 格子大小
    this.maps = new Map();// 地图坐标
    this.last_xz = [0,0]  // 上次的坐标
    this.scale = 10;      // 场景缩放
    this.domRoot = domRoot;     // 主视口容器
    this.miniDom = miniDom;     // 小地图容器
    this.scene = new THREE.Scene();
    this.camera = null;    // 主相机
    this.mini_camera = null;
    this.renderer = null;  // 渲染器
    this.controls = null;  // 控制器
    this.Texture = new Map(); // 纹理缓存
    this.gui = new GUI();
    this.clock = new THREE.Clock();
    this.lastValidTarget = new THREE.Vector3();       // 上次有效点位
    this.lastValid = new THREE.Vector3(180, 180, 180);// 相机点位

    this._init();
  }

  /* -------------- 初始化 -------------- */
  _init() {
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,  // 抗锯齿
        alpha: true,       // 画布透明
        preserveDrawingBuffer: true // 保存画布
    });
    renderer.shadowMap.enabled = true; // 开启阴影映射
    renderer.setSize(window.innerWidth, window.innerHeight); // 画布尺寸
    this.domRoot.appendChild(renderer.domElement); // 挂载
    this.renderer = renderer;

    // 主相机
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.OrthographicCamera( 
      width / - this.scale, width / this.scale, height / this.scale, height / - this.scale, 1, 600
    );
    camera.position.copy(this.lastValid);
    camera.lookAt(0, 0, 0);
    this.camera = camera;

    /* 小地图相机 */
    const mini_camera = new THREE.OrthographicCamera(
      -120,120,120,-120,
      1,600,
    );
    mini_camera.position.set(0, 80, 0);
    mini_camera.lookAt(0, 0, 0);
    this.mini_camera = mini_camera;

    // 主控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.screenSpacePanning = false;    //禁止y轴平移
    controls.minPolarAngle = Math.PI / 4;  //限制角度
    controls.maxPolarAngle = Math.PI / 4;
    controls.panSpeed=0.5                   //限制速度
    controls.rotateSpeed=0.5
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.addEventListener('change', () => {
      this.ndRender = true;
    });
    this.controls = controls;

    // 光照
    const amb = new THREE.AmbientLight(0xffffff, 0.3);    //环境光
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);//平行光
    dir.position.set(20, 40, 20);
    dir.castShadow = true; //开启阴影
    const c = 40;
    dir.shadow.camera.left = -c;
    dir.shadow.camera.right = c;
    dir.shadow.camera.top = c;
    dir.shadow.camera.bottom = -c;
    dir.shadow.mapSize.set(1512, 1512);
    dir.shadow.bias = -0.001;
    this.scene.add(amb, dir);
   
    // 注册纹理
    createTexture.bind(this)();

    // 地图
    this.initMap(0,0)

    // 辅助
    this.scene.add(new THREE.AxesHelper(80));   // 坐标轴
    this.camHelper = new THREE.CameraHelper(dir.shadow.camera); // 投影相机
    this.camHelper.visible = false;
    this.scene.add(this.camHelper);

    // GUI
    this.gui.add({ showHelper: false }, 'showHelper')
      .name('阴影相机')
      .onChange(v => (this.camHelper.visible = v));
    this.gui.add({ controls: true }, 'controls')
      .name('自由视角')
      .onChange(v => {
        if (v) {
            controls.minPolarAngle = Math.PI / 20;
            controls.maxPolarAngle = Math.PI / 18;
            } else {
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = Math.PI;
        }
      });
    this.gui.add(this, 'scale',1,15)
      .name('自由视角2')
      .onChange(v => {
        this.scale = v;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.left   = width / -this.scale;
        this.camera.right  = width / this.scale;
        this.camera.top    = height / this.scale;
        this.camera.bottom = height / -this.scale;
        this.camera.updateProjectionMatrix();
      });

    // 窗口自适应
    window.addEventListener('resize', () => this._onResize());
    this._animate();
  }
  // 初始化格子
  initMap(cx, cz){
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

  /* -------------- 渲染循环 -------------- */
  _animate() {
    requestAnimationFrame(() => this._animate());
    // 限制控制器 target 不超出地图边界
    this.controls.update();
    if (this.ndRender) {
      const target = this.controls.target;
      const half = Math.floor(this.size / 2);
      const minX = -half * this.GridSize;
      const maxX =  half * this.GridSize;
      const minZ = -half * this.GridSize;
      const maxZ =  half * this.GridSize;
      
      // 相机相对于目标的偏移向量
      const offset = this.camera.position.clone().sub(target); 
      
      // 限制 target 和 camera 位置，保持偏移不变
      target.x = THREE.MathUtils.clamp(target.x, minX, maxX);
      target.z = THREE.MathUtils.clamp(target.z, minZ, maxZ);
      this.camera.position.copy(target.clone().add(offset));
      
      this.renderer.setScissorTest(true);
      // 主视口
      const mainAspect = this._setScissor(this.domRoot);
      this.camera.aspect = mainAspect;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);

      // 小地图
      this.mini_camera.position.set(target.x, 80, target.z); // 保持俯视高度
      this.mini_camera.lookAt(target.x, 0, target.z);
      const miniAspect = this._setScissor(this.miniDom);
      this.mini_camera.aspect = miniAspect;
      this.mini_camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.mini_camera);
      this.renderer.setScissorTest(false);


      let tarX,tarY // 需要加载的坐标格子
      if(Math.abs(target.x-0)>(this.size/2)){
        if(target.x>0){
          tarX=Math.ceil((target.x-(this.size/2))/this.size)
        }else{
          tarX=Math.floor((target.x+(this.size/2))/this.size)
        }
      }else{
        tarX=0
      }
      if(Math.abs(target.z-0)>(this.size/2)){
        if(target.z>0){
          tarY=Math.ceil((target.z-(this.size/2))/this.size)
        }else{
          tarY=Math.floor((target.z+(this.size/2))/this.size)
        }
      }else{
        tarY=0
      }
      this.initMap(tarX,tarY)
      this.ndRender = false; // 渲染完后重置
    }
  }

  /* -------------- 工具 -------------- */
  _setScissor(elem) {
    const canvas = this.renderer.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    const positiveYUpBottom = canvasRect.height - bottom;
    this.renderer.setScissor(left, positiveYUpBottom, width, height);
    this.renderer.setViewport(left, positiveYUpBottom, width, height);
    return width / height;
  }

  _onResize() {
    this.ndRender = true
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}