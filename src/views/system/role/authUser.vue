<template>
  <div class="app-container">
     <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="openSelectUser"
          v-hasPermi="['system:role:add']">添加用户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-circle-close"
          size="small"
          :disabled="multiple"
          @click="cancelAuthUserAll"
          v-hasPermi="['system:role:remove']">批量取消授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-close"
          size="small"
          @click="handleClose">关闭</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-circle-close"
            @click="cancelAuthUser(scope.row)"
            v-hasPermi="['system:role:remove']">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
    <select-user ref="select" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script setup>
import tab from '@/plugins/tab'
import { getRoleUserList, authUserCancel, authUserCancelAll } from "@/api/system/role";
import selectUser from "./selectUser";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import modal from '@/plugins/modal'

defineOptions({ name: 'AuthUser' })

const router = useRouter()
const route = useRoute()
const state = reactive({
// 遮罩层
      loading: true,
      // 选中用户组
      userIds: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
      }
})
const { loading, userIds, multiple, showSearch, total, userList, queryParams } = toRefs(state)

function getList() {

      loading.value = true;
      getRoleUserList(queryParams.value).then(response => {
          userList.value = response.rows;
          total.value = response.total;
          loading.value = false;
        }
      );
    
}

function handleClose() {

      const obj = { path: "/system/role" };
      tab.closeOpenPage(obj);
    
}

function handleQuery() {

      queryParams.value.page = 1;
      getList();
    
}

function resetQuery() {

      queryFormRef.value?.resetFields();
      handleQuery();
    
}

function handleSelectionChange(selection) {

      userIds.value = selection.map(item => item.userId)
      multiple.value = !selection.length
    
}

function openSelectUser() {

      selectRef.value.show();
    
}

function cancelAuthUser(row) {

      const roleId = queryParams.value.roleId;
      modal.confirm('确认要取消该用户"' + row.userName + '"角色吗？').then(function() {
        return authUserCancel({ userId: row.userId, roleId: roleId });
      }).then(() => {
        getList();
        modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    
}

function cancelAuthUserAll(row) {

      const roleId = queryParams.value.roleId;
      const userIds = userIds.value.join(",");
      modal.confirm('是否取消选中用户授权数据项？').then(function() {
        return authUserCancelAll({ roleId: roleId, userIds: userIds });
      }).then(() => {
        getList();
        modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    
}

getList()
</script>
