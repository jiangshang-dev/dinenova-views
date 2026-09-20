<template>
  <div class="app-container">
    <div class="main-panel">
      <el-form ref="formRef" class="content" :model="form" :rules="rules" label-width="120px">
        <div class="title">充值规则设置</div>
        <el-row v-for="(item, index) in form.rechargeItem" :key="index">
          <el-col :span="24">
            <el-form-item class="recharge-item">
              <el-input v-model="item.rechargeAmount" class="recharge-input" placeholder="充值金额，单位：元" maxlength="10" />
              <span class="recharge-tips">赠送</span>
              <el-input v-model="item.giveAmount" class="give-input" placeholder="赠送金额，单位：元" maxlength="10" />
              <span class="remove el-icon-delete" @click="removeRechargeItem(index)"></span>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="operate"><span class="el-icon-plus" @click="addRechargeItem()"></span></div>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item">
              <el-input v-model="form.remark" rows="4" type="textarea" placeholder="请输入充值说明" maxlength="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item class="recharge-status" label="开启状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">开启</el-radio>
                <el-radio key="D" label="D" value="D">关闭</el-radio>
              </el-radio-group>
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
import { getSettingInfo, saveSetting } from '@/api/balance'

defineOptions({ name: 'BalanceSetting' })

const router = useRouter()
const route = useRoute()
const store = useStore()

const loading = ref(false)
const form = reactive({ rechargeItem: [], remark: '', status: 'A' })
const rules = {
  rechargeItem: [{ required: true, message: '充值项不能为空', trigger: 'blur' }]
}
const formRef = ref(null)

function addRechargeItem() {
  form.rechargeItem.push({ rechargeAmount: '', giveAmount: '' })
}

function removeRechargeItem(i) {
  console.log(i)
  const rechargeItem = []
  form.rechargeItem.forEach(function (item, index) {
    if (i !== index) {
      rechargeItem.push(item)
    }
  })
  form.rechargeItem = rechargeItem
}

function getSettingInfoFn() {
  loading.value = true
  getSettingInfo(undefined).then(response => {
    form.rechargeItem = response.data.rechargeRuleList
    form.remark = response.data.remark
    form.status = response.data.status
    loading.value = false
  })
}

function cancel() {
  store.dispatch('tagsView/delView', route)
  router.push({ path: '/balance/list' })
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
    margin-left: 30px;
    .title {
       padding-left: 120px;
       font-size: 18px;
       height: 50px;
    }
    .operate {
      padding-left: 120px;
      height: 50px;
      .el-icon-plus {
         border: #FFFFFF solid 1px;
         padding: 5px;
         border-radius: 20px;
         background: #113a28;
         color: #FFFFFF;
         cursor: pointer;
      }
    }
    .recharge-status {
       margin-left: 68px;
    }
    .recharge-item {
        min-width: 600px;
       .recharge-input {
          width: 200px;
          float:left;
          margin-right: 2px;
       }
       .give-input {
          width: 200px;
          float:left;
          margin-left: 2px;
       }
      .recharge-tips {
          float:left;
          background: #113a28;
          display: block;
          width: 50px;
          color: #ffffff;
          text-align: center;
          border-radius: 2px;
      }
      .remove {
          color: red;
          cursor: pointer;
          margin-left: 10px;
      }
    }
  }
  .footer {
    margin-top: 10px;
    margin-left: 150px;
  }
}
</style>
