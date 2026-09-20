<template>
  <div class="app-container">
    <el-table ref="tables" v-loading="loading" :data="list" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="60" />
      <el-table-column label="所属商户" align="center" prop="store">
        <template #default="scope">
          <span>{{ scope.row.merchantName || '公共所有' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-copy-document"
            v-hasPermi="['template:index']"
            @click="handleQrCode(scope.row)">模板选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <OrderTemplate :showDialog="openQrCode" :qr="qr" @closeDialog="closeDialog" @getList="getList" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { parseTime } from '@/utils/fuint'
import OrderTemplate from '@/components/Fuint/Template'
import { getTemplateList } from '@/api/template'

defineOptions({ name: 'TemplateIndex' })

const qr = ref(null)
const openQrCode = ref(false)
const loading = ref(true)
const total = ref(0)
const list = ref([])
const defaultSort = { prop: 'id', order: 'descending' }
const queryParams = reactive({
  page: 1,
  pageSize: 10
})
const tables = ref(null)

function getList() {
  loading.value = true
  getTemplateList(queryParams).then(response => {
    const page = (response && response.data && response.data.paginationResponse) || {}
    list.value = page.content || []
    total.value = page.totalElements || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleSortChange(column) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function handleQrCode(row) {
  qr.value = { page: '/pages/category/index', row }
  openQrCode.value = true
}

function closeDialog() {
  openQrCode.value = false
}

getList()
</script>
