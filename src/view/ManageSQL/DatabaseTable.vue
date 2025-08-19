<template>
  <div class="table-box">
    <!--- 搜索框 -- -->
    <el-form :inline="true" class="form-inline" style="text-align: end;">
      <el-form-item>
        <el-button type="primary" @click="pageChange()">查询</el-button>
        <el-button type="primary" @click="openDrawer()">添加</el-button>
        <el-button type="primary" @click="pullData()">导出</el-button>
      </el-form-item>
    </el-form>

    <!--- 表格 -- -->
    <el-table id="Tables" :data="Tables" style="width: 100%;flex:1" @row-click="rowClick">
      <el-table-column label="ID" prop="id" width="80"/>
      <el-table-column label="表名" prop="name"/>
      <el-table-column label="介绍" prop="comment"/>
      <el-table-column label="创建人" prop="createUser"/>
      <el-table-column label="创建时间" prop="createTime" width="180"/>
      
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="deleteClick($event,scope.row)">删除</el-button>
          <el-button link type="primary" @click="editClick($event,scope.row)" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--- 分页 -- -->
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

  <!-- 添加编辑数据库表 -->
  <el-drawer v-model="drawer" size="400" :before-close="closeDrawer">
    <template #header>
      <h4>{{drawerType==='add'?'创建数据库表':'修改数据库表'}}</h4>
    </template>
    <template #default>
      <el-form :model="drawerform" label-width="auto" style="max-width: 600px">
        <el-form-item label="表名">
          <el-input v-model="drawerform.name" placeholder="请输入表名"/>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="drawerform.comment" placeholder="请输入说明字段"/>
        </el-form-item>
        <el-form-item label="表字段">
          <el-button type="primary" @click="addField">添加字段</el-button>
          <div v-for="(field, index) in drawerform.fields" :key="index" class="field-item">
            <el-input v-model="field.key" placeholder="字段名" style="width: 40%" />
            <el-input v-model="field.name" placeholder="字段中文注释" style="width: 40%" />
            <el-button type="danger" @click="removeField(index)">删除</el-button>
          </div>
        </el-form-item>

      </el-form>
    </template>
    <template #footer>
    <div style="flex: auto">
      <el-button @click="closeDrawer">取消</el-button>
      <el-button type="primary" @click="confirmClick">提交</el-button>
    </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { defineEmits,ref, reactive,onBeforeMount } from 'vue'
import { getTable,addTable,upTable,getTableData,delTable,exportDB} from '@/DB/db.js'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['rowClick']);
// 分页相关
const pagination = reactive({ page: 1, size: 10 ,total: 0 })
const sizeChange = (val) => {
  console.log(`每页 ${val} 条`)
  pagination.page = 1
  pagination.size = val
  getData()
}
const pageChange = (val) => {
  console.log(`当前页: ${val}`)
  pagination.page = val
  getData()
}
const addField = () => {
  drawerform.fields.push({ key: '', name: '' });
};
const removeField = (index) => {
  drawerform.fields.splice(index, 1);
};
// 查询表格数据
const Tables = ref([])
const getData = async() => {
  const tables = await getTable({ page: pagination.page, size: pagination.size });
  if (tables.code === 200) {
    Tables.value = tables.data
    pagination.size = tables.size
    pagination.total = tables.total
    pagination.page = 1
  }
}
const deleteClick = async(event,row) => { // 删除
  event.stopPropagation();
  const data = await delTable(row)
  console.log(data)
  if(data.code == 200){
    ElMessage.success('删除成功')
    pageChange()
  }else{
    ElMessage.error(data.message)
  }
}

const rowData = ref(null)
const editClick = async(event,row) => {  //编辑
  event.stopPropagation();
  rowData.value = row
  const tables = await getTableData({name:row.name,page:1, size: 10})
  drawer.value = true
  drawerType.value = 'edit'
  drawerform.name = row.name
  drawerform.oldName = row.name
  drawerform.comment = row.comment
  let fields = tables.columes
  .filter(item => item.prop !== 'id')
  .map(item =>{ 
    return {
      key: item.prop,
      name: item.label
    }
  });
  drawerform.fields = fields
}

const rowClick = (row) => { 
  emit('rowClick', row)
}

// 抽屉相关
const drawer = ref(false)
const drawerType = ref('add')
const drawerform = reactive({
  name:'',
  comment:'',
  fields:[],
})
const openDrawer = () => {
  drawer.value = true
  drawerType.value = 'add'
}
const pullData = async() => { //导出
  const blob = await exportDB()
  saveAs(blob, 'SQL.json');
}
const closeDrawer = () => {
  drawer.value = false
  setTimeout(() => {
    drawerType.value = 'add'
    drawerform.name = ''
    drawerform.comment = ''
    drawerform.fields = []
  }, 100)
}
const confirmClick = async() => {
  if(drawerType.value === 'add'){
    const data = await addTable({
      name:drawerform.name,
      comment:drawerform.comment,
      fields:drawerform.fields,
    })
    if(data.code == 200){
      ElMessage.success('添加成功')
      pageChange()
    }else{
      ElMessage.error(data.message)
    }
  }else{
    const data = await upTable({
      oldName:drawerform.oldName,
      name:drawerform.name,
      comment:drawerform.comment,
      fields:drawerform.fields,
    })
    if(data.code == 200){
      ElMessage.success('编辑成功')
      pageChange()
      rowClick(rowData.value)
    }else{
      ElMessage.error(data.message)
    }
  }
  closeDrawer()
}


onBeforeMount(async () => { 
  getData()
})
</script>

<style scoped>
.table-box{
  height: 50%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 10px;
}
</style>