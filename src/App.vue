<template>
  <div class="common-layout" style="height: 100vh;">
    <el-container>
    <el-header>Header</el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu router :default-active="route.path">
          <el-menu-item index="/">
            <i class="el-icon-menu"></i>
            <span >主页</span>
          </el-menu-item>
          <el-menu-item index="/ManageSQL" >
            <i class="el-icon-menu"></i>
            <span >数据管理</span>
          </el-menu-item>
          <el-menu-item index="/Word" >
            <i class="el-icon-menu"></i>
            <span >Word</span>
          </el-menu-item>
          <el-menu-item index="/height_map" >
            <i class="el-icon-menu"></i>
            <span >Height Map</span>
          </el-menu-item>
          <el-menu-item index="/min_map">
            <i class="el-icon-menu"></i>
            <span >Min Map</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
