<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员ID"
          clearable
          style="width: 140px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入会员手机号"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="卡券ID" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入卡券ID"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          style="width: 100px"
          clearable>
          <el-option key="A" label="正常" value="A" />
          <el-option key="D" label="撤销" value="D" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="会员ID" align="center" prop="userId" />
      <el-table-column label="手机号" align="center" width="120" prop="mobile">
        <template #default="scope">
          <span v-if="scope.row.mobile">{{ scope.row.mobile }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券名称" align="center" prop="couponNames">
        <template #default="scope">
          <span v-if="scope.row.couponNames">{{ scope.row.couponNames }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="转赠手机号" align="center" prop="userMobile">
         <template #default="scope">
             <span v-if="scope.row.userMobile">{{ scope.row.userMobile }}</span>
             <span v-else>-</span>
         </template>
      </el-table-column>
      <el-table-column label="转赠数量" align="center" prop="num">
        <template #default="scope">
          <span>{{ scope.row.num }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额(元)" align="center" prop="money">
        <template #default="scope">
          <span v-if="scope.row.money">{{scope.row.money }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="转赠时间" align="center" width="180" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.createTime">{{ scope.row.createTime }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <span v-if="scope.row.status == 'A'">正常</span>
          <span v-else>撤销</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="68">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            v-if="scope.row.status == 'A'"
            icon="el-icon-view"
            v-hasPermi="['coupon:give:index']"
            @click="handleDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <el-dialog title="转赠明细" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-table ref="tables" v-loading="loading" :data="itemList">
        <el-table-column label="ID" align="center" prop="id" width="60" />
        <el-table-column label="手机号" align="center" width="120" prop="mobile" />
        <el-table-column label="赠予手机号" align="center" width="120" prop="userMobile" />
        <el-table-column label="卡券名称" align="center" prop="couponName" />
        <el-table-column label="总金额" align="center" prop="money" />
        <el-table-column label="赠送时间" align="center" prop="createTime">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { parseTime } from '@/utils/fuint'

import { getGiveLogList, getGiveItem } from "@/api/coupon/give";


defineOptions({ name: 'GiveIndex' })


const loading = ref(true)

const ids = reactive([])

const multiple = ref(true)

const dateRange = ref([])

const showSearch = ref(true)

const open = ref(false)

const itemList = reactive([])

const total = ref(0)

const list = reactive([])

const typeList = reactive([])

const defaultSort = reactive({prop: 'createTime', order: 'descending'})

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        mobile: '',
        userId: '',
        couponId: '',
        status: ''
      })

const queryForm = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getGiveLogList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          typeList.length = 0; typeList.push(...(response.data.typeList || []));
          loading.value = false;
        }
      );
    }

function handleQuery() {
      queryParams.page = 1;
      getList();
    }

function resetQuery() {
      dateRange.value = [];
      queryForm.value?.resetFields();
      tables.value.sort(defaultSort.prop, defaultSort.order)
      handleQuery();
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

function handleDetail(row) {
      loading.value = true;
      getGiveItem(row.id).then( response => {
          itemList.length = 0; itemList.push(...(response.data.itemList || []));
          open.value = true
          loading.value = false;
        }
      );
    }

getList();
</script>

