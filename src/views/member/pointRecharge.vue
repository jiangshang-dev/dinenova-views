<template>
  <!-- 积分变更对话框 -->
  <el-dialog title="积分变更" :model-value="showDialog" class="common-dialog" width="700px" @close="cancel" destroy-on-close>
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="会员信息：">
            <span>{{ memberInfo.name }}（ID:{{ memberInfo.id }}）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="可用积分：" prop="balance">
            <span>{{ memberInfo.point }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="变更类型：" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio key="1" label="1" value="1">增加</el-radio>
              <el-radio key="2" label="2" value="2">扣减</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="变更数量：" prop="amount">
            <el-input v-model="form.amount" placeholder="请输入变更数量" style="width: 200px" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item class="recharge-item" prop="remark" label="备注信息：">
            <el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注信息" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer><div class="dialog-footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div></template>
  </el-dialog>
</template>

<script setup>
import { doRecharge } from "@/api/point";
import { getMemberInfo as getMemberInfoApi } from "@/api/member";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'pointRecharge' })

const props = defineProps({
showDialog:{
      type:[Boolean],
      default:()=>false
    },
    userId:{
      type:[String],
      default:()=> ''
    }
})

const emit = defineEmits([])

const state = reactive({
// 遮罩层
      loading: false,
      memberInfo: { name: '', id: '', point: 0 },
      // 表单参数
      form: { type: '1', amount: '', userId: '' },
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "请选择会员", trigger: "blur" },
        ],
        amount: [
          { required: true, message: "金额不能为空", trigger: "blur" },
          { pattern: /^[0-9]{1,10}$/, message: `请输入1-10位数字`, trigger: 'blur' }
        ]
      }
})
const { loading, memberInfo, form, rules } = toRefs(state)

function getMemberInfo() {

      loading.value = true;
      getMemberInfoApi(props.userId).then(response => {
          form.value.userId = response.data.memberInfo.id;
          memberInfo.value = response.data.memberInfo;
          loading.value = false;
        }
      );
    
}

function cancel() {

      emit('closeDialog','point');
    
}

function reset() {

      form.value.userId = '';
      form.value.type = '1';
      form.value.amount = '';
      form.value.remark = '';
      memberInfo.value = { name: '', id: '', point: 0 };
    
}

function submitForm() {

      formRef.value.validate(valid => {
        if (valid) {
            doRecharge(form.value).then(response => {
               modal.alert("积分操作成功！");
               emit('closeDialog','point');
               reset();
            });
        }
      });
    
}

watch(() => props.showDialog, (value) => {
      if (value) {
          getMemberInfo()
      }
    })

watch(() => props.if, (value) => {
          getMemberInfo()
      })
</script>
