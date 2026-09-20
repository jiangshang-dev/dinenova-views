<template>
  <div class="app-container">
    <div class="main-panel">
      <el-form ref="formRef" class="content" :model="form" :rules="rules" label-width="200px">
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="isClose" label="关闭系统交易功能">
              <el-radio-group v-model="form.isClose">
                <el-radio key="false" label="false" value="false">否</el-radio>
                <el-radio key="true" label="true" value="true">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="deliveryFee" label="每笔订单配送费用">
              <el-input v-model="form.deliveryFee" placeholder="每笔订单配送费用，单位：元" maxlength="10" />
              <span class="tips">单位：元</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="recharge-item" prop="deliveryMinAmount" label="每笔订单起送金额">
              <el-input v-model="form.deliveryMinAmount" placeholder="每笔订单起送金额，单位：元，0表示不限制" maxlength="10" />
              <span class="tips">单位：元</span>
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
import { onActivated, reactive, ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import { useStore } from 'vuex'

import modal from '@/plugins/modal'

import { getSettingInfo as fetchSettingInfo, saveSetting } from '@/api/order'


defineOptions({ name: 'OrderSetting' })


const router = useRouter()
const route = useRoute()

const store = useStore()

const loading = ref(false)

const form = reactive({ deliveryFee: '', isClose: 'false', deliveryMinAmount: '' })

const rules = reactive({
        deliveryFee: [
          { required: true, message: "请输入", trigger: "blur" },
          { min: 0, max: 4, message: `请输入1000以内数字`, trigger: 'blur' }
        ],
        isClose: [
          { required: true, message: "请输入", trigger: "blur" },
        ],
        deliveryMinAmount: [
          { required: true, message: "请输入", trigger: "blur" },
          { min: 0, max: 4, message: `请输入1000以内数字，0表示不限制`, trigger: 'blur' }
        ],
      })

const formRef = ref(null)

function loadSettingInfo() {
      loading.value = true;
      fetchSettingInfo().then(response => {
          form.deliveryFee = response.data.deliveryFee;
          form.isClose = response.data.isClose;
          form.deliveryMinAmount = response.data.deliveryMinAmount;
          loading.value = false;
        }
      );
    }

function cancel() {
      store.dispatch('tagsView/delView', route)
      router.push( { path: '/point/list' } );
    }

function submitForm() {
      formRef.value.validate(valid => {
        if (valid) {
            saveSetting(form).then(response => {
              modal.msgSuccess("保存成功");
              loadSettingInfo();
            });
        }
      });
    }

loadSettingInfo();

onActivated(() => {
loadSettingInfo();
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
  .tips {
    font-size: 12px;
    color: #888888;
  }
}
</style>
