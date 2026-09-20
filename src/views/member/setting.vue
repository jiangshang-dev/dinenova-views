<template>
  <div class="app-container">
    <div class="main-panel">
      <el-form ref="form" :model="form" :rules="rules" label-width="200px" style="margin-top: 20px;">
        <el-row>
          <el-col :span="24">
            <el-form-item label="领券是否需要手机号" prop="getCouponNeedPhone">
              <el-select v-model="form.getCouponNeedPhone" placeholder="领券是否需要手机号">
                <el-option key="true" label="是" value="true" />
                <el-option key="false" label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="提交订单是否需要手机号" prop="submitOrderNeedPhone">
              <el-select v-model="form.submitOrderNeedPhone" placeholder="提交订单是否需要手机号">
                <el-option key="true" label="是" value="true" />
                <el-option key="false" label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="登录是否需要手机号" prop="loginNeedPhone">
              <el-select v-model="form.loginNeedPhone" placeholder="登录是否需要手机号">
                <el-option key="true" label="是" value="true" />
                <el-option key="false" label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否开通微信会员卡" prop="openWxCard">
              <el-select v-model="form.openWxCard" placeholder="是否开通微信会员卡">
                <el-option key="true" label="是" value="true" />
                <el-option key="false" label="否" value="false" />
              </el-select>
              <el-button v-if="form.openWxCard == 'true'" style="margin-left: 15px;" type="text" icon="el-icon-edit" @click="setMemberCard">设置会员卡</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>
    <!-- 积分充值对话框 -->
    <memberCard :showDialog="openMemberCard" @closeDialog="closeDialog" @close="closeDialog" />
  </div>
</template>

<script setup>
import { getMemberSetting, saveSetting } from "@/api/member";
import memberCard from "./memberCard";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import modal from '@/plugins/modal'

defineOptions({ name: 'MemberSetting' })

const router = useRouter()
const route = useRoute()
const store = useStore()
const state = reactive({
// 设置会员卡对话框
      openMemberCard: false,
      // 遮罩层
      loading: false,
      // 表单参数
      form: { getCouponNeedPhone: "false", submitOrderNeedPhone: "false", loginNeedPhone: "false", openWxCard: "false" },
      // 表单校验
      rules: {
        getCouponNeedPhone: [
          { required: true, message: "请选择", trigger: "blur" },
        ],
        submitOrderNeedPhone: [
          { required: true, message: "请选择", trigger: "blur" },
        ],
        loginNeedPhone: [
          { required: true, message: "请选择", trigger: "blur" },
        ],
        openWxCard: [
          { required: true, message: "请选择", trigger: "blur" },
        ],
      }
})
const { openMemberCard, loading, form, rules } = toRefs(state)

function getSettingInfo() {

      loading.value = true;
      getMemberSetting().then(response => {
          form.value = response.data;
          loading.value = false;
        }
      );
    
}

function cancel() {

      store.dispatch('tagsView/delView', route)
      router.push('/')
    
}

function submitForm() {

      formRef.value.validate(valid => {
        if (valid) {
            const param = { getCouponNeedPhone: form.value.getCouponNeedPhone,
                            submitOrderNeedPhone: form.value.submitOrderNeedPhone,
                            loginNeedPhone: form.value.loginNeedPhone,
                            openWxCard: form.value.openWxCard };
            saveSetting(param).then(response => {
              modal.msgSuccess("保存成功");
              getSettingInfo();
            });
        }
      });
    
}

function setMemberCard() {

      openMemberCard.value = true;
    
}

function closeDialog() {

      openMemberCard.value = false;
    
}
</script>
