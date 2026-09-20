<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="桌码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入桌码"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
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
          v-hasPermi="['table:index']">新增桌码</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id"  width="60" />
      <el-table-column label="桌子编码" align="center" prop="code" />
      <el-table-column label="人数限制" align="center" prop="maxPeople" />
      <el-table-column label="所属店铺" align="center" prop="store">
        <template #default="scope">
          <span v-if="scope.row.storeId && scope.row.storeId > 0">
              <span>{{ getName(storeList, scope.row.storeId) }}</span>
          </span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
      <template #default="scope">
        <el-switch
          v-model="scope.row.status"
          active-value="A"
          inactive-value="N"
          v-hasPermi="['table:index']"
          @change="handleStatusChange(scope.row)"></el-switch>
      </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-copy-document"
            v-hasPermi="['table:index']"
            @click="handleQrCode(scope.row)">下载二维码</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['table:index']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['table:index']"
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
    <el-dialog :title="title" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="桌子编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入桌子编码，如：A01" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select v-model="form.storeId" placeholder="请选择所属店铺">
                <el-option
                  v-for="item in storeList"
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
            <el-form-item label="人数上限" prop="maxPeople">
              <el-input-number v-model="form.maxPeople" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入备注信息内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
              <div class="form-tips">提示：数值越小，排行越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
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

    <FuintQrCode :showDialog="openQrCode" :qr="qr" @closeDialog="closeDialog" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { parseTime, getName } from '@/utils/fuint'
import modal from '@/plugins/modal'
import FuintQrCode from '@/components/Fuint/QrCode'
import { getTableList, updateTableStatus, getTableInfo, saveTable } from '@/api/table'

defineOptions({ name: 'TableIndex' })

const qr = ref(null)
const openQrCode = ref(false)
const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const open = ref(false)
const defaultSort = { prop: 'id', order: 'descending' }
const form = reactive({ id: '', code: '', storeId: '', sort: '', maxPeople: 0, status: 'A' })
const storeList = ref([])
const imagePath = ref('')
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  code: '',
  status: ''
})
const rules = {
  code: [
    { required: true, message: '桌码不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '桌码长度必须介于 2 和 30 之间', trigger: 'blur' }
  ],
  storeId: [{ required: true, message: '所属店铺不能为空', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getTableList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    storeList.value = response.data.storeList
    imagePath.value = response.data.imagePath
    loading.value = false
  })
}

function handleQuery() {
  queryParams.page = 1
  getList()
}

function resetQuery() {
  queryForm.value?.resetFields()
  tables.value?.sort(defaultSort.prop, defaultSort.order)
  handleQuery()
}

function handleStatusChange(row) {
  const text = row.status == 'A' ? '启用' : '禁用'
  modal.confirm('确认要' + text + '"' + row.code + '"桌码吗？').then(function () {
    return updateTableStatus(row.id, row.status)
  }).then(() => {
    modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === 'N' ? 'A' : 'N'
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
  title.value = '新增桌码'
}

function reset() {
  Object.assign(form, {
    id: '',
    code: '',
    description: '',
    storeId: '',
    maxPeople: 0,
    sort: 0,
    status: 'A'
  })
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveTable(form).then(() => {
        modal.msgSuccess(form.id ? '修改成功' : '新增成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleQrCode(row) {
  qr.value = { page: '/pages/category/index', type: 'table', id: row.id }
  openQrCode.value = true
}

function closeDialog() {
  openQrCode.value = false
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getTableInfo(id).then(response => {
    Object.assign(form, response.data.tableInfo)
    open.value = true
    title.value = '编辑桌码'
  })
}

function handleDelete(row) {
  const code = row.code || row.id
  modal.confirm('是否确认删除"' + code + '"的数据项？').then(function () {
    return updateTableStatus(row.id, 'D')
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>
