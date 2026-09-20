<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" class="main-search" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="说明备注" prop="description">
        <el-input
          v-model="queryParams.description"
          placeholder="请输入说明备注"
          clearable
          style="width: 180px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="操作类型"
          clearable
          style="width: 100px">
          <el-option key="increase" label="入库" value="increase" />
          <el-option key="reduce" label="出库" value="reduce" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属店铺" prop="store">
        <el-select
          v-model="queryParams.storeId"
          placeholder="所属店铺"
          clearable
          style="width: 180px">
          <el-option :key="0" label="公共所有" v-if="!storeId" :value="0" />
          <el-option v-for="storeInfo in storeOptions" :key="storeInfo.id" :label="storeInfo.name" :value="storeInfo.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['goods:goods:index']">新增入库</el-button>
        <el-button
          type="common"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleReduce"
          v-hasPermi="['goods:goods:index']">新增出库</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="类型" align="center" width="80" prop="type">
        <template #default="scope">
          <span v-if="scope.row.type == 'reduce'">出库</span>
          <span v-if="scope.row.type == 'increase'">入库</span>
        </template>
      </el-table-column>
      <el-table-column label="所属店铺" align="center">
        <template #default="scope">
          <span v-if="scope.row.storeId && scope.row.storeId > 0">
              <span>{{ getName(storeOptions, scope.row.storeId) }}</span>
          </span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="说明备注" align="center" prop="description">
        <template #default="scope">
           <span>{{ scope.row.description ? scope.row.description : '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-view"
            v-hasPermi="['goods:goods:index']"
            v-if="storeId == scope.row.storeId || storeId == 0"
            @click="handleDetail(scope.row)">详情</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['goods:goods:index']"
            v-if="storeId == scope.row.storeId || storeId == 0"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
    <!--编辑商品库存-->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="80%" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select class="input" v-model="form.storeId" clearable placeholder="请选择所属店铺">
                <el-option :key="0" label="公共所有" v-if="storeId == 0" :value="0" />
                <el-option
                  v-for="item in storeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
              <div class="form-tips">提示：未选择则属于公共所有</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="mb5">
         <el-button v-if="!isView" type="primary" size="small" @click="selectGoods()">添加商品</el-button>
      </div>
      <el-table ref="goodsTables" v-loading="loading" border :data="goodsList">
        <el-table-column label="商品条码" prop="goodsNo" />
        <el-table-column label="主图" align="center" width="100">
          <template #default="scope">
            <img class="list-img" :src="imagePath + scope.row.logo">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center" prop="name">
          <template #default="scope">
            <span>{{ scope.row.name ? scope.row.name : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品规格" prop="spec">
          <template #default="scope">
           <span v-if="scope.row.specList">
              <span class="spec-item" v-for="spec in scope.row.specList">{{ spec.value }}</span>
           </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" prop="type">
          <template #default="scope">
            <el-input-number :disabled="isView" style="width: 150px" v-model="scope.row.num" :min="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              size="small"
              type="text"
              icon="el-icon-delete"
              v-hasPermi="['goods:goods:index']"
              :disabled="isView"
              v-if="storeId == scope.row.storeId || storeId == 0"
              @click="deleteGoods(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" v-if="!isView" @click="submitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 选择商品组件 start-->
    <selectGoodsDialog :show-dialog="openSelectGoodsDialog" :storeId="form.storeId" :dataList="goodsList" @submit="doSelectGoods" @closeDialog="closeSelectGoods"></selectGoodsDialog>
    <!-- 选择商品组件 end-->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { parseTime, getName } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getStockList, saveStock, deleteStock, getStockInfo } from '@/api/stock'
import selectGoodsDialog from './selectGoodsDialog.vue'

defineOptions({ name: 'StockIndex' })

const vuexStore = useStore()
const storeId = vuexStore.getters.storeId

const isView = ref(false)
const openSelectGoodsDialog = ref(false)
const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const imagePath = ref('')
const total = ref(0)
const list = ref([])
const goodsList = ref([])
const storeOptions = ref([])
const open = ref(false)
const defaultSort = { prop: 'sort', order: 'descending' }
const form = reactive({
  storeId: vuexStore.getters.storeId,
  type: 'increase',
  id: '',
  description: '',
  status: 'A',
  goodsList: []
})
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  description: '',
  type: ''
})
const rules = {}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getStockList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    imagePath.value = response.data.imagePath
    storeOptions.value = response.data.storeList
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

function handleAdd() {
  reset()
  isView.value = false
  open.value = true
  form.type = 'increase'
  title.value = '新增入库'
}

function handleReduce() {
  reset()
  isView.value = false
  open.value = true
  form.type = 'reduce'
  title.value = '新增出库'
}

function reset() {
  Object.assign(form, {
    id: '',
    storeId: 0,
    status: 'A',
    description: '',
    goodsList: []
  })
  goodsList.value = []
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function selectGoods() {
  openSelectGoodsDialog.value = true
}

function closeSelectGoods() {
  openSelectGoodsDialog.value = false
}

function doSelectGoods(selectData) {
  openSelectGoodsDialog.value = false
  goodsList.value = selectData
  goodsList.value.forEach(function (goods, key) {
    if (!goods.num) {
      goodsList.value[key].num = 1
    }
  })
}

function deleteGoods(row) {
  const dataList = []
  goodsList.value.forEach(function (item) {
    if (item.id != row.id || item.skuId != row.skuId) {
      dataList.push(item)
    }
  })
  goodsList.value = dataList
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (!goodsList.value || goodsList.value.length < 1) {
        modal.alert('请先添加商品')
        return false
      }
      form.goodsList = goodsList.value
      saveStock(form).then(() => {
        modal.msgSuccess('新增成功')
        open.value = false
        getList()
        reset()
      })
    }
  })
}

function handleDetail(row) {
  reset()
  isView.value = true
  const id = row.id
  getStockInfo(id).then(response => {
    Object.assign(form, response.data.stockInfo)
    goodsList.value = response.data.goodsList
    open.value = true
    title.value = '记录详情'
  })
}

function handleDelete(row) {
  const name = row.id
  modal.confirm('是否确认删除"' + name + '"的数据项？').then(function () {
    return deleteStock(row.id, 'D')
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>
<style lang="scss" scoped>
.common-dialog :deep(.el-upload--picture-card) {
  width: 60px;
  height: 50px;
  line-height: 60px;
}
</style>

