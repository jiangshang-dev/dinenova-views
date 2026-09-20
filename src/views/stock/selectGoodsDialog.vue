<template>
  <el-dialog class="common-dialog" title="选择商品" :model-value="showDialog" @close="close" width="70%" destroy-on-close>
    <el-form :model="params" ref="queryForm" class="main-search" size="small" :inline="true" label-width="100px">
      <el-form-item label="商品关键字" prop="keyword">
        <el-input
          v-model="params.keyword"
          placeholder="请输入商品关键字"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查找商品</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="goodsTables" v-loading="loading" border :data="goodsList">
      <el-table-column width="55" align="center" prop="checked" label="选择">
        <template #default="scope">
          <el-checkbox v-model="scope.row.checked" @change="checkRow($event, scope.$index, scope.row)"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="主图" align="center" width="100">
        <template #default="scope">
          <img class="list-img" :src="imagePath + scope.row.logo">
        </template>
      </el-table-column>
      <el-table-column label="商品条码" width="180" prop="goodsNo" />
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
      <el-table-column label="库存数量" align="center" width="120" prop="type">
        <template #default="scope">
          <span>{{ scope.row.stock ? scope.row.stock : '0' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="params.page"
      v-model:limit="params.pageSize"
      @pagination="getGoodsList" />

    <div class="clearfix"></div>
    <template #footer><div class="dialog-footer">
      <el-button type="primary" @click="doSave()">保存</el-button>
      <el-button @click="close()">取消</el-button>
    </div></template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, watch } from 'vue'
import { selectGoodsList } from '@/api/goods'

defineOptions({ name: 'SelectGoodsDialog' })

const props = defineProps({
  showDialog: { type: Boolean, default: false },
  storeId: { type: Number, default: 0 },
  dataList: { type: Array, default: () => [] }
})

const emit = defineEmits(['closeDialog', 'submit'])

const params = reactive({
  page: 1,
  pageSize: 10,
  keyword: ''
})
const selectData = ref([])
const loading = ref(false)
const goodsList = ref([])
const imagePath = ref('')
const total = ref(0)

function getGoodsList() {
  params.storeId = props.storeId
  selectGoodsList(params).then(response => {
    if (response.data) {
      goodsList.value = response.data.paginationResponse.content
      goodsList.value.forEach(function (goods) {
        goods.checked = false
      })
      goodsList.value.forEach(function (item, key) {
        props.dataList.forEach(function (row) {
          if (item.id == row.id && item.skuId == row.skuId) {
            goodsList.value[key].checked = true
          }
        })
      })
      total.value = response.data.paginationResponse.totalElements
      imagePath.value = response.data.imagePath
    }
  })
}

function checkRow(checked, index, row) {
  if (checked) {
    let isExist = false
    selectData.value.forEach(function (item) {
      if (item.id == row.id && item.skuId == row.skuId) {
        isExist = true
      }
    })
    if (!isExist) {
      selectData.value.push(row)
    }
  } else {
    const dataList = []
    goodsList.value[index].checked = false
    goodsList.value.forEach(function (item) {
      if (item.checked) {
        dataList.push(item)
      }
    })
    selectData.value = dataList
  }
}

function handleQuery() {
  getGoodsList()
}

function close() {
  emit('closeDialog')
}

function doSave() {
  emit('submit', selectData.value)
}

watch(() => props.showDialog, value => {
  if (value) {
    getGoodsList()
  }
})
</script>
<style lang="scss" scoped>
.spec-item {
   display: block;
   float: left;
   margin-right: 5px;
}
.common-dialog :deep(.el-upload--picture-card) {
   width: 60px;
   height: 50px;
   line-height: 60px;
}
</style>
