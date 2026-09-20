<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入阿里云模板编码"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="关键字" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入模板关键字"
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
          v-hasPermi="['openGift:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="模板ID" prop="id" width="66" />
      <el-table-column label="模板名称" align="center" prop="name" />
      <el-table-column label="英文名称" align="center" prop="uname" />
      <el-table-column label="模板编码" align="center" prop="code" />
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
            disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['smsTemplate:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['smsTemplate:edit']"
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
            <el-form-item label="模板名称" prop="name">
               <el-input v-model="form.name" placeholder="请输入要模板名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="英文名称" prop="uname">
              <el-input v-model="form.uname" placeholder="请输入英文名称" maxlength="100" />
              <p class="form-tips">（提示：通常不需要修改）</p>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模板编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入模板编码，阿里云短信模板编码" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模板内容" prop="content">
              <el-input v-model="form.content" type="textarea" rows="3" placeholder="请输入模板内容，阿里云短信模板内容"></el-input>
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
import { ref, reactive } from 'vue'
import { parseTime } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getSmsTemplateList, getSmsTemplateInfo, saveSmsTemplate, deleteSmsTemplate } from '@/api/smsTemplate'

defineOptions({ name: 'SmsTemplateIndex' })

const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const open = ref(false)
const defaultSort = { prop: 'createTime', order: 'descending' }
const form = reactive({ id: '', content: '', code: '', uname: '', name: '', status: 'A' })
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  code: '',
  content: '',
  status: ''
})
const rules = {
  name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  uname: [{ required: true, message: '模板英文名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '模板编码不能为空，请登录短信平台查看', trigger: 'blur' }],
  content: [{ required: true, message: '模板内容不能为空，请登录短信平台查看', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getSmsTemplateList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
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

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
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
  title.value = '新增短信模板'
}

function reset() {
  Object.assign(form, { id: '', name: '', code: '', uname: '', content: '', status: 'A' })
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveSmsTemplate(form).then(() => {
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
  getSmsTemplateInfo(id).then(response => {
    Object.assign(form, response.data.smsTemplate)
    open.value = true
    title.value = '编辑短信模板'
  })
}

function handleDelete(row) {
  modal.confirm('是否确认删除ID等于' + row.id + '的数据项？').then(function () {
    return deleteSmsTemplate(row.id)
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>

