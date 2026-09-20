<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员ID" prop="name">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员ID"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入会员手机号"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单号" prop="orderSn">
        <el-input
          v-model="queryParams.orderSn"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="桌码" prop="code">
        <el-input
          v-model="queryParams.tableCode"
          placeholder="请输入桌码"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单类型" prop="type">
        <el-select
          v-model="queryParams.type"
          clearable
          placeholder="订单类型">
          <el-option v-for="orderType in typeList" :key="orderType.key" :label="orderType.name" :value="orderType.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属店铺" prop="storeIds">
        <el-select v-model="storeIds" multiple filterable clearable placeholder="请选择店铺" style="width: 100%;">
          <el-option
            v-for="item in storeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          clearable>
          <el-option v-for="statusItem in statusList" :key="statusItem.key+''" :label="statusItem.name" :value="statusItem.key+''" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="支付状态"
          clearable>
          <el-option v-for="statusItem in payStatusList" :key="statusItem.key+''" :label="statusItem.name" :value="statusItem.key+''" />
        </el-select>
      </el-form-item>
      <el-form-item label="配送方式">
        <el-select
          v-model="queryParams.orderMode"
          placeholder="配送方式"
          clearable>
          <el-option v-for="item in orderModeList" :key="item.key+''" :label="item.name" :value="item.key+''" />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:190px"
          placeholder="开始时间"></el-date-picker>
        <span class="sp"> ~ </span>
        <el-date-picker
          v-model="queryParams.endTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetime"
          style="width:190px"
          placeholder="结束时间"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="订单ID" prop="id" min-width="80" />
      <el-table-column label="订单号"  align="center" width="200" prop="orderSn">
        <template #default="scope">
          <span @click="handleView(scope.row)" style="color: #00afff;cursor: pointer;">{{ scope.row.orderSn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员名称" align="center" prop="orderInfo.name">
        <template #default="scope">
          <span v-if="scope.row.userInfo && scope.row.isVisitor == 'N'">
              <span>{{ scope.row.userInfo.name }}</span>
          </span>
          <span v-else>游客</span>
        </template>
      </el-table-column>
      <el-table-column label="订单类型" align="center" prop="typeName">
         <template #default="scope">
             <span>{{ scope.row.typeName }}</span>
         </template>
      </el-table-column>
      <el-table-column label="所属店铺" align="center" width="140" prop="storeInfo.name">
        <template #default="scope">
          <span v-if="scope.row.storeInfo">{{ scope.row.storeInfo.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属桌码" align="center" width="140" prop="tableInfo.code">
        <template #default="scope">
          <span v-if="scope.row.tableInfo">{{ scope.row.tableInfo.code }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="amount">
        <template #default="scope">
          <span v-if="true">{{ scope.row.amount.toFixed(2) }}</span>
          <span v-else>0.00</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" width="80" prop="payStatus">
        <template #default="scope">
          <span v-if="scope.row.payStatus == 'B'" class="status-active">{{ getName(payStatusList, scope.row.payStatus) }}</span>
          <span v-else class="status-disabled">{{ getName(payStatusList, scope.row.payStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" width="80" prop="status">
        <template #default="scope">
          <span class="status-normal">{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送方式" align="center" prop="orderMode">
        <template #default="scope">
          <span>{{ getName(orderModeList, scope.row.orderMode) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" width="130" prop="createTime">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付金额" align="center" prop="payAmount">
        <template #default="scope">
          <span v-if="true">{{ scope.row.payAmount.toFixed(2) }}</span>
          <span v-else>0.00</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠金额" align="center" prop="discount">
        <template #default="scope">
          <span v-if="true">{{ scope.row.discount.toFixed(2) }}</span>
          <span v-else>0.00</span>
        </template>
      </el-table-column>
      <el-table-column label="积分金额" align="center" prop="pointAmount">
        <template #default="scope">
          <span v-if="true">{{ scope.row.pointAmount.toFixed(2) }}</span>
          <span v-else>0.00</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="130" prop="updateTime">
        <template #default="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="130" fixed='right'>
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            v-hasPermi="['order:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            v-if="scope.row.orderMode == 'express'"
            size="small"
            type="text"
            v-hasPermi="['order:edit']"
            @click="handleExpress(scope.row)">发货</el-button>
          <el-button
            v-if="scope.row.orderMode == 'oneself'"
            type="text"
            size="small"
            :disabled="scope.row.isVerify == true"
            @click="handleVerify(scope.row)"
            v-hasPermi="['order:edit']">核销</el-button>
          <el-dropdown size="small" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['order:edit', 'order:delete']">
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
            <template #dropdown><el-dropdown-menu>
              <el-dropdown-item command="handleView" icon="el-icon-view" v-hasPermi="['order:index']">查看详情</el-dropdown-item>
              <el-dropdown-item command="handlePrint" icon="el-icon-notebook-2" v-hasPermi="['order:index']">打印小票</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.payStatus == 'B'" command="handleRefund" icon="el-icon-s-order" v-hasPermi="['order:index']">立即退款</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.payStatus != 'B'" command="handleDelete" icon="el-icon-remove" v-hasPermi="['order:delete']">删除订单</el-dropdown-item>
            </el-dropdown-menu></template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 修改对话框 start-->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderSn">
              <el-input v-model="form.orderSn" placeholder="订单号" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.orderMode && form.orderMode.length > 0">
          <el-col :span="24">
            <el-form-item label="订单模式" prop="orderMode">
              <el-select v-model="form.orderMode" placeholder="订单模式">
                <el-option v-for="item in orderModeList" :key="item.key+''" :label="item.name" :value="item.key+''" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单总金额" prop="amount">
              <el-input v-model="form.amount" placeholder="请输入订单总金额" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="优惠金额" prop="discount">
              <el-input v-model="form.discount" placeholder="请输入优惠金额" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入订单备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单状态">
                <el-select v-model="form.status" placeholder="订单状态">
                  <el-option v-for="statusItem in statusList" :key="statusItem.key+''" :label="statusItem.name" :value="statusItem.key+''" />
                </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 修改对话框 end-->

    <!-- 核销对话框 start-->
    <el-dialog title="核销订单" v-model="openVerify" class="common-dialog" width="700px" append-to-body>
      <el-form ref="vFormRef" :model="vForm" :rules="vFormRules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderSn">
              <el-input v-model="vForm.orderSn" placeholder="订单号" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="核销码" prop="verifyCode">
              <el-input v-model="vForm.verifyCode" placeholder="请输入订单核销码，从会员端的订单详情获取" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单备注" prop="remark">
              <el-input v-model="vForm.remark" type="textarea" placeholder="请输入订单备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitVForm">确定核销</el-button>
        <el-button @click="cancelVForm">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 核销对话框 end-->

    <!-- 发货对话框 start-->
    <el-dialog title="填写物流信息" v-model="openExpress" class="common-dialog" width="700px" append-to-body>
      <el-form ref="eFormRef" :model="eForm" :rules="eFormRules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderSn">
              <el-input v-model="eForm.orderSn" placeholder="订单号" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="物流公司" prop="expressCompany">
              <el-input v-model="eForm.expressCompany" placeholder="请输入物流公司" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="物流单号" prop="expressNo">
              <el-input v-model="eForm.expressNo" placeholder="请输入物流单号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitEForm">提交物流信息</el-button>
        <el-button @click="cancelEForm">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 核销对话框 end-->

    <!--打印订单对话框 start-->
    <orderPrintDialog :show-dialog="openOrderPrintDialog" :storeInfo="storeInfo" :orderInfo="orderInfo" @closeDialog="closePrintDialog" />
    <!--打印订单对话框 end-->

    <!-- 退款对话框 start -->
    <el-dialog title="订单退款" v-model="openRefundDialog" class="common-dialog" width="700px" append-to-body>
      <el-form ref="rFormRef" :model="rForm" :rules="rFormRules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderSn" style="width:450px;">
              <el-input v-model="rForm.orderSn" placeholder="订单号" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="支付方式" prop="payType" style="width:450px;">
              <el-input v-model="rForm.payType" placeholder="支付方式" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="实付金额" prop="payAmount" style="width:450px;">
              <el-input :model-value="'￥' + rForm.payAmount" placeholder="订单实付金额" disabled maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="退款金额" prop="refundAmount" style="width:450px;">
              <el-input v-model="rForm.refundAmount" placeholder="请输入退款金额"></el-input>
              <div class="form-tips">( 提示：单位元 )</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="退款备注" prop="remark">
              <el-input v-model="rForm.remark" type="textarea" placeholder="请输入退款备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitRForm">确定</el-button>
        <el-button @click="cancelRForm">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 退款对话框 end -->
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import modal from '@/plugins/modal'

import { getName } from "@/utils/fuint";
import { getOrderList, updateOrderStatus, getOrderInfo, saveOrder, deleteOrder, verifyOrder, delivered } from "@/api/order";
import { doRefund } from "@/api/refund";
import orderPrintDialog from '../cashier/components/orderPrintDialog'


defineOptions({ name: 'OrderIndex' })


const router = useRouter()
const route = useRoute()

const loading = ref(true)

const title = ref("")

const ids = reactive([])

const multiple = ref(true)

const dateRange = ref([])

const showSearch = ref(true)

const total = ref(0)

const list = reactive([])

const storeList = reactive([])

const storeIds = reactive([])

const typeList = reactive([])

const statusList = reactive([])

const payStatusList = reactive([])

const orderModeList = reactive([])

const payTypeList = reactive([])

const open = ref(false)

const openVerify = ref(false)

const openExpress = ref(false)

const defaultSort = reactive({prop: 'createTime', order: 'descending'})

const openOrderPrintDialog = ref(false)

const openRefundDialog = ref(false)

const storeInfo = reactive({})

const orderInfo = reactive({})

const form = reactive({ orderId: "", orderSn: 0, amount: "", orderMode: "oneself", discount: "", remark: "", status: "A" })

const vForm = reactive({ orderId: "", orderSn: "", remark: "", verifyCode: "" })

const eForm = reactive({ orderId: "", orderSn: "", expressCompany: "", expressNo: "" })

const rForm = reactive({ orderId: "", orderSn: "", payType: '', payAmount: "", refundAmount: "", remark: ""})

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        userId: '',
        mobile: '',
        status: '',
        payStatus: '',
        orderMode: '',
        orderSn: '',
        storeIds: '',
        tableCode: ''
      })

const rules = reactive({
        amount: [
          { required: true, message: "总金额不能为空", trigger: "blur" },
        ]
      })

const vFormRules = reactive({
        verifyCode: [
          { required: true, message: "核销码不能为空", trigger: "blur" },
        ]
      })

const eFormRules = reactive({
        expressCompany: [
          { required: true, message: "物流公司不能为空", trigger: "blur" },
        ],
        expressNo: [
          { required: true, message: "物流单号不能为空", trigger: "blur" },
        ]
      })

const rFormRules = reactive({
        refundAmount: [
          { required: true, message: "退款金额不能为空", trigger: "blur" },
          { pattern: /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/, message: `请输入正确的退款金额`, trigger: 'blur' }
        ]
      })

const queryForm = ref(null)

const formRef = ref(null)

const vFormRef = ref(null)

const eFormRef = ref(null)

const rFormRef = ref(null)

const tables = ref(null)

function getList() {
      
      loading.value = true;
      queryParams.storeIds = storeIds ? storeIds.join(",") : '';
      getOrderList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          typeList.length = 0; typeList.push(...(response.data.typeList || []));
          statusList.length = 0; statusList.push(...(response.data.statusList || []));
          payStatusList.length = 0; payStatusList.push(...(response.data.payStatusList || []));
          orderModeList.length = 0; orderModeList.push(...(response.data.orderModeList || []));
          payTypeList.length = 0; payTypeList.push(...(response.data.payTypeList || []));
          storeList.length = 0; storeList.push(...(response.data.storeList || []));
          loading.value = false;
        }
      );
    }

function handleQuery() {
      queryParams.page = 1;
      getList();
    }

function resetQuery() {
      dateRange.value = [];
      queryParams.status = '';
      queryParams.mobile = '';
      queryParams.orderMode = '';
      queryParams.orderSn = '';
      queryParams.storeIds = '';
      storeIds.length = 0;
      queryForm.value?.resetFields();
      tables.value.sort(defaultSort.prop, defaultSort.order)
      handleQuery();
    }

function handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      modal.confirm('确认要' + text + '"' + row.orderSn + '"吗？').then(function() {
        return updateOrderStatus(row.id, row.status);
      }).then(() => {
        modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "N" ? "A" : "N";
      });
    }

function handleSelectionChange(selection) {
      ids.length = 0; ids.push(...(selection.map(item => item.id) || []))
      multiple.value = !selection.length
    }

function handleSortChange(column, prop, order) {
      queryParams.orderByColumn = column.prop;
      queryParams.isAsc = column.order;
      getList();
    }

function reset() {
      Object.assign(form, {
        orderId: "",
        orderSn: "",
        status: "A",
        amount: "",
        discount: "",
        remark: "",
        orderMode: "oneself",
      });
      formRef.value?.resetFields();
    }

function cancel() {
      open.value = false;
      reset();
    }

function cancelVForm() {
      openVerify.value = false;
      vForm.orderId = '';
      vForm.orderSn = '';
      vForm.verifyCode = '';
    }

function submitVForm() {
      vFormRef.value.validate(valid => {
        if (valid) {
            verifyOrder(vForm).then(response => {
              modal.msgSuccess("核销成功！");
              cancelVForm();
              getList();
            });
        }
      });
    }

function submitForm() {
      formRef.value.validate(valid => {
        if (valid) {
            saveOrder(form).then(response => {
               modal.msgSuccess("修改成功！");
               open.value = false;
               getList();
            }).catch(function() {
               modal.msgError("修改出错啦");
            });
        }
      });
    }

function handleView(row) {
      router.push('/order/detail?orderId=' + row.id)
    }

function handleUpdate(row) {
      
      reset();
      const id = row.id || ids;
      getOrderInfo(id).then(response => {
        let orderInfo = response.data.orderInfo;
        if (orderInfo) {
            form.orderId = orderInfo.id;
            form.orderSn = orderInfo.orderSn;
            form.amount = orderInfo.amount;
            form.discount = orderInfo.discount;
            form.remark = orderInfo.remark;
            form.status = orderInfo.status;
            form.orderMode = orderInfo.orderMode+"";
        }
        open.value = true;
        title.value = "修改订单";
      });
    }

function handleVerify(row) {
      
      const id = row.id || ids;
      getOrderInfo(id).then(response => {
        let orderInfo = response.data.orderInfo;
        if (orderInfo) {
            vForm.orderId = orderInfo.id;
            vForm.orderSn = orderInfo.orderSn;
            vForm.remark = orderInfo.remark;
        }
        openVerify.value = true;
      });
    }

function handleExpress(row) {
      
      const id = row.id || ids;
      getOrderInfo(id).then(response => {
        let orderInfo = response.data.orderInfo;
        if (orderInfo) {
            eForm.orderId = orderInfo.id;
            eForm.orderSn = orderInfo.orderSn;
            eForm.expressNo = orderInfo.expressInfo ? orderInfo.expressInfo.expressNo : "";
            eForm.expressCompany = orderInfo.expressInfo? orderInfo.expressInfo.expressCompany : "";
        }
        openExpress.value = true;
      });
    }

function cancelEForm() {
      openExpress.value = false;
      eForm.orderId = '';
      eForm.orderSn = '';
      eForm.expressCompany = '';
      eForm.expressNo = '';
    }

function submitEForm() {
      
      if (loading.value) {
          modal.msgError("请求处理中...");
      }
      app.$refs["eForm"].validate(valid => {
        if (valid) {
          loading.value = true;
          delivered(eForm).then(response => {
              modal.msgSuccess("提交物流信息成功！");
              cancelEForm();
              getList();
              loading.value = false;
          });
        }
      });
    }

function cancelRForm() {
      openRefundDialog.value = false;
      rForm.orderId = '';
      rForm.orderSn = '';
      rForm.payAmount = '';
      rForm.payType = '';
      rForm.refundAmount = '';
      rForm.remark = '';
    }

function submitRForm() {
      
      if (loading.value) {
          modal.msgError("请求处理中...");
      }
      if (parseFloat(rForm.refundAmount) > parseFloat(rForm.amount)) {
          modal.msgError("退款金额不能大于订单总金额！");
          return false;
      }
      app.$refs["rForm"].validate(valid => {
        if (valid) {
            loading.value = true;
            doRefund(rForm).then(response => {
                modal.msgSuccess("提交退款成功！");
                cancelRForm();
                getList();
                loading.value = false;
            });
        }
      });
    }

function handleDelete(row) {
      const name = row.orderSn
      modal.confirm('是否确认删除订单号为"' + name + '"的数据项？').then(function() {
        return deleteOrder(row.id);
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

function handlePrint(row) {
      
      Object.assign(orderInfo, {});
      Object.assign(storeInfo, {});
      const id = row.id || ids;
      getOrderInfo(id).then(response => {
        let orderInfo = response.data.orderInfo;
        if (orderInfo) {
            Object.assign(orderInfo, orderInfo);
            Object.assign(storeInfo, orderInfo.storeInfo);
        }
        openOrderPrintDialog.value = true;
      });
    }

function handleRefund(row) {
      
      rForm.orderId = row.id;
      rForm.orderSn = row.orderSn;
      rForm.payAmount = row.payAmount;
      rForm.payType = getName(payTypeList, row.payType);
      openRefundDialog.value = true;
    }

function closePrintDialog() {
      openOrderPrintDialog.value = false;
    }

function handleCommand(command, row) {
      switch (command) {
        case "handleDelete":
          handleDelete(row);
          break;
        case "handlePrint":
          handlePrint(row);
          break;
        case "handleRefund":
          handleRefund(row);
          break;
        default:
          handleView(row);
          break;
      }
    }

getList();
</script>

