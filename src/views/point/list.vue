<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员ID"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员号" prop="userNo">
        <el-input
          v-model="queryParams.userNo"
          placeholder="请输入会员号"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入会员手机号"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
          <el-option key="A" label="有效" value="A" />
          <el-option key="N" label="无效" value="N" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="会员ID" align="center" prop="userId" />
      <el-table-column label="会员号" align="center" prop="userInfo.userNo">
        <template #default="scope">
          <span v-if="scope.row.userInfo && scope.row.userInfo.userNo">{{ scope.row.userInfo.userNo }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" prop="userInfo.mobile">
        <template #default="scope">
          <span v-if="scope.row.userInfo && scope.row.userInfo.mobile">{{ scope.row.userInfo.mobile }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="会员名称" align="center" prop="userInfo.name">
        <template #default="scope">
          <span v-if="scope.row.userInfo && scope.row.userInfo.name">
              <span>{{ scope.row.userInfo.name }}</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="变动数量" align="center" prop="amount">
         <template #default="scope">
             <span v-if="scope.row.amount > 0" style="color:forestgreen">+{{ scope.row.amount }}</span>
             <span v-else style="color:red">{{ scope.row.amount }}</span>
         </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark">
        <template #default="scope">
          <span v-if="scope.row.description">{{ scope.row.description }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.createTime">{{ parseTime(scope.row.createTime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.operator">{{ scope.row.operator }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { parseTime } from '@/utils/fuint'
import { getPointList } from '@/api/point'

defineOptions({ name: 'PointList' })

const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const defaultSort = { prop: 'createTime', order: 'descending' }
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  mobile: '',
  userId: '',
  userNo: '',
  orderSn: '',
  status: ''
})
const queryForm = ref(null)
const tables = ref(null)

function getList() {
  loading.value = true
  getPointList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    loading.value = false
  })
}

function handleQuery() {
  queryParams.page = 1
  getList()
}

function resetQuery() {
  queryForm.value?.resetFields()
  tables.value?.sort(defaultSort.prop, defaultSort.order)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

function handleSortChange(column) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

getList()
</script>

