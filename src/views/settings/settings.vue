<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { addDateRange } from '@/utils/fuint'
import modal from '@/plugins/modal'
import { getDelete, getInfo, getSettingsList, save, updateStatus } from '@/api/settings/settings'
import { getStoreList } from '@/api/store'

defineOptions({ name: 'Settings' })

const merchantOptions = ref([])
const loading = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')
const form = reactive({})
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  code: '',
  status: ''
})
const list = ref([])
const dateRange = ref([])
const ids = ref([])
const defaultSort = { prop: 'id', order: 'descending' }
const rules = {
  color: [
    { required: true, message: '桌码不能为空', trigger: 'blur' },
    { min: 3, max: 7, message: '颜色编码长度必须介于 3 和 7 之间', trigger: 'blur' }
  ],
  merchantId: [{ required: true, message: '所属商户不能为空', trigger: 'blur' }]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function cancel() {}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      save(form).then(() => {
        modal.msgSuccess(form.id ? '修改成功' : '新增成功')
        open.value = false
        getList()
      })
    }
  })
}

function getList() {
  getSettingsList(queryParams).then(res => {
    console.log('res=====', res.data)
    console.log('res=====', res.data.paginationResponse.content)
    list.value = res.data.paginationResponse.content
    total.value = res.data.paginationResponse.totalElements
    loading.value = false
  })
  getStoreList(addDateRange(queryParams, dateRange.value)).then(response => {
    merchantOptions.value = response.data.merchantList
    loading.value = false
  })
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增'
}

function handleUpdate(row) {
  open.value = true
  title.value = '修改'
  const id = row.id || ids.value
  getInfo(id).then(response => {
    console.log('ressss', response.data.mt_all_settingInfo)
    Object.assign(form, response.data.mt_all_settingInfo)
    open.value = true
    title.value = '编辑桌码'
  })
}

function handleDelete(row) {
  getDelete(row.id).then(() => {
    ElMessage({ message: '删除成功', type: 'success' })
    getList()
  })
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

function handleStatusChange(row) {
  console.log('row:', row)
  const text = row.status == 'A' ? '启用' : '禁用'
  modal.confirm('确认要' + text + '"' + row.id + '"吗？').then(function () {
    return updateStatus(row.id, row.status)
  }).then(() => {
    modal.msgSuccess(text + '成功')
  }).catch(function () {
    row.status = row.status === 'S' ? 'A' : 'S'
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

getList()
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px"
        >
          <el-option key="A" label="启用" value="A"/>
          <el-option key="N" label="禁用" value="N"/>
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
          v-hasPermi="['table:index']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list">
      <el-table-column label="ID" prop="id" width="60"/>
      <el-table-column label="所属商户" align="center" prop="merchantName"/>
      <el-table-column label="小程序图片" align="center" prop="color"/>
      <el-table-column label="小程序页面" align="center" prop="page"/>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="S"
            v-hasPermi="['table:index']"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['table:index']"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="false"
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['table:index']"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属商户" prop="merchantId">
              <el-select v-model="form.merchantId" placeholder="请选择所属商户">
                <el-option
                  v-for="item in merchantOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="小程序颜色" prop="color">
              <el-input v-model="form.color" placeholder="请输入颜色编码，如：#FFFFFF" maxlength="30"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="小程序页面">
              <el-input v-model="form.page" rows="3" placeholder="请输入小程序页面"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0"/>
              <div class="form-tips">提示：数值越小，排行越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">启用</el-radio>
                <el-radio key="S" label="S" value="S">禁用</el-radio>
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

<style scoped>

</style>
