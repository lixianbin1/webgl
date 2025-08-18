<template>
<div id="table">
  <DatabaseTable @rowClick="rowClick"/>

  <div class="table-box" v-if="column.length">
    <!--- 搜索框 -- -->
    <el-form :inline="true" class="form-inline" style="text-align: end;">
      <el-form-item>
        <el-button type="primary" @click="addData()">添加</el-button>
        <el-button type="primary" @click="pullData()">导出</el-button>
        
      </el-form-item>
    </el-form>
    <el-table :data="Tables" style="width: 100%" >
      <el-table-column v-for="row in column" :key="row.prop" :label="row.label" :prop="row.prop"/>
      <el-table-column v-if="column.length" label="action" width="180" >
        <template #default="scope">
          <el-button link type="primary" @click = "deleteData(scope.row)">删除</el-button>
          <el-button link type="primary"  size="small" @click="editData(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
    v-model:current-page="pagination.page"
    v-model:page-size="pagination.size"
    :page-sizes="[20, 50, 100]"
    size="small"
    layout="total, sizes, prev, pager, next, jumper"
    :total="pagination.total"
    @size-change="sizeChange"
    @current-change="pageChange"
    />
  </div>
</div>

  <!-- 数据源抽屉 -->
  <el-drawer v-model="Datadrawer" size="400" :before-close="cancelDate">
    <template #header>
      <h4>{{DatadrawerType==='add'?'创建数据库表':'修改数据库表'}}</h4>
    </template>
    <template #default>
      <el-form :model="Datadrawerform" label-width="auto" style="max-width: 600px">
        <el-form-item :label="label" v-for="(value,label) in Datadrawerform" :key="label">
          <template v-if="label=='id'">
            <span>{{ value }}</span>
          </template>
          <el-input v-else v-model="Datadrawerform[label]"  placeholder="请输入"/>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
    <div style="flex: auto">
      <el-button @click="cancelDate">取消</el-button>
      <el-button type="primary" @click="confirmDate">提交</el-button>
    </div>
    </template>
  </el-drawer>
  </template>
  
<script setup>
import { reactive,ref,toRaw } from 'vue'
import { getTableData,addTableData,deleteTableData,updateTableData,exportTableData } from '@/DB/db.js'
import { ElMessage } from 'element-plus'
import DatabaseTable from './DatabaseTable.vue'
import { saveAs } from 'file-saver';

const Tables = ref([])//表
const column = ref([])

// 抽屉相关
const rowData = ref(null)
const Datadrawer = ref(false)
const DatadrawerType = ref('add')
let Datadrawerform = reactive({})
const addData = async() => { //打开新增
  Datadrawer.value = true
  DatadrawerType.value = 'add'
  column.value.map(item => { 
    if(item.prop !== 'id' && !item.prop.includes('[')){
      Datadrawerform[item.prop] = ''
    }
  })
}
const pullData = async(row) => { //导出
  const name = rowData.value.name
  const blob = await exportTableData(name)
  saveAs(blob, name+'.json');
}
const editData = async(row) => { //打开编辑
  DatadrawerType.value = 'edit'
  column.value.map(item => { 
    Datadrawerform[item.prop] = row[item.prop]
  })
  Datadrawer.value = true
}
const cancelDate=() => { // 关闭
  Datadrawer.value = false
  DatadrawerType.value = 'add'
  Datadrawerform = reactive({})
}
const deleteData = async(row) => { //删除数据
  const name = rowData.value.name
  const data = await deleteTableData(name,row.id)
  console.log(data)
  if(data.code == 200){
    ElMessage.success('删除成功')
    rowClick(rowData.value)
  }else{
    ElMessage.error(data.message)
  }
}
const confirmDate = async() => {  //添加或编辑
  const name = rowData.value.name
  if(DatadrawerType.value === 'add'){
    const data = await addTableData(name,toRaw(Datadrawerform))
    if(data.code == 200){
      ElMessage.success('添加成功')
      rowClick(rowData.value)
    }else{
      ElMessage.error(data.message)
    }
  }else{
    const id = Datadrawerform.id
    const obj = toRaw(Datadrawerform)
    delete obj.id
    const data = await updateTableData({name,id},obj)
    if(data.code == 200){
      ElMessage.success('编辑成功')
      rowClick(rowData.value)
    }else{
      ElMessage.error(data.message)
    }
  }
  cancelDate()
}

// 查询表格数据
const getData = async(name) => { 
  const tables = await getTableData({name,page:pagination.page, size:pagination.size})
  if (tables.code === 200) { 
    Tables.value = tables.data
    column.value = tables.columes
    pagination.size = tables.size
    pagination.total = tables.total
    pagination.page = tables.page
  }else { 
    ElMessage.error(tables.message)
  }
}
const rowClick = async(row) => {
  rowData.value = row
  pagination.page = 1
  getData(row.name)
}

// 分页相关
const pagination = reactive({ page: 1, size: 10 ,total: 0 })
const sizeChange = (val) => {
  console.log(`每页 ${val} 条`)
  const name = rowData.value.name
  pagination.page = 1
  pagination.size = val
  getData(name)
}
const pageChange = (val) => {
  console.log(`当前页: ${val}`)
  const name = rowData.value.name
  pagination.page = val
  getData(name)
}


</script>

<style scoped>
#table{
  display: flex;
  flex-direction: column;
  height: 100%;
}
.table-box{
  flex: 1;
}
::v-deep #Tables tr{
  cursor: pointer;
}
</style>