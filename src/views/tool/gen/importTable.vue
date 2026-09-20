<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" v-model="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true">
      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名称"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="请输入表描述"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="表名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间"></el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="getList" />
    </el-row>
    <template #footer><div class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </div></template>
  </el-dialog>
</template>

<script setup>
import { listDbTable, importTable } from "@/api/tool/gen";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'importTable' })

const emit = defineEmits([])

const state = reactive({
// 遮罩层
      visible: false,
      // 选中数组值
      tables: [],
      // 总条数
      total: 0,
      // 表数据
      dbTableList: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      }
})
const { visible, tables, total, dbTableList, queryParams } = toRefs(state)

function show() {

      getList();
      visible.value = true;
    
}

function clickRow(row) {

      tableRef.value.toggleRowSelection(row);
    
}

function handleSelectionChange(selection) {

      tables.value = selection.map(item => item.tableName);
    
}

function getList() {

      listDbTable(queryParams.value).then(res => {
        if (res.code === 200) {
          dbTableList.value = res.rows;
          total.value = res.total;
        }
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

function handleImportTable() {

      const tableNames = tables.value.join(",");
      if (tableNames == "") {
        modal.msgError("请选择要导入的表");
        return;
      }
      importTable({ tables: tableNames }).then(res => {
        modal.msgSuccess(res.msg);
        if (res.code === 200) {
          visible.value = false;
          emit("ok");
        }
      });
    
}
</script>
