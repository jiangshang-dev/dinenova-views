<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="等级名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入等级名称"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="升级方式" prop="catchType">
        <el-select
          v-model="queryParams.catchType"
          clearable
          placeholder="升级方式">
          <el-option v-for="catchType in catchTypeList" :key="catchType.key" :label="catchType.name" :value="catchType.value" />
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
          v-hasPermi="['userGrade:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="等级" prop="grade" width="55" />
      <el-table-column label="等级名称" align="center" prop="name" />
      <el-table-column label="升级方式" align="center" prop="catchType" />
      <el-table-column label="升级条件值" align="center" prop="catchValue">
        <template #default="scope">
          <span v-if="scope.row.catchValue > 0">
              <span>{{ scope.row.catchValue }}</span>
          </span>
          <span v-else>无条件</span>
        </template>
      </el-table-column>
      <el-table-column label="有效天数" align="center" prop="validDay">
         <template #default="scope">
             <span v-if="scope.row.validDay > 0">{{ scope.row.validDay + '天' }}</span>
             <span v-else>永久</span>
         </template>
      </el-table-column>
      <el-table-column label="支付折扣" align="center" prop="discount">
        <template #default="scope">
          <span v-if="scope.row.discount > 0">{{ scope.row.discount + '折' }}</span>
          <span v-else>无折扣</span>
        </template>
      </el-table-column>
      <el-table-column label="积分加速" align="center" prop="speedPoint">
        <template #default="scope">
          <span v-if="scope.row.speedPoint > 0">{{ scope.row.speedPoint + '倍数' }}</span>
          <span v-else>不加倍</span>
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
            v-hasPermi="['userGrade:add']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['userGrade:add']"
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
            <el-form-item label="等级" prop="grade">
              <el-input v-model="form.grade" placeholder="请输入会员等级，2位数以内的正整数" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="等级名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入等级名称" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="升级条件描述" prop="catchCondition">
              <el-input v-model="form.catchCondition" placeholder="请输入升级条件描述" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="升级权益描述" prop="userPrivilege">
              <el-input v-model="form.userPrivilege" type="textarea" placeholder="请输入升级权益描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="升级方式" prop="catchType">
              <el-select
                v-model="form.catchType"
                clearable
                placeholder="升级方式">
                <el-option v-for="catchType in catchTypeList" :key="catchType.key" :label="catchType.name" :value="catchType.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="升级条件值" prop="catchValue">
              <el-input v-model="form.catchValue" placeholder="请输入升级条件值，单位可能是元、次"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="有效天数" prop="validDay">
              <el-input v-model="form.validDay" placeholder="请输入有效天数，如30，0表示永久有效"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="支付折扣" prop="discount">
              <el-input v-model="form.discount" placeholder="请输入支付折扣，数字，如：8.8"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="积分加速" prop="speedPoint">
              <el-input v-model="form.speedPoint" placeholder="请输入积分加速，积分加速倍数，数字"></el-input>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import modal from '@/plugins/modal'
import { getUserGradeList, updateUserGradeStatus, getUserGradeInfo, saveUserGrade, deleteUserGrade } from '@/api/userGrade'

defineOptions({ name: 'UserGradeIndex' })

const loading = ref(true)
const title = ref('')
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const catchTypeList = ref([])
const open = ref(false)
const defaultSort = { prop: 'createTime', order: 'descending' }
const form = reactive({
  id: '',
  grade: 0,
  name: '',
  catchCondition: '',
  userPrivilege: '',
  catchType: '',
  catchValue: '',
  validDay: '',
  discount: '',
  speedPoint: '',
  status: 'A'
})
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  catchType: '',
  status: ''
})
const rules = {
  grade: [
    { required: true, message: '等级不能为空', trigger: 'blur' },
    { pattern: /^[1-9]{1,2}$/, message: '必须是2位数以内的正整数', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '等级名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '等级名称长度必须介于2 和 100 之间', trigger: 'blur' }
  ],
  catchType: [{ required: true, message: '请选择升级方式', trigger: 'blur' }],
  catchValue: [{ required: true, message: '请输入升级条件值', trigger: 'blur' }],
  validDay: [{ required: true, message: '请输入有效期天数，0表述永久有效', trigger: 'blur' }],
  discount: [{ required: true, message: '请输入支付折扣', trigger: 'blur' }],
  speedPoint: [{ required: true, message: '请输入加分加速倍数', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getUserGradeList(queryParams).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    catchTypeList.value = response.data.catchTypeList
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
  modal.confirm('确认要' + text + '"' + row.name + '"吗？').then(function () {
    return updateUserGradeStatus(row.id, row.status)
  }).then(() => {
    modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === 'N' ? 'A' : 'N'
  })
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
  title.value = '新增会员等级'
}

function reset() {
  Object.assign(form, {
    id: '',
    grade: '',
    name: '',
    status: 'A',
    catchType: '',
    catchValue: '',
    validDay: '',
    discount: '',
    speedPoint: '',
    catchCondition: '',
    userPrivilege: ''
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
      saveUserGrade(form).then(() => {
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
  getUserGradeInfo(id).then(response => {
    Object.assign(form, response.data.userGradeInfo)
    open.value = true
    title.value = '编辑会员等级'
  })
}

function handleDelete(row) {
  const name = row.name
  modal.confirm('是否确认删除"' + name + '"的数据项？').then(function () {
    return deleteUserGrade(row.id)
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

getList()
</script>

