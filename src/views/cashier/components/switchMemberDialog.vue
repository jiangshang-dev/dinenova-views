<template>
    <el-dialog class="common-dialog" title="关联会员" :model-value="showDialog" @close="close" width="750px" destroy-on-close>
        <el-form ref="form" v-if="!memberInfo.id" class="form" :model="form" label-width="100px">
            <el-form-item label="会员关键字" class="form-item" prop="keyword">
              <el-input class="input-item" v-model="form.keyword" v-focus placeholder="请输入会员手机号码、会员名称或扫码会员二维码" clearable maxlength="200" />
            </el-form-item>
        </el-form>
        <div class="member-info" v-if="memberInfo.id">
            <div class="item">
              <img class="avatar" v-if="memberInfo.avatar" :src="memberInfo.avatar" />
              <img class="avatar" v-if="!memberInfo.avatar" src="@/assets/images/avatar.png" />
              <div class="value">会员名称：{{ memberInfo.name }}</div>
              <div class="value">会员性别：{{ memberInfo.sex == '1' ? '男' : '女' }}</div>
            </div>
            <div class="item">
              <div class="value">手机号码：{{ memberInfo.mobile ? memberInfo.mobile : '暂无' }}</div>
              <div class="value">会员号码：{{ memberInfo.userNo ? memberInfo.userNo : '暂无' }}</div>
            </div>
            <div class="item">
              <div class="value">可用余额：{{ memberInfo.balance ? memberInfo.balance.toFixed(2) : '0.00' }}（元）</div>
              <div class="value">可用积分：{{ memberInfo.point ? memberInfo.point : '0' }}</div>
            </div>
        </div>
        <template #footer><div class="dialog-footer">
            <el-button v-if="!memberInfo.id" @click="doSubmit()">切换游客</el-button>
            <el-button type="primary" v-if="!memberInfo.id" @click="doQuery()">查询会员</el-button>
            <el-button v-if="memberInfo.id" @click="cancel()">重新查询</el-button>
            <el-button type="danger" v-if="memberInfo.id" @click="doSubmit()">确认会员</el-button>
        </div></template>
    </el-dialog>
</template>
<script setup>
import { getMemberInfo } from "@/api/cashier";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'switchMemberDialog' })

const vFocus = {
  mounted(el) {
    el.querySelector('input')?.focus()
  }
}

const props = defineProps({
showDialog: {
        type:[Boolean],
        default:()=>false
      }
})

const emit = defineEmits([])

const state = reactive({
loading: false,
          form: { keyword: '' },
          memberInfo: {}
})
const { loading, form, memberInfo } = toRefs(state)

function doQuery() {

          ;
          const keyword = form.value.keyword.trim();
          if (keyword.length > 0) {
              getMemberInfo( { keyword: form.value.keyword.trim() }).then(response => {
                if (response.data.memberInfo) {
                    memberInfo.value = response.data.memberInfo;
                } else {
                    modal.alert("未查询到该会员信息，请确认！");
                    return false;
                }
              })
          } else {
             modal.alert("请先输入会员关键字！");
          }
        
}

function doSubmit() {

           ;
           if (memberInfo.value.id) {
               emit('doSwitchMember', memberInfo.value);
           } else {
               emit('doSwitchMember', null);
           }
        
}

function cancel() {

           memberInfo.value = {};
        
}

function close() {

           emit('doSwitchMember',0);
        
}

watch(() => props.showDialog, (value) => {
        if (value) {
            memberInfo.value = {};
            form.value.keyword = '';
        }
      })

</script>
<style scoped>
  .form {
     margin-top: 30px;
  }
  .input-item :deep(.el-input__inner) {
    border: #113a28 solid 2px;
    line-height: 50px;
    height: 50px;
  }
  .form-item :deep(.el-form-item__label) {
    line-height: 50px;
    height: 50px;
  }
  .member-info {
     border: solid 1px #cccccc;
     padding: 20px;
     border-radius: 4px;
     cursor: pointer;
  }
  .member-info .item {
      height: 20px;
  }
  .member-info .item .avatar {
     height: 60px;
     width: 60px;
     border-radius: 30px;
     border: solid 1px #cccccc;
     float: left;
  }
  .member-info .item .value {
     float: left;
     margin-left: 10px;
     width: 200px;
  }

</style>
