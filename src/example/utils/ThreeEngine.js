import * as THREE from 'three';
import { OrbitControls } from '@/utils/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {createGrid,initMap} from "./Map.js"
import {createTexture} from "./Texture.js"
import { tileMap } from './MapData.js';
import { createGui } from "./GuiHelp.js";
import { createLight } from "./Light.js";
export default class ThreeEngine {
  constructor(domRoot, miniDom) {
    this.frameId = null;
    this.ndRender  = true // 是否需要渲染
    this.size = 24;       // 场景大小（长度，偶数）
    this.GridSize = 20;   // 格子大小
    this.maps = new Map();// 已渲染地图坐标
    this.scale = 10;      // 场景缩放
    this.domRoot = domRoot;  // 主视口容器
    this.miniDom = miniDom;  // 小地图容器
    this.scene = new THREE.Scene();
    this.camera = null;    // 主相机
    this.mini_camera = null;
    this.renderer = null;  // 渲染器
    this.controls = null;  // 控制器
    this.Texture = new Map(); // 纹理缓存
    this.gui = new GUI();
    this.lastValid = new THREE.Vector3(180, 180, 180);// 相机点位
    this.dispose = ()=>this._dispose();
    this._init();
  }
  _dispose() {
    this.gui.destroy();
    this.renderer.dispose();
    cancelAnimationFrame(this.frameId)
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
    controls.minPolarAngle = Math.PI / 6;   //限制角度
    controls.maxPolarAngle = Math.PI / 6;
    controls.panSpeed=0.5                   //限制速度
    controls.rotateSpeed=0.5
    controls.enableRotate = false; //禁止旋转
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.addEventListener('change', () => {
      this.ndRender = true;
    });
    this.controls = controls;

    createLight.bind(this)();   // 注册光照
    createTexture.bind(this)(); // 注册纹理
    createGui.bind(this)();     // 注册GUI Helper
    initMap.bind(this)();       // 注册地图

    // 窗口自适应
    window.addEventListener('resize', () => this._onResize());
    this._animate();
  }

  /* -------------- 渲染循环 -------------- */
  _animate() {
    this.frameId = requestAnimationFrame(() => this._animate());
    // 限制控制器 target 不超出地图边界
    this.controls.update();
    if (this.ndRender) {
      const length = Math.sqrt(tileMap.size) - 1
      const target = this.controls.target;
      const half = Math.floor(length / 2);
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

      // 计算焦点坐标
      const tarX = Math.floor(target.x / this.GridSize);
      const tarZ = Math.floor(target.z / this.GridSize);
      initMap.call(this, tarX, tarZ);
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.left   = -w / this.scale;
    this.camera.right  =  w / this.scale;
    this.camera.top    =  h / this.scale;
    this.camera.bottom = -h / this.scale;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.ndRender = true;
  }
}