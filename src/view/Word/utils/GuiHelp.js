import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export function createGui(){ 
    const controls = this.controls
    // GUI
    const gui = new GUI();
    gui.add({showAxesHelper:false}, 'showAxesHelper')
      .name('坐标轴')
      .onChange(v => {
        this.axesHelper.visible = v
        this.ndRender = true;
    });
    gui.add(controls, 'enableRotate')
      .name('允许旋转')
    gui.add({ camHelper: false }, 'camHelper')
      .name('阴影相机')
      .onChange(v => {
        this.camHelper.visible = v
        this.ndRender = true;
    });
    gui.add({ controls: false }, 'controls')
      .name('允许滚动')
      .onChange(v => {
        if (v) {
          controls.minPolarAngle = 0;
          controls.maxPolarAngle = Math.PI;
        } else {
          controls.minPolarAngle = this.minPolarAngle;
          controls.maxPolarAngle = this.maxPolarAngle;
        }
      });
    gui.add(this, 'scale',1,50)
      .name('放大视野')
      .onChange((v) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.left = width / - v, 
        this.camera.right = width / v, 
        this.camera.top = height / v, 
        this.camera.bottom = height / - v,
        this.camera.updateProjectionMatrix();
        this.ndRender = true;
      });

    // 辅助
    this.axesHelper = new THREE.AxesHelper(80); // 坐标轴
    this.scene.add(this.axesHelper);
    this.axesHelper.visible = false;
    this.camHelper = new THREE.CameraHelper(this.dir.shadow.camera); // 投影相机
    this.camHelper.visible = false;
    this.scene.add(this.camHelper);
};