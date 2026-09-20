<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关键字" prop="content">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入关键字"
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
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="消息类型" prop="title">
        <template #default="scope">
          <span class="msg-type">
            <svg-icon icon-class="wechat" class="wechat-icon" />{{ scope.row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="消息键值" align="center" prop="key">
        <template #default="scope">
          <span v-if="scope.row.key">
              <span>{{ scope.row.key }}</span>
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100" prop="status">
        <template #default="scope">
          <span v-if="scope.row.status == 'A'" class="status-active">启用</span>
          <span v-else>禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['subMessage:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息类型" prop="name">
               <el-input v-model="form.name" placeholder="请输入消息类型" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入模板ID，小程序订阅消息模板templateId" maxlength="120" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模板编号" prop="tid">
              <el-input v-model="form.tid" placeholder="请输入模板编号，小程序订阅消息模板编号tid" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(para, key) in form.params" :key="key">
          <el-col :span="24">
            <el-form-item :label="para.name + '参数'" :prop="para.key">
              <el-input v-model="para.value" :placeholder="paramTips" maxlength="259" />
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
import modal from '@/plugins/modal'
import { getSubMessageList, getSubMessageInfo, saveSubMessage, deleteSubMessage } from '@/api/subMessage'

defineOptions({ name: 'SubMessageIndex' })

const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const list = ref([])
const open = ref(false)
const defaultSort = { prop: 'createTime', order: 'descending' }
const form = reactive({ key: '', templateId: '', tid: '', name: '', params: [] })
const paramTips = '格式如：{{thing1.DATA}}，详见小程序模板消息详情'
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  title: '',
  status: ''
})
const rules = {
  name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  templateId: [{ required: true, message: '模板ID不能为空', trigger: 'blur' }],
  tid: [{ required: true, message: '模板编号不能为空', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getSubMessageList(queryParams).then(response => {
    list.value = response.data.dataList
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
  title.value = '新增订阅消息模板'
}

function reset() {
  Object.assign(form, { key: '', name: '', tid: '', templateId: '', params: [] })
  formRef.value?.resetFields()
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveSubMessage(form).then(() => {
        modal.msgSuccess('修改成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleUpdate(row) {
  reset()
  const key = row.key
  getSubMessageInfo(key).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = '编辑订阅消息'
  })
}

function handleDelete(row) {
  modal.confirm('是否确认删除ID等于' + row.id + '的数据项？').then(function () {
    return deleteSubMessage(row.id)
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>
<style rel="stylesheet/scss" lang="scss">
.msg-type {
  padding: 20px;
  display: block;
  border:1px solid #cccccc;
  width: 140px;
  border-radius: 2px;
  color:#080808;
  .wechat-icon {
    color: #52c41a;
  }
}
</style>
