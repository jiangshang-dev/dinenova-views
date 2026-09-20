<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="员工类别" prop="category">
        <el-select v-model="queryParams.category" clearable placeholder="请选择员工类别">
          <el-option
            v-for="item in categoryOptions"
            :key="item.key"
            :label="item.name"
            :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入姓名"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="auditedStatus">
        <el-select
          v-model="queryParams.auditedStatus"
          placeholder="状态"
          clearable
          style="width: 240px">
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
          v-hasPermi="['staff:list']">新增员工</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="类别" align="center" prop="category">
        <template #default="scope">
          <span v-if="scope.row.category">
              <span>{{ getName(categoryOptions, scope.row.category) }}</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="realName" />
      <el-table-column label="手机号" align="center" prop="mobile" />
      <el-table-column label="关联会员ID" align="center" prop="userId" />
      <el-table-column label="所属店铺" align="center" prop="storeName">
        <template #default="scope">
          <span v-if="scope.row.storeId">
              <span>{{ getName(storeOptions, scope.row.storeId) }}</span>
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="storeName">
      <template #default="scope">
        <el-switch
          v-model="scope.row.auditedStatus"
          active-value="A"
          inactive-value="N"
          @change="handleStatusChange(scope.row)"></el-switch>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['staff:list']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['staff:list']"
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
            <el-form-item label="员工类别" prop="category">
              <el-select v-model="form.category" placeholder="请选择员工类别">
                <el-option key="0" label="请选择员工类别" value="0"></el-option>
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.key"
                  :label="item.name"
                  :value="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入姓名" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入联系人电话" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select v-model="form.storeId" placeholder="请选择所属店铺">
                <el-option :key="0" label="全部店铺" :value="0"></el-option>
                <el-option
                  v-for="item in storeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.auditedStatus">
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
import { ref, reactive } from 'vue'
import { parseTime, getName, addDateRange } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getStaffList, getStaffInfo, updateStaffStatus, deleteStaff, saveStaff } from '@/api/staff'
import { searchStore } from '@/api/store'

defineOptions({ name: 'StaffList' })

const title = ref('')
const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const categoryOptions = ref([])
const storeOptions = ref([])
const total = ref(0)
const list = ref([])
const open = ref(false)
const dateRange = ref([])
const defaultSort = { prop: 'createTime', order: 'descending' }
const form = reactive({ id: '', category: '0', realName: '', auditedStatus: 'A', mobile: '', storeId: '' })
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  realName: '',
  mobile: '',
  auditedStatus: ''
})
const rules = {
  realName: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '姓名长度必须介于 2 和 20 之间', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { min: 11, max: 20, message: '手机号长度必须11', trigger: 'blur' }
  ],
  storeId: [{ required: true, message: '请选择所属店铺', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getStaffList(addDateRange(queryParams, dateRange.value)).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    categoryOptions.value = response.data.categoryList
    loading.value = false
  })
}

function getStoreListFn() {
  searchStore().then(response => {
    storeOptions.value = response.data.storeList
  })
}

function handleQuery() {
  queryParams.page = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  queryForm.value?.resetFields()
  tables.value?.sort(defaultSort.prop, defaultSort.order)
  handleQuery()
}

function handleStatusChange(row) {
  const text = row.auditedStatus == 'A' ? '启用' : '禁用'
  modal.confirm('确认要' + text + '"' + row.realName + '"吗？').then(function () {
    return updateStaffStatus(row.id, row.auditedStatus)
  }).then(() => {
    modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.auditedStatus = row.auditedStatus === 'A' ? 'A' : 'N'
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.operId)
  multiple.value = !selection.length
}

function handleSortChange(column) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增员工'
}

function reset() {
  Object.assign(form, { id: '', name: '', category: '0', auditedStatus: 'A' })
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveStaff(form).then(() => {
        modal.msgSuccess(form.id ? '修改成功' : '新增成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getStaffInfo(id).then(response => {
    Object.assign(form, response.data.staffInfo)
    form.category = response.data.staffInfo.category + ''
    open.value = true
    title.value = '编辑员工信息'
  })
}

function handleDelete(row) {
  const name = row.realName || row.id
  modal.confirm('是否确认删除"' + name + '"的数据项？').then(function () {
    return deleteStaff(row.id)
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
getStoreListFn()
</script>

