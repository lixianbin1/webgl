<template>
	<!--- 搜索框 -- -->
	<el-form :inline="true" :model="formInline" class="demo-form-inline">
		<el-form-item label="Approved by">
		<el-input v-model="formInline.user" placeholder="Approved by" clearable />
		</el-form-item>
		<el-form-item label="Activity zone">
		<el-select
			v-model="formInline.region"
			placeholder="Activity zone"
			clearable
		>
			<el-option label="Zone one" value="shanghai" />
			<el-option label="Zone two" value="beijing" />
		</el-select>
		</el-form-item>
		<el-form-item label="Activity time">
		<el-date-picker
			v-model="formInline.date"
			type="date"
			placeholder="Pick a date"
			clearable
		/>
		</el-form-item>
		<el-form-item>
		<el-button type="primary" @click="onSubmit">Query</el-button>
		</el-form-item>
	</el-form>

	<!--- 表格 -- -->
	<el-table :data="tableData" :span-method="objectSpanMethod" style="width: 100%">
		<el-table-column label="Date" width="180">
			<template #default="scope">
			<div style="display: flex; align-items: center">
				<el-icon><timer /></el-icon>
				<span style="margin-left: 10px">{{ scope.row.date }}</span>
			</div>
			</template>
		</el-table-column>
		<el-table-column label="Name" width="180">
			<template #default="scope">
			<el-popover effect="light" trigger="hover" placement="top" width="auto">
				<template #default>
				<div>name: {{ scope.row.name }}</div>
				<div>address: {{ scope.row.address }}</div>
				</template>
				<template #reference>
				<el-tag>{{ scope.row.name }}</el-tag>
				</template>
			</el-popover>
			</template>
		</el-table-column>
		<el-table-column label="Operations">
			<template #default="scope">
			<el-button size="small" @click="handleEdit(scope.$index, scope.row)">
				Edit
			</el-button>
			<el-button
				size="small"
				type="danger"
				@click="handleDelete(scope.$index, scope.row)"
			>
				Delete
			</el-button>
			</template>
		</el-table-column>
	</el-table>
  </template>
  
<script setup>
import { reactive,onBeforeMount } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import { DbAdmin,db,getTableDate,addTableData,getTable,addTable } from '../db.js'

const dbadmin = new DbAdmin()

const formInline = reactive({
  user: '',
  region: '',
  date: '',
})

const onSubmit = () => {
  console.log('submit!')
}

onBeforeMount(async () => { 
// 列出所有表
  const tables = await getTable();
  console.log('Tables:', tables);
  console.log('Current Database Version:', db.verno)
//   const table = db.table('users')
//   console.log(table.toArray())

//   const table2 = await getTableDate({name:'users'})
//   console.log(table2)
})
  

// addTable({name:'key', comment:['++id','name']})
// addTableData('users',{UserID:'10000', title: 'iPhone2', price: 59991 }).then(res => {
// 	console.log(res)
// 	})

  const handleEdit = (index, row) => {
	console.log(index, row)
  }
  const handleDelete = (index, row) => {
	console.log(index, row)
  }
  
  const tableData = [
	{
	  date: '2016-05-03',
	  name: 'Tom',
	  address: 'No. 189, Grove St, Los Angeles',
	},
	{
	  date: '2016-05-02',
	  name: 'Tom',
	  address: 'No. 189, Grove St, Los Angeles',
	},
	{
	  date: '2016-05-04',
	  name: 'Tom',
	  address: 'No. 189, Grove St, Los Angeles',
	},
	{
	  date: '2016-05-01',
	  name: 'Tom',
	  address: 'No. 189, Grove St, Los Angeles',
	},
  ]

  const objectSpanMethod = ({
	row,
	column,
	rowIndex,
	columnIndex,
	}) => {
	if (columnIndex === 0) {
		if (rowIndex % 3 === 0) {
			return {
				rowspan: 3,
				colspan: 1,
			}
		} else {
			return {
				rowspan: 0,
				colspan: 0,
			}
		}
	}
	}

  </script>