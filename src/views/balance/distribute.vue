<template>
  <div class="app-container">
    <div class="main-panel">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="200px" style="margin-top: 20px;">
        <el-row>
          <el-col :span="24">
            <el-form-item label="充值对象">
              <el-radio-group v-model="form.object" @change="objectChange()">
                <el-radio key="all" label="all" value="all">全部会员</el-radio>
                <el-radio key="part" label="part" value="part">部分会员</el-radio>
                <el-button type="danger" size="small" v-if="form.object == 'all'">总会员数：{{ totalMember }}</el-button>
                <el-button type="primary" size="small" v-if="form.object == 'part'" @click="selectUser()">选择会员（已选{{ form.memberIds.length }}人）</el-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="充值数额" prop="amount">
              <el-input v-model="form.amount" style="width: 200px" placeholder="请输入充值数额" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.description" style="width: 400px" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="footer" style="padding-left: 120px;">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
      </div>
    </div>
    <!--会员选择对话框start-->
    <UserSelect :showDialog="openUserSelect" @doSelectUser="doSelectUser" @closeDialog="closeDialog"></UserSelect>
    <!--会员选择对话框end-->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import modal from '@/plugins/modal'
import UserSelect from '@/components/UserSelect'
import { distribute } from '@/api/balance'
import { getTotalMember } from '@/api/statistic'

defineOptions({ name: 'Distribute' })

const router = useRouter()
const route = useRoute()
const store = useStore()

const openUserSelect = ref(false)
const loading = ref(false)
const totalMember = ref(5430)
const form = reactive({ object: 'all', memberIds: [], amount: '', description: '' })
const rules = {
  amount: [{ required: true, message: '请选择', trigger: 'blur' }]
}
const formRef = ref(null)

function cancel() {
  store.dispatch('tagsView/delView', route)
  router.push('/')
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      ElMessageBox.confirm('您确定要充值吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const userIds = form.memberIds ? form.memberIds.join(',') : ''
        const param = { userIds, object: form.object, amount: form.amount, remark: form.description }
        distribute(param).then(response => {
          if (response.code == '200') {
            modal.msgSuccess('充值成功！')
            Object.assign(form, { object: 'all', memberIds: [], amount: '', description: '' })
          } else {
            modal.msgError('充值失败!')
          }
        })
      }).catch(() => {})
    }
  })
}

function getTotalMemberFn() {
  getTotalMember().then(response => {
    totalMember.value = response.data.totalMember
  })
}

function selectUser() {
  openUserSelect.value = true
}

function closeDialog(dialog) {
  if (dialog == 'selectUser') {
    openUserSelect.value = false
  }
  return true
}

function doSelectUser(memberIds) {
  form.memberIds = memberIds
  openUserSelect.value = false
}

function objectChange() {
  if (form.object == 'all') {
    form.memberIds = []
  }
}

getTotalMemberFn()
</script>
