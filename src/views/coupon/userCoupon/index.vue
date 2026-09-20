<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入ID"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="卡券ID" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入卡券ID"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员ID"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员号" prop="userNo">
        <el-input
          v-model="queryParams.userNo"
          placeholder="请输入会员号"
          clearable
          style="width: 150px;"
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
      <el-form-item label="核销码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入核销二维码"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          style="width: 150px"
          clearable>
          <el-option v-for="statusInfo in statusList" :key="statusInfo.key" :label="statusInfo.name" :value="statusInfo.key" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery(false)">搜索</el-button>
        <el-button type="danger" icon="el-icon-download" size="small" @click="handleQuery(true)">导出</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="60" />
      <el-table-column label="核销码" prop="code" width="150" />
      <el-table-column label="会员ID" align="center" prop="userInfo.id">
        <template #default="scope">
          <span v-if="scope.row.userInfo">
              <span>{{ scope.row.userInfo.id }}</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="会员号" align="center" width="130" prop="userInfo.userNo">
        <template #default="scope">
          <span v-if="scope.row.userInfo && scope.row.userInfo.userNo">{{ scope.row.userInfo.userNo }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" width="120" prop="userInfo.mobile">
        <template #default="scope">
          <span v-if="scope.row.userInfo">{{ scope.row.userInfo.mobile ? scope.row.userInfo.mobile : '-' }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="会员名称" align="center" prop="userInfo.name">
        <template #default="scope">
          <span v-if="scope.row.userInfo">
              <span>{{ scope.row.userInfo.name }}</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券类型" align="center" prop="type">
        <template #default="scope">
          <span v-if="scope.row.type">{{ getName(typeList, scope.row.type) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券名称" align="center" prop="name" />
      <el-table-column label="所属店铺" align="center" prop="storeInfo">
        <template #default="scope">
          <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
          <span v-else>暂无</span>
        </template>
      </el-table-column>
      <el-table-column label="面额(元)" align="center" prop="amount">
         <template #default="scope">
           <span style="color:red">{{ scope.row.amount }}</span>
         </template>
      </el-table-column>
      <el-table-column label="余额(元)" align="center" prop="balance">
        <template #default="scope">
          <span v-if="scope.row.balance" style="color:forestgreen">{{ scope.row.balance }}</span>
          <span v-else style="color:forestgreen">{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <span v-if="scope.row.status">{{ getName(statusList, scope.row.status) }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="领取时间" align="center" width="150" prop="createTime">
        <template #default="scope">
          <span v-if="scope.row.createTime">{{ parseTime(scope.row.createTime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed='right' width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.status == 'A'"
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['coupon:confirm:index']"
            @click="handleConfirm(scope.row)">核销</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['coupon:userCoupon:delete']"
            @click="handleDelete(scope.row)">作废</el-button>
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

import modal from '@/plugins/modal'

import { download } from '@/utils/request'

import { parseTime } from '@/utils/fuint'

import { getName } from '@/utils/fuint'

import { getToken } from "@/utils/auth";
import { getUserCouponList, deleteUserCoupon } from "@/api/coupon/userCoupon";


defineOptions({ name: 'UserCouponIndex' })


const router = useRouter()
const route = useRoute()

const loading = ref(true)

const ids = reactive([])

const multiple = ref(true)

const dateRange = ref([])

const showSearch = ref(true)

const total = ref(0)

const list = reactive([])

const typeList = reactive([])

const statusList = reactive([])

const defaultSort = reactive({prop: 'createTime', order: 'descending'})

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        mobile: '',
        userId: '',
        userNo: '',
        status: '',
        id: '',
        couponId: ''
      })

const queryForm = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getUserCouponList(queryParams).then(response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          typeList.length = 0; typeList.push(...(response.data.typeList || []));
          statusList.length = 0; statusList.push(...(response.data.statusList || []));
          loading.value = false;
        }
      );
    }

function exportExcel() {
      download('/backendApi/userCoupon/exportList', {
        ...queryParams
      })
    }

function handleQuery(isExport) {
      queryParams.page = 1;
      if (isExport) {
          exportExcel();
      } else {
          getList();
      }
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
      modal.confirm('是否确认作废ID等于' + row.id + '的数据项？').then(function() {
        return deleteUserCoupon(row.id);
      }).then(() => {
        getList();
        modal.msgSuccess("作废成功");
      }).catch(() => {});
    }

function handleConfirm(row) {
      router.push('/coupon/confirm/index?code=' + row.code);
    }

getList();
</script>

