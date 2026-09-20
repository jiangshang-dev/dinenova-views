<template>
  <el-dialog class="common-dialog" title="佣金明细" :model-value="showDialog" width="1200px" @close="cancel" destroy-on-close>
    <el-table ref="tables" v-loading="loading" :data="list" size="default" style="width: 100%">
      <el-table-column prop="orderId" label="订单号" width="190">
        <template #default="scope">
          <span @click="handleView(scope.row.orderInfo.id)" style="color: #00afff;cursor: pointer;">{{ scope.row.orderInfo.orderSn }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="target" label="分佣对象" align="center" width="100">
        <template #default="scope">
          <span>{{ getName(targetList, scope.row.target) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="员工姓名" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.staffInfo ? scope.row.staffInfo.realName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="staff" label="会员名称" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.userInfo ? scope.row.userInfo.userName : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="typeName" label="订单类型"></el-table-column>
      <el-table-column prop="storeName" :show-overflow-tooltip="true" label="开单门店">
        <template #default="scope">
          <span>{{ scope.row.storeInfo.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="开单时间" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderInfo.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="分佣金额">
        <template #default="scope">
          <span>{{ scope.row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="comType" :show-overflow-tooltip="true" label="规则方案">
        <template #default="scope">
          <span>{{ scope.row.ruleInfo.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <span>{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="page"
      v-model:limit="pageSize"
      @pagination="loadCommissionLogList" />
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { parseTime, getName } from '@/utils/fuint'
import { getCommissionLogList as fetchCommissionLogList } from '@/api/commission/log'

defineOptions({ name: 'CommissionCashDetail' })

const router = useRouter()

const loading = ref(false)
const showDialog = ref(false)
const uuid = ref('')
const list = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const statusList = ref([])
const targetList = ref([])
const tables = ref(null)

function init(id) {
  uuid.value = id
  showDialog.value = true
  loadCommissionLogList()
}

function loadCommissionLogList() {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    uuid: uuid.value
  }
  loading.value = true
  fetchCommissionLogList(params).then((response) => {
    list.value = response.data.dataList.content
    total.value = response.data.dataList.totalElements
    statusList.value = response.data.statusList
    targetList.value = response.data.targetList
    loading.value = false
  })
}

function cancel() {
  showDialog.value = false
}

function handleView(orderId) {
  router.push('/order/detail?orderId=' + orderId)
}

defineExpose({ init })
</script>
