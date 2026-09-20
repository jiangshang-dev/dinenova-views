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
      <el-table-column label="流水号" align="center" prop="code" width="200" />
      <el-table-column label="会员ID" align="center" prop="userInfo.id" />
      <el-table-column label="手机号" align="center" width="120" prop="userInfo.mobile">
        <template #default="scope">
          <span v-if="scope.row.userInfo.mobile">{{ scope.row.userInfo.mobile }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="会员名称" align="center" prop="userInfo.name">
        <template #default="scope">
          <span v-if="scope.row.userInfo.name">
              <span>{{ scope.row.userInfo.name }}</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券类型" align="center" prop="couponInfo.type">
        <template #default="scope">
          <span v-if="scope.row.couponInfo">{{ getName(typeList, scope.row.couponInfo.type) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券名称" align="center" prop="couponInfo.name">
        <template #default="scope">
          <span v-if="scope.row.couponInfo">{{ scope.row.couponInfo.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属店铺" align="center" prop="storeInfo.name">
        <template #default="scope">
          <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
          <span v-else>暂无</span>
        </template>
      </el-table-column>
      <el-table-column label="核销金额" align="center" prop="amount">
         <template #default="scope">
             <span v-if="scope.row.amount" style="color:red">{{ scope.row.amount }}元</span>
             <span v-else>-</span>
         </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark">
        <template #default="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销人" align="center" prop="status">
        <template #default="scope">
          <span v-if="scope.row.operator">{{scope.row.operator }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="核销时间" align="center" width="150" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.createTime">{{ parseTime(scope.row.createTime) }}</span>
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
            icon="el-icon-delete"
            v-hasPermi="['coupon:confirm:index']"
            @click="handleDelete(scope.row)">撤销</el-button>
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

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getName } from '@/utils/fuint'

import { getConfirmLogList, rollbackUserCoupon } from "@/api/coupon/confirmLog";


defineOptions({ name: 'ConfirmLogIndex' })


const loading = ref(true)

const ids = reactive([])

const multiple = ref(true)

const dateRange = ref([])

const showSearch = ref(true)

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
      getConfirmLogList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          typeList.length = 0; typeList.push(...(response.data.typeList || []))
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

function handleDelete(row) {
      modal.confirm('是否确认撤销ID等于' + row.id + '的数据项？').then(function() {
        return rollbackUserCoupon(row.id, row.userCouponId);
      }).then(() => {
        getList();
        modal.msgSuccess("撤销成功");
      }).catch(() => {});
    }

getList();
</script>

