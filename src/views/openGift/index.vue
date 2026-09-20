<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="卡券ID" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入卡券ID"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="会员等级" prop="gradeId">
        <el-select
          v-model="queryParams.gradeId"
          clearable
          placeholder="会员等级">
          <el-option v-for="grade in userGradeList" :key="grade.id" :label="grade.name" :value="grade.id" />
        </el-select>
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
          v-hasPermi="['openGift:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="55" />
      <el-table-column label="会员等级" align="center" prop="gradeInfo.name" />
      <el-table-column label="赠送卡券" align="center" prop="couponInfo.name">
        <template #default="scope">
          <span v-if="scope.row.couponInfo">
              <span>{{ scope.row.couponInfo.name }}</span>
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="卡券数量" align="center" prop="couponNum" />
      <el-table-column label="赠送积分" align="center" prop="point">
         <template #default="scope">
             <span v-if="scope.row.point > 0">{{ scope.row.point }}</span>
             <span v-else>无</span>
         </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ scope.row.updateTime }}</span>
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
            v-hasPermi="['openGift:add']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['openGift:add']"
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
            <el-form-item label="会员等级" prop="gradeId">
              <el-select
                v-model="form.gradeId"
                style="width: 240px"
                placeholder="会员等级">
                <el-option v-for="grade in userGradeList" :key="grade.id" :label="grade.name" :value="grade.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券ID" prop="couponId">
              <el-input v-model="form.couponId" placeholder="请输入要赠送的卡券ID" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券数量" prop="couponNum">
              <el-input v-model="form.couponNum" placeholder="请输入要赠送的卡券数量" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="积分数量" prop="point">
              <el-input v-model="form.point" placeholder="请输入赠送积分数量"></el-input>
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

import { getOpenGiftList, updateOpenGiftStatus, getOpenGiftInfo, saveOpenGift, deleteOpenGift } from "@/api/openGift";


defineOptions({ name: 'OpenGiftIndex' })


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

const form = reactive({ id: '', gradeId: '', couponId: '', couponNum: '', point: '', status: "A" })

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        couponId: '',
        gradeId: '',
        status: ''
      })

const rules = reactive({
        gradeId: [
          { required: true, message: "会员等级不能为空", trigger: "blur" },
        ]
      })

const queryForm = ref(null)

const formRef = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getOpenGiftList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          userGradeList.length = 0; userGradeList.push(...(response.data.userGradeList || []))
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

function handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      modal.confirm('确认要' + text + 'ID等于' + row.id + '的数据项吗？').then(function() {
        return updateOpenGiftStatus(row.id, row.status);
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
      title.value = "新增开卡赠礼";
    }

function reset() {
      Object.assign(form, {
        id: "",
        gradeId: "",
        couponId: "",
        couponNum: "",
        point: ""
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
              saveOpenGift(form).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveOpenGift(form).then(response => {
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
      getOpenGiftInfo(id).then(response => {
        form.id = response.data.openGiftInfo.id;
        if (response.data.openGiftInfo.gradeInfo) {
            form.gradeId = response.data.openGiftInfo.gradeInfo.id
        }
        if (response.data.openGiftInfo.couponInfo) {
            form.couponId = response.data.openGiftInfo.couponInfo.id;
            form.couponNum = response.data.openGiftInfo.couponNum;
        }
        form.point = response.data.openGiftInfo.point;
        open.value = true;
        title.value = "编辑开卡赠礼";
      });
    }

function handleDelete(row) {
      modal.confirm('是否确认删除ID等于' + row.id + '的数据项？').then(function() {
        return deleteOpenGift(row.id);
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

getList();
</script>

