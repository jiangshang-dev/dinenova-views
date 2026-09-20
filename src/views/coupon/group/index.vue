<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分组ID" prop="couponId">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入分组ID"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分组名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分组名称"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
          <el-option key="A" label="启用" value="A" />
          <el-option key="N" label="禁用" value="N" />
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
          v-hasPermi="['coupon:group:edit']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="分组ID" prop="id" width="60" />
      <el-table-column label="分组名称" align="center" prop="name" />
      <el-table-column label="卡券数量" align="center" width="100" prop="num">
        <template #default="scope">
           <span>{{ scope.row.num }}</span>
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
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="N"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['coupon:group:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['coupon:group:edit']"
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="分组名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入分组名称" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="description">
              <el-input v-model="form.description" placeholder="请输入备注信息" type="textarea" rows="5" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item class="recharge-status" label="状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">启用</el-radio>
                <el-radio key="N" label="N" value="N">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getGroupList, updateGroupStatus, getGroupInfo, saveGroup, deleteGroup } from "@/api/coupon/group";


defineOptions({ name: 'CouponGroupIndex' })


const loading = ref(true)

const title = ref("")

const ids = reactive([])

const multiple = ref(true)

const dateRange = ref([])

const showSearch = ref(true)

const total = ref(0)

const list = reactive([])

const userGradeList = reactive([])

const open = ref(false)

const defaultSort = reactive({prop: 'createTime', order: 'descending'})

const form = reactive({ id: '', name: '', description: '', status: 'A' })

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        id: '',
        name: '',
        status: ''
      })

const rules = reactive({
        name: [
          { required: true, message: "分组名称不能为空", trigger: "blur" },
        ]
      })

const queryForm = ref(null)

const formRef = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getGroupList(queryParams).then( response => {
          const page = (response.data && response.data.paginationResponse) || {};
          list.length = 0; list.push(...(page.content || []));
          total.value = page.totalElements || 0;
          userGradeList.length = 0; userGradeList.push(...(response.data.userGradeList || []))
          
        }).finally(() => { loading.value = false });
    }

function handleQuery() {
      queryParams.page = 1;
      getList();
    }

function resetQuery() {
      dateRange.value = [];
      queryForm.value?.resetFields();
      tables.value?.sort(defaultSort.prop, defaultSort.order)
      handleQuery();
    }

function handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      modal.confirm('确认要' + text + 'ID等于' + row.id + '的数据项吗？').then(function() {
        return updateGroupStatus(row.id, row.status);
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
      reset();
      open.value = true;
      title.value = "新增卡券分组";
    }

function reset() {
      Object.assign(form, {
        id: "",
        name: "",
        description: "",
        status: "A"
      });
      formRef.value?.resetFields();
    }

function cancel() {
      open.value = false;
      reset();
    }

function submitForm() {
      formRef.value.validate(valid => {
        if (valid) {
          if (form.id) {
              saveGroup(form).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveGroup(form).then(response => {
                modal.msgSuccess("新增成功");
                open.value = false;
                getList();
              });
          }
        }
      });
    }

function handleUpdate(row) {
      reset();
      const id = row.id || ids;
      getGroupInfo(id).then(response => {
        Object.assign(form, response.data.groupInfo);
        open.value = true;
        title.value = "编辑卡券分组";
      });
    }

function handleDelete(row) {
      modal.confirm('是否确认删除ID等于' + row.id + '的数据项？').then(function() {
        return deleteGroup(row.id);
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

getList();
</script>

