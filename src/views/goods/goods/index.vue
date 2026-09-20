<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" class="main-search" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属店铺" prop="store">
        <el-select
          v-model="queryParams.storeId"
          placeholder="所属店铺"
          clearable
          style="width: 180px">
          <el-option :key="0" label="公共商品" v-if="!storeId" :value="0" />
          <el-option v-for="storeInfo in storeOptions" :key="storeInfo.id" :label="storeInfo.name" :value="storeInfo.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品分类" prop="cateId">
        <el-select class="input" v-model="queryParams.cateId" clearable placeholder="请选择商品分类">
          <el-option
            v-for="item in cateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            :disabled="item.status !== 'A'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品条码" prop="goodsNo">
        <el-input
          v-model="queryParams.goodsNo"
          placeholder="请输入商品条码"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品类型" prop="type">
        <el-select class="input" v-model="queryParams.type" clearable placeholder="请选择商品类型">
          <el-option
            v-for="item in typeOptions"
            :key="item.key"
            :label="item.name"
            :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="规格类型" prop="isSingleSpec">
        <el-select
          v-model="queryParams.isSingleSpec"
          placeholder="规格类型"
          clearable
          style="width: 120px">
          <el-option key="Y" label="单规格" value="Y" />
          <el-option key="N" label="多规格" value="N" />
        </el-select>
      </el-form-item>
      <el-form-item label="上架状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="上架状态"
          clearable
          style="width: 120px">
          <el-option key="A" label="上架" value="A" />
          <el-option key="N" label="下架" value="N" />
        </el-select>
      </el-form-item>
      <el-form-item label="库存状态" prop="stock">
        <el-select
          v-model="queryParams.stock"
          placeholder="库存状态"
          clearable
          style="width: 120px">
          <el-option key="Y" label="有库存" value="Y" />
          <el-option key="N" label="无库存" value="N" />
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
          v-hasPermi="['goods:goods:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="50" />
      <el-table-column label="所属店铺" align="center">
        <template #default="scope">
          <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" min-width="300" prop="name" />
      <el-table-column label="主图" align="center" width="100">
        <template #default="scope">
           <img class="list-img" :src="scope.row.logo">
        </template>
      </el-table-column>
      <el-table-column label="商品条码" align="center" prop="goodsNo" width="140" />
      <el-table-column label="剩余库存" align="center" prop="stock" width="100" />
      <el-table-column label="所属分类" align="center">
        <template #default="scope">
          <span>{{ scope.row.cateInfo.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.price">{{ scope.row.price.toFixed(2) }}</span>
          <span v-else>0.00</span>
        </template>
      </el-table-column>
      <el-table-column label="上架状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="N"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="150" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="150" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['goods:goods:edit']"
            @click="handleUpdate(scope.row)"
            v-if="storeId == scope.row.storeId || storeId == 0">编辑</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['goods:goods:edit']"
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
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import { useStore } from 'vuex'

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getGoodsList, updateGoodsStatus } from "@/api/goods";


defineOptions({ name: 'GoodsIndex' })


const router = useRouter()
const route = useRoute()

const store = useStore()

const storeId = store.getters.storeId

const loading = ref(true)

const ids = reactive([])

const multiple = ref(true)

const showSearch = ref(true)

const total = ref(0)

const list = reactive([])

const storeOptions = reactive([])

const typeOptions = reactive([])

const cateList = reactive([])

const open = ref(false)

const defaultSort = reactive({prop: 'sort', order: 'descending'})

const form = reactive({ id: '', name: '', logo: '', sort: 0, status: "A" })

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const hideUpload = ref(false)

const uploadFiles = reactive([])

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        storeId: '',
        cateId: '',
        name: '',
        isSingleSpec: '',
        goodsNo: '',
        stock: '',
        status: ''
      })

const rules = reactive({
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" },
          { min: 2, max: 200, message: '名称长度必须介于2 和 200 之间', trigger: 'blur' }
        ],
        logo: [{ required: true, message: "请上传图片", trigger: "blur" }]
      })

const queryForm = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getGoodsList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          typeOptions.length = 0; typeOptions.push(...(response.data.typeList || []));
          storeOptions.length = 0; storeOptions.push(...(response.data.storeList || []));
          cateList.length = 0; cateList.push(...(response.data.cateList || []));
          loading.value = false;
        }
      );
    }

function handleQuery() {
      queryParams.page = 1;
      getList();
    }

function resetQuery() {
      queryForm.value?.resetFields();
      tables.value.sort(defaultSort.prop, defaultSort.order)
      handleQuery();
    }

function handleStatusChange(row) {
      let text = row.status == "A" ? "上架" : "下架";
      modal.confirm('确认要' + text + '"' + row.name + '"吗？').then(function() {
        return updateGoodsStatus(row.id, row.status);
      }).then(() => {
        modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "N" ? "A" : "N";
      });
    }

function handleSelectionChange(selection) {
      ids.length = 0; ids.push(...(selection.map(item => item.id) || []))
      multiple.value = !selection.length
    }

function handleSortChange(column, prop, order) {
      queryParams.orderByColumn = column.prop;
      queryParams.isAsc = column.order;
      getList();
    }

function handleAdd() {
      router.push( { path: '/goods/goods/add' } )
    }

function handleUpdate(row) {
      router.push('/goods/goods/edit?goodsId=' + row.id)
    }

function handleDelete(row) {
      const name = row.name
      modal.confirm('是否确认删除商品"' + name + '"？').then(function() {
        return updateGoodsStatus(row.id, 'D');
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

function handleUploadSuccess(file) {
      form.logo = file.data.fileName
    }

function handleRemove(file, fileList) {
      setTimeout(() => {
        hideUpload.value = fileList.length > 0
      }, 520)
    }

getList();
</script>

