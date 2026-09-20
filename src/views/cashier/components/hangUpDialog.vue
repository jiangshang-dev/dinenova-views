<template>
    <el-dialog class="common-dialog" title="挂单列表" :model-value="showDialog" @close="close" width="1000px" destroy-on-close>
        <el-alert title="提示：请选择一个空白位置挂单" type="warning" :closable="false"></el-alert>
        <div class="order-list">
          <div class="order-item" v-for="orderInfo in orderList">
            <div class="info" v-if="!orderInfo.isEmpty">
              <div class="sn">{{ orderInfo.hangNo }} <span @click="remove(orderInfo.hangNo)" class="remove el-icon-delete"></span></div>
              <div class="order" v-if="!orderInfo.isEmpty" @click="getHangUp(orderInfo.hangNo, orderInfo.memberInfo)">
                <div class="item">会员：{{ orderInfo.memberInfo ? orderInfo.memberInfo.name : '游客' }}</div>
                <div class="item">件数：{{ orderInfo.num }}</div>
                <div class="item">金额：￥{{ orderInfo.amount }}</div>
                <div class="item time">{{ orderInfo.dateTime }}</div>
              </div>
            </div>
            <div v-if="orderInfo.isEmpty" class="none" @click="doHangUp(orderInfo.hangNo)">
              <div class="sn">{{ orderInfo.hangNo }} <span @click="remove(orderInfo.hangNo)" class="remove el-icon-delete"></span></div>
              <div class="tips">空白位置</div>
            </div>
          </div>
        </div>
        <div class="clearfix"></div>
        <template #footer><div class="dialog-footer">
            <el-button type="primary" @click="close()">关闭</el-button>
        </div></template>
    </el-dialog>
</template>
<script setup>
import { doHangUp as doHangUpApi, getHangUpList as fetchHangUpList, removeHangUp } from "@/api/cashier";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import modal from '@/plugins/modal'

defineOptions({ name: 'hangUpDialog' })

const props = defineProps({
showDialog: {
        type:[Boolean],
        default:()=>false
      },
      memberInfo: {
         type:[Object],
         default:()=>{}
      },
      cartList: {
        type:[Array],
        default:()=>[]
      },
})

const emit = defineEmits([])

const state = reactive({
loading: false,
          orderList: []
})
const { loading, orderList } = toRefs(state)

function remove(hangNo) {

          ;
          const param = { hangNo: hangNo };
          removeHangUp(param).then( response => {
            if (response) {
                modal.msgSuccess("删除挂单成功！");
                getHangUpList();
            }
          })
        
}

function doHangUp(hangNo) {

           ;
           if (!props.cartList || props.cartList.length < 1) {
               modal.alert("请先添加结算商品！");
               return false;
           }
           let cartIds = [];
           props.cartList.forEach(function(cart) {
              cartIds.push(cart.cartId);
           })
           const param = { hangNo: hangNo, userId: props.memberInfo ? props.memberInfo : '', cartIds: cartIds.join(',') };
           doHangUpApi(param).then( response => {
               if (response) {
                   modal.msgSuccess("挂单成功！");
                   getHangUpList();
                   emit('doHangUp');
               }
           })
        
}

function getHangUpList() {

          ;
          fetchHangUpList().then( response => {
            if (response.data) {
                orderList.value = response.data;
            }
          })
        
}

function getHangUp(hangNo, memberInfo) {

           emit('getHangNo', { 'hangNo': hangNo, 'memberInfo': memberInfo });
        
}

function close() {

           emit('closeDialog','hangUpDialog');
        
}

watch(() => props.showDialog, (value) => {
        if (value) {
            console.log('memberInfo = ', props.memberInfo)
            getHangUpList();
        }
      })

</script>
<style lang="scss" scoped>
  .order-list {
     margin-top: 6px;
     .order-item {
         width: 20%;
         float: left;
         height: 200px;
         cursor: pointer;
         padding: 5px;
         .info {
           border: solid 1px #cccccc;
           padding: 5px;
           height: 100%;
           border-radius: 4px;
           background: #e6f7f7;
           border: #113a28 solid 1px;
           .sn {
             font-weight: bold;
             font-size: 20px;
             color: #ff5b57;
             .remove {
               float: right;
               font-size: 12px;
               color: #666666;
               font-weight: bold;
             }
           }
           .order {
              margin: 10px;
              .item {
                 margin-bottom: 3px;
              }
              .time {
                 position: relative;
                 bottom : -50px;
                 color: #909399;
              }
           }
         }
         .none {
            height: 100%;
            color: #666666;
            border: solid 1px #cccccc;
            border-radius: 4px;
            padding: 10px;
            .tips {
               line-height: 150px;
               text-align: center;
            }
           .sn {
             font-weight: bold;
             font-size: 20px;
             color: #ff5b57;
             .remove {
               float: right;
               font-size: 12px;
               color: #666666;
               font-weight: bold;
             }
           }
         }
     }
  }
</style>
