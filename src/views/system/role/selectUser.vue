<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" v-model="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="userList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="ID" align="center" prop="id" />
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope"></template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="getList" />
    </el-row>
    <template #footer><div class="dialog-footer">
      <el-button type="primary" @click="handleSelectUser">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </div></template>
  </el-dialog>
</template>

<script setup>
import { unallocatedUserList, authUserSelectAll } from "@/api/system/role";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'selectUser' })

const props = defineProps({
// 角色编号
    roleId: {
      type: [Number, String]
    }
})

const emit = defineEmits([])

const state = reactive({
// 遮罩层
      visible: false,
      // 选中数组值
      userIds: [],
      // 总条数
      total: 0,
      // 未授权用户数据
      userList: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
        phonenumber: undefined
      }
})
const { visible, userIds, total, userList, queryParams } = toRefs(state)

function show() {

      queryParams.value.roleId = props.roleId;
      getList();
      visible.value = true;
    
}

function clickRow(row) {

      tableRef.value.toggleRowSelection(row);
    
}

function handleSelectionChange(selection) {

      userIds.value = selection.map(item => item.userId);
    
}

function getList() {

      unallocatedUserList(queryParams.value).then(res => {
        userList.value = res.rows;
        total.value = res.total;
      });
    
}

function handleQuery() {

      queryParams.value.page = 1;
      getList();
    
}

function resetQuery() {

      queryFormRef.value?.resetFields();
      handleQuery();
    
}

function handleSelectUser() {

      const roleId = queryParams.value.roleId;
      const userIds = userIds.value.join(",");
      if (userIds == "") {
        modal.msgError("请选择要分配的用户");
        return;
      }
      authUserSelectAll({ roleId: roleId, userIds: userIds }).then(res => {
        modal.msgSuccess(res.msg);
        if (res.code === 200) {
          visible.value = false;
          emit("ok");
        }
      });
    
}
</script>
