<template>
  <div class="app-container">
    <div class="main-panel">
      <el-form ref="formRef" class="content" :model="form" :rules="rules" label-width="200px">
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="pointNeedConsume" label="返1积分所需消费金额">
              <el-input v-model="form.pointNeedConsume" placeholder="返1积分所需消费金额" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="canUsedAsMoney" label="积分是否可当作现金使用">
              <el-radio-group v-model="form.canUsedAsMoney">
                <el-radio key="true" label="true" value="true">是</el-radio>
                <el-radio key="false" label="false" value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="exchangeNeedPoint" label="多少积分可抵扣1元现金">
              <el-input v-model="form.exchangeNeedPoint" placeholder="多少积分可抵扣1元现金" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="rechargePointSpeed" label="充值返积分倍数">
              <el-input v-model="form.rechargePointSpeed" placeholder="充值返积分倍数" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import modal from '@/plugins/modal'
import { getSettingInfo, saveSetting } from '@/api/point'

defineOptions({ name: 'PointSetting' })

const router = useRouter()
const route = useRoute()
const store = useStore()

const loading = ref(false)
const form = reactive({ pointNeedConsume: '', canUsedAsMoney: 'false', exchangeNeedPoint: '', rechargePointSpeed: '', status: 'A' })
const rules = {
  pointNeedConsume: [
    { required: true, message: '请输入', trigger: 'blur' },
    { pattern: /^[0-9]*$$/, message: '必须输入正整数', trigger: 'blur' }
  ],
  canUsedAsMoney: [{ required: true, message: '请输入', trigger: 'blur' }],
  exchangeNeedPoint: [
    { required: true, message: '请输入', trigger: 'blur' },
    { pattern: /^[0-9]*$/, message: '正整数或含一位小数数字', trigger: 'blur' }
  ],
  rechargePointSpeed: [
    { required: true, message: '请输入', trigger: 'blur' },
    { pattern: /^[+]?((\d*(\.\d{1,1})$)|([1-9]\d*$))/, message: '正整数或含一位小数数字', trigger: 'blur' }
  ]
}
const formRef = ref(null)

function getSettingInfoFn() {
  loading.value = true
  getSettingInfo(undefined).then(response => {
    form.pointNeedConsume = response.data.pointNeedConsume
    form.canUsedAsMoney = response.data.canUsedAsMoney
    form.exchangeNeedPoint = response.data.exchangeNeedPoint
    form.rechargePointSpeed = response.data.rechargePointSpeed
    form.status = response.data.status
    loading.value = false
  })
}

function cancel() {
  store.dispatch('tagsView/delView', route)
  router.push({ path: '/point/list' })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      saveSetting(form).then(() => {
        modal.msgSuccess('保存成功')
        getSettingInfoFn()
      })
    }
  })
}

getSettingInfoFn()
onActivated(() => {
  getSettingInfoFn()
})
</script>
<style rel="stylesheet/scss" lang="scss">
.main-panel {
  .content {
    margin-left: 50px;
    margin-top: 30px;
  }
  .footer {
    margin-top: 10px;
    margin-left: 250px;
  }
}
</style>
