<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="店铺名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入店铺名称"
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
          v-hasPermi="['store:add']">新增店铺</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id"  width="55" />
      <el-table-column label="店铺名称" align="center" prop="name" />
      <el-table-column label="所属商户" align="center" prop="merchantName" width="160">
        <template #default="scope">
          <span>{{ scope.row.merchantName ? scope.row.merchantName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="默认店铺" align="center" prop="isDefault">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isDefault"
            active-value="Y"
            inactive-value="N"
            disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" prop="contact" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="地址" align="center" prop="address" />
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
          v-hasPermi="['store:add']"
          @change="handleStatusChange(scope.row)"></el-switch>
      </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-copy-document"
            v-hasPermi="['store:list']"
            @click="handleQrCode(scope.row)">下载二维码</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['store:add']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['store:add']"
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入店铺名称" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-form-item label="商户logo" prop="logo">
              <el-upload
                :action="uploadAction"
                list-type="picture-card"
                :class="{hide:hideUpload}"
                :file-list="uploadFiles"
                :auto-upload="true"
                :show-file-list="false"
                :headers="uploadHeader"
                :on-success="handleUploadSuccess">
                <img
                  v-if="form.logo"
                  :src="imagePath + form.logo"
                  class="list-img" />
                <i v-if="!form.logo" class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <p class="form-tips">（提示：点击图片修改）</p>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否默认店铺">
              <el-radio-group v-model="form.isDefault">
                <el-radio key="N" label="N" value="N">否</el-radio>
                <el-radio key="Y" label="Y" value="Y">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属商户" prop="merchantId">
              <el-select v-model="form.merchantId" placeholder="请选择所属商户">
                <el-option
                  v-for="item in merchantOptions"
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
            <el-form-item label="联系人姓名" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人姓名" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="联系人电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系人电话" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺详细地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入店铺详细地址" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="营业时间" prop="hours">
              <el-input v-model="form.hours" placeholder="请输入店铺营业时间" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入店铺纬度，为空则程序自己计算" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入店铺经度，为空则程序自己计算" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-form-item label="营业执照" prop="license">
              <el-upload
                :action="uploadAction"
                list-type="picture-card"
                :class="{hide:hideUpload}"
                :file-list="uploadFiles"
                :auto-upload="true"
                :show-file-list="false"
                :headers="uploadHeader"
                :on-success="handleUploadLicenseSuccess">
                <img
                  v-if="form.license"
                  :src="imagePath + form.license"
                  class="list-img" />
                <i v-if="!form.license" class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <p class="form-tips">（提示：点击图片修改）</p>
          <p class="form-tips"><a v-if="form.license" class="link" target="_blank" :href="imagePath + form.license">（查看大图）</a></p>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="统一社会信用码" prop="creditCode">
              <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="银行名称" prop="bankName">
              <el-input v-model="form.bankName" placeholder="请输入银行名称" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="银行卡账户名" prop="bankCardName">
              <el-input v-model="form.bankCardName" placeholder="请输入银行卡账户名" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="银行卡卡号" prop="bankCardNo">
              <el-input v-model="form.bankCardNo" placeholder="请输入银行卡卡号" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="微信支付商户号" prop="wxMchId">
              <el-input v-model="form.wxMchId" placeholder="请输入微信商户号，为空则资金进入平台账户" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="微信支付APIv2" prop="wxMchId">
              <el-input v-model="form.wxApiV2" placeholder="请输入微信支付APIv2，为空则资金进入平台账户" maxlength="32" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="微信支付证书" prop="wxCertPath">
              <div class="cert-upload">
                <el-input v-model="wxCertPath" placeholder="请上传微信支付证书" readonly />
                <el-upload
                  class="upload-cert"
                  :action="uploadAction"
                  :file-list="uploadFiles"
                  :auto-upload="true"
                  :show-file-list="false"
                  :headers="uploadHeader"
                  :on-success="handleUploadCertSuccess">
                  <el-button type="primary" icon="el-icon-upload2" size="small">点击上传</el-button>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="支付宝appId" prop="alipayAppId">
              <el-input v-model="form.alipayAppId" placeholder="请输入微信商户号，为空则资金进入平台账户" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="支付宝应用私钥" prop="alipayPrivateKey">
              <el-input v-model="form.alipayPrivateKey" placeholder="请输入微信支付APIv2，为空则资金进入平台账户" maxlength="10000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-hasPermi="['store:paySetting']">
          <el-col :span="24">
            <el-form-item label="支付宝公钥" prop="alipayPublicKey">
              <el-input v-model="form.alipayPublicKey" placeholder="请输入微信支付APIv2，为空则资金进入平台账户" maxlength="10000" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" placeholder="请输入备注信息内容"></el-input>
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
import { useStore } from 'vuex'
import { parseTime, addDateRange } from '@/utils/fuint'
import modal from '@/plugins/modal'
import FuintQrCode from '@/components/Fuint/QrCode'
import { getToken } from '@/utils/auth'
import { getStoreList, updateStoreStatus, getStoreInfo, saveStore } from '@/api/store'

defineOptions({ name: 'StoreList' })

const vuexStore = useStore()

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
const dateRange = ref([])
const defaultSort = { prop: 'operTime', order: 'descending' }
const form = reactive({
  id: '',
  name: '',
  logo: '',
  merchantId: vuexStore.getters.merchantId,
  wxMchId: '',
  wxApiV2: '',
  wxCertPath: '',
  alipayAppId: '',
  alipayPrivateKey: '',
  alipayPublicKey: '',
  license: '',
  creditCode: '',
  bankName: '',
  bankCardName: '',
  bankCardNo: '',
  isDefault: 'N',
  status: 'A'
})
const wxCertPath = ref('')
const uploadAction = import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload'
const hideUpload = ref(false)
const uploadFiles = ref([])
const uploadHeader = { 'Access-Token': getToken() }
const merchantOptions = ref([])
const imagePath = ref('')
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  status: ''
})
const rules = {
  name: [
    { required: true, message: '店铺名称不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '店铺名称长度必须介于 2 和 30 之间', trigger: 'blur' }
  ],
  merchantId: [{ required: true, message: '所属商户不能为空', trigger: 'blur' }],
  contact: [
    { required: true, message: '联系人姓名不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '联系人姓名长度必须介于 2 和 30 之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '联系人电话不能为空', trigger: 'blur' },
    { min: 6, max: 30, message: '联系人电话长度必须介于 6 和 30 之间', trigger: 'blur' }
  ]
}
const queryForm = ref(null)
const tables = ref(null)
const formRef = ref(null)

function getList() {
  loading.value = true
  getStoreList(addDateRange(queryParams, dateRange.value)).then(response => {
    list.value = response.data.paginationResponse.content
    total.value = response.data.paginationResponse.totalElements
    merchantOptions.value = response.data.merchantList
    imagePath.value = response.data.imagePath
    loading.value = false
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
  const text = row.status == 'A' ? '启用' : '禁用'
  modal.confirm('确认要' + text + '"' + row.name + '"店铺吗？').then(function () {
    return updateStoreStatus(row.id, row.status)
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
  title.value = '新增店铺'
}

function reset() {
  Object.assign(form, {
    id: '',
    name: '',
    logo: '',
    merchantId: vuexStore.getters.merchantId,
    status: 'A',
    isDefault: 'N',
    wxCertPath: ''
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
      saveStore(form).then(() => {
        modal.msgSuccess(form.id ? '修改成功' : '新增成功')
        open.value = false
        getList()
      })
    }
  })
}

function handleQrCode(row) {
  qr.value = { type: 'store', id: row.id }
  openQrCode.value = true
}

function closeDialog() {
  openQrCode.value = false
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getStoreInfo(id).then(response => {
    Object.assign(form, response.data.storeInfo)
    wxCertPath.value = form.wxCertPath
    open.value = true
    title.value = '编辑店铺'
  })
}

function handleDelete(row) {
  const name = row.name || row.id
  modal.confirm('是否确认删除"' + name + '"的数据项？').then(function () {
    return updateStoreStatus(row.id, 'D')
  }).then(() => {
    getList()
    modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function handleUploadSuccess(file) {
  form.logo = file.data.fileName
}

function handleUploadLicenseSuccess(file) {
  form.license = file.data.fileName
}

function handleUploadCertSuccess(file) {
  form.wxCertPath = file.data.fileName
  wxCertPath.value = file.data.fileName
}

getList()
</script>
<style scoped>
.common-dialog :deep(.el-upload--picture-card) {
  width: 60px;
  height: 50px;
  line-height: 50px;
}
.cert-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.cert-upload .el-input {
  flex: 1;
}
.upload-cert :deep(.el-upload) {
  width: auto;
  height: auto;
  line-height: inherit;
}
</style>
