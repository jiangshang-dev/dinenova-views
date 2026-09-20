<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="卡券ID" prop="couponId">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入卡券ID"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分组ID" prop="groupId">
        <el-input
          v-model="queryParams.groupId"
          placeholder="请输入卡券分组ID"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入卡券名称"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          clearable
          placeholder="卡券类型">
          <el-option v-for="typeInfo in typeList" :key="typeInfo.key" :label="typeInfo.name" :value="typeInfo.key" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
          <el-option v-for="statusInfo in statusList" :key="statusInfo.key" :label="statusInfo.name" :value="statusInfo.key" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['coupon:coupon:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="卡券ID" prop="id" width="66" />
      <el-table-column label="图标" align="center" width="150">
        <template #default="scope">
          <img class="list-img" :src="imagePath + scope.row.image">
        </template>
      </el-table-column>
      <el-table-column label="卡券名称" align="center" prop="name">
        <template #default="scope">
          <span v-if="scope.row.name">{{ scope.row.name }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="分组" align="center" prop="groupName">
        <template #default="scope">
          <span v-if="scope.row.groupId">
              <span>{{ getName(groupList, scope.row.groupId) }}</span>
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <span v-if="scope.row.type">
            <span>{{ getName(typeList, scope.row.type) }}</span>
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="有效期" align="center" width="180" prop="updateTime">
        <template #default="scope">
          <p v-if="scope.row.expireType == 'fix'">{{ parseTime(scope.row.beginTime) }}</p>
          <p v-if="scope.row.expireType == 'fix'">{{ parseTime(scope.row.endTime) }}</p>
          <p v-if="scope.row.expireType == 'flex'">领取后{{ scope.row.expireTime }}天</p>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="160" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <span>{{ getName(statusList, scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-plus"
            v-hasPermi="['coupon:coupon:edit']"
            @click="handleSend(scope.row)">发券</el-button>
          <el-button
            size="small"
            type="text"
            v-hasPermi="['coupon:coupon:edit']"
            icon="el-icon-copy-document"
            @click="handleQrCode(scope.row)">二维码</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['coupon:coupon:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['coupon:coupon:edit']"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改卡券对话框 start-->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券类型" prop="type">
              <el-select
                v-if="form.id"
                v-model="form.type"
                style="width: 260px"
                placeholder="卡券类型"
                disabled>
                <el-option v-for="typeInfo in typeList" :key="typeInfo.key" :label="typeInfo.name" :value="typeInfo.key" />
              </el-select>
              <el-select
                v-if="!form.id"
                v-model="form.type"
                style="width: 260px"
                placeholder="卡券类型">
                <el-option v-for="typeInfo in typeList" :key="typeInfo.key" :label="typeInfo.name" :value="typeInfo.key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券分组" prop="groupId">
              <el-select
                v-model="form.groupId"
                style="width: 260px"
                placeholder="请选择卡券分组"
                clearable
                filterable>
                <el-option v-for="group in groupOptions" :key="group.id" :label="group.name" :value="group.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券名称" prop="name">
              <el-input v-model="form.name" style="width: 300px" placeholder="请输入卡券名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="过期类型" prop="expireType">
              <el-radio-group v-model="form.expireType">
                <el-radio key="fix" label="fix" value="fix">固定时间</el-radio>
                <el-radio key="flex" label="flex" value="flex">领取后生效</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.expireType == 'fix'">
          <el-col :span="24">
            <el-form-item label="有效时间" prop="beginTime">
              <el-date-picker
                v-model="form.beginTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="开始时间"></el-date-picker>
              <span class="sp"> 至 </span>
              <el-date-picker
                v-model="form.endTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="结束时间"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.expireType == 'flex'">
          <el-col :span="24">
            <el-form-item label="有效天数" prop="expireTime">
              <el-input v-model="form.expireTime" style="width: 150px" placeholder="请输入有效天数" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 优惠券特有属性 start -->
        <div v-if="form.type == 'C'">
          <el-row>
            <el-col :span="24">
              <el-form-item label="卡券面额" prop="amount">
                <el-input v-model="form.amount" style="width: 240px" placeholder="请输入卡券面额，单位：元" maxlength="10" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="发放方式" prop="sendWay">
                <el-radio-group v-model="form.sendWay">
                  <el-radio key="backend" label="backend" value="backend">后台发放</el-radio>
                  <el-radio key="front" label="front" value="front">前台领取</el-radio>
                  <el-radio key="offline" label="offline" value="offline">线下发放</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="发行总数量" prop="total">
                <el-input v-model="form.total" style="width: 300px" placeholder="请输入发行总数量，单位：套"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="满多少可用" prop="outRule">
                <el-input v-model="form.outRule" style="width: 300px" placeholder="单位：元，输入0表示无门槛"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="允许转赠好友" prop="isGive">
                <el-radio-group v-model="form.isGive">
                  <el-radio key="0" label="0" value="0">不允许</el-radio>
                  <el-radio key="1" label="1" value="1">允许</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="适用商品" prop="applyGoods">
                <el-radio-group v-model="form.applyGoods">
                  <el-radio key="allGoods" label="allGoods" value="allGoods">全场通用</el-radio>
                  <el-radio key="parkGoods" label="parkGoods" value="parkGoods">指定商品</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" v-if="form.applyGoods == 'parkGoods'">
              <el-form-item label="适用商品ID" prop="goodsIds">
                <el-input v-model="goodsIds" rows="2" type="textarea" placeholder="英文逗号分隔，如：19932,938423,324234"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="每人最多拥有数量" prop="limitNum">
                <el-input v-model="form.limitNum" style="width: 300px" placeholder="请输入每人最多拥有数量，单位：张"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="领取所需积分" prop="point">
                <el-input v-model="form.point" style="width: 300px" placeholder="输入0或为空表示不需要积分领取"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="领取码" prop="receiveCode">
                <el-input v-model="form.receiveCode" style="width: 300px" placeholder="为空表示不需要领取码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="会员等级" prop="gradeIds">
                <el-select
                  v-model="form.gradeIds"
                  style="width: 260px"
                  placeholder="适用会员等级"
                  clearable
                  filterable
                  multiple>
                  <el-option v-for="grade in gradeOptions" :key="grade.id+''" :label="grade.name" :value="grade.id+''" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="使用专项" prop="useFor">
                <el-radio-group v-model="form.useFor">
                  <el-select
                    v-model="form.useFor"
                    style="width: 260px"
                    placeholder="请选择使用专项，不选则为通用"
                    clearable>
                    <el-option v-for="useForItem in couponUseForList" :key="useForItem.key+''" :label="useForItem.name" :value="useForItem.key+''" />
                  </el-select>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 优惠券特有属性 end -->
        <!-- 储值卡特有属性 start -->
        <div v-if="form.type == 'P'">
          <el-row>
            <el-col :span="24">
              <el-form-item label="预存规则" prop="storeItem">
                <div class="add-item"><el-button type="danger" size="small" icon="el-icon-plus" @click="addStoreItem()">添加</el-button></div>
                <div class="store-item" v-for="(item, index) in storeItem">
                    <el-input v-model="item.storeAmount" style="width: 180px" placeholder="请输入实际支付金额" maxlength="100" />
                    <span class="sp"> 到账 </span>
                    <el-input v-model="item.giveAmount" style="width: 180px" placeholder="请输入实际到账金额" maxlength="100" />
                    <span class="remove-item el-icon-remove" @click="removeStoreItem(index)"></span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 储值卡特有属性 end -->
        <!-- 计次卡特有属性 start -->
        <div v-if="form.type == 'T'">
          <el-row>
            <el-col :span="24">
              <el-form-item label="计次次数" prop="outRule">
                <el-input v-model="form.outRule" style="width: 260px" placeholder="请输入计次次数" maxlength="10" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="发放方式" prop="sendWay">
                <el-radio-group v-model="form.sendWay">
                  <el-radio key="backend" label="backend" value="backend">后台发放</el-radio>
                  <el-radio key="front" label="front" value="front">前台领取</el-radio>
                  <el-radio key="offline" label="offline" value="offline">线下发放</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="领取所需积分" prop="point">
                <el-input v-model="form.point" style="width: 300px" placeholder="输入0或为空表示不需要积分领取"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="领取码" prop="receiveCode">
                <el-input v-model="form.receiveCode" style="width: 300px" placeholder="为空表示不需要领取码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 计次卡特有属性 end -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="适用店铺" prop="storeIds">
              <el-select
                v-model="form.storeIds"
                style="width: 260px"
                placeholder="适用店铺"
                multiple>
                <el-option v-for="storeInfo in storeList" :key="storeInfo.id+''" :label="storeInfo.name" :value="storeInfo.id+''" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="图标" prop="image">
              <el-upload
                 :action="uploadAction"
                 list-type="picture-card"
                 :file-list="uploadFiles"
                 :auto-upload="true"
                 :on-success="handleUploadSuccess"
                 :headers="uploadHeader"
                 :show-file-list="false">
                <img
                  v-if="form.image"
                  :src="imagePath + form.image"
                  class="list-img" />
                 <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <p class="form-tips">（提示：点击图片修改，建议尺寸：300 x 240）</p>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述信息">
              <el-input v-model="form.description" rows="5" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="后台备注">
              <el-input v-model="form.remarks" rows="2" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
    <!-- 添加或修改卡券对话框 end-->

    <!--发券对话框 start-->
    <el-dialog title="发放卡券" v-model="openSendCouponDialog" class="common-dialog" width="800px" append-to-body>
      <el-form ref="sendFormRef" :model="sendForm" :rules="sendFormRules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="卡券名称：" prop="couponName">
              <el-input style="width: 420px;" v-model="sendForm.couponName" disabled maxlength="100"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="发放对象">
              <el-radio-group v-model="sendForm.object" @change="objectChange()">
                <el-radio key="part" label="part" value="part">部分会员</el-radio>
                <el-radio key="all" label="all" value="all">全部会员</el-radio>
                <el-button type="danger" size="small" v-if="sendForm.object == 'all'">总会员数：{{ totalMember }}</el-button>
                <el-button type="primary" size="small" v-if="sendForm.object == 'part'" @click="selectUser()">选择会员（已选{{ sendForm.memberIds.length }}人）</el-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="发放数量：" prop="num">
              <el-input style="width: 420px;" v-model="sendForm.num"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息：" prop="remark">
              <el-input v-model="sendForm.remark" type="textarea" rows="2" placeholder="请输入备注信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" v-loading="sendLoading" @click="doSendCoupon">确定发放</el-button>
        <el-button @click="cancelSend">取消</el-button>
      </div></template>
    </el-dialog>
    <!--发券对话框 end-->

    <!--会员选择对话框start-->
    <UserSelect :showDialog="openUserSelect" @doSelectUser="doSelectUser" @closeDialog="closeDialog"></UserSelect>
    <!--会员选择对话框end-->

    <!--二维码对话框start-->
    <FuintQrCode :showDialog="openQrCode" :qr="qr" @closeDialog="closeQrDialog" />
    <!--二维码对话框end-->
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import modal from '@/plugins/modal'

import { getName } from '@/utils/fuint'

import FuintQrCode from '@/components/Fuint/QrCode';
import { getToken } from '@/utils/auth';
import { getCouponList, updateCouponStatus, getCouponInfo, saveCoupon, deleteCoupon, sendCoupon } from "@/api/coupon/coupon";
import { getAllGroupList } from "@/api/coupon/group";
import { getTotalMember as getTotalMemberApi } from "@/api/statistic";
import { parseTime } from "@/utils/fuint";

const initForm = { id: '', type: 'C', groupId: '', gradeIds: '', name: '', expireType: 'fix', expireTime: '', beginTime: '', endTime: '', applyGoods: 'allGoods', isGive: '0', amount: '', goodsIds: '',
                   outRule: '', inRule: '', inRuleForPreStore: '', sendNum: '1', total: '', limitNum: '', sendWay: 'backend', point: '', receiveCode: '',
                   useFor: '', storeIds: '', image: '/static/defaultImage/coupon.png', description: '', remarks: '', outRuleForTimer: '', status: "A" };


defineOptions({ name: 'CouponIndex' })


const qr = ref(null)

const openQrCode = ref(false)

const loading = ref(true)

const sendLoading = ref(false)

const title = ref("")

const ids = reactive([])

const multiple = ref(true)

const showSearch = ref(true)

const imagePath = ref("")

const total = ref(0)

const list = reactive([])

const typeList = reactive([])

const groupList = reactive([])

const groupOptions = reactive([])

const gradeOptions = reactive([])

const storeList = reactive([])

const statusList = reactive([])

const couponUseForList = reactive([])

const open = ref(false)

const openSendCouponDialog = ref(false)

const defaultSort = reactive({prop: 'createTime', order: 'descending'})

const form = ref(initForm)

const goodsIds = ref('')

const storeItem = reactive([ { storeAmount: '', giveAmount: '' }])

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const hideUpload = ref(false)

const uploadHeader = reactive({ 'Access-Token' : getToken() })

const openUserSelect = ref(false)

const uploadFiles = reactive([])

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        id: '',
        groupId: '',
        name: '',
        type: '',
        status: ''
      })

const rules = reactive({
        type: [
          { required: true, message: "请选择卡券类型", trigger: "blur" },
        ],
        name: [
          { required: true, message: "卡券名称不能为空", trigger: "blur" },
        ],
        groupId: [
          { required: true, message: "请选择卡券分组", trigger: "blur" },
        ],
        expireType: [
          { required: true, message: "过期类型不能为空", trigger: "blur" },
        ],
        expireTime: [
          { required: true, message: "有效天数不能为空", trigger: "blur" },
          { pattern: /^[0-9]{1,10}$/, message: `请输入1-10位数字`, trigger: 'blur' }
        ],
        beginTime: [
          { required: true, message: "请选择开始时间", trigger: "blur" },
        ],
        endTime: [
          { required: true, message: "请选择结束时间", trigger: "blur" },
        ],
        amount: [
          { required: true, message: "请输入面额", trigger: "blur" },
        ],
        total: [
          { required: true, message: "请输入发行总数", trigger: "blur" },
          { pattern: /^[0-9]{1,10}$/, message: `请输入1-10位数字`, trigger: 'blur' }
        ],
        sendWay: [
          { required: true, message: "请选择发放方式", trigger: "blur" },
        ],
        outRule: [
          { required: true, message: "请输入该项", trigger: "blur" },
        ],
        storeItem: [
          { required: true, validator: storeItemValid, trigger: 'change' },
        ]
      })

const totalMember = ref(0)

const sendForm = reactive({ couponId: '', couponName: '', num: '', memberIds: [], object: 'part', remark: '' })

const sendFormRules = reactive({
        num: [
            { required: true, message: "请输入发放数量", trigger: "blur" },
            { pattern: /^[0-9]{1,10}$/, message: `请输入1-10位数字`, trigger: 'blur' }
        ]
      })

const queryForm = ref(null)

const formRef = ref(null)

const sendFormRef = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getCouponList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          groupList.length = 0; groupList.push(...(response.data.groupList || []));
          storeList.length = 0; storeList.push(...(response.data.storeList || []));
          imagePath.value = response.data.imagePath;
          typeList.length = 0; typeList.push(...(response.data.typeList || []));
          statusList.length = 0; statusList.push(...(response.data.statusList || []));
          gradeOptions.length = 0; gradeOptions.push(...(response.data.gradeList || []));
          couponUseForList.length = 0; couponUseForList.push(...(response.data.couponUseForList || []));
          loading.value = false;
        }
      );
    }

function getTotalMember() {
      getTotalMemberApi().then(response => {
          totalMember.value = response.data.totalMember;
        }
      );
    }

function getGroupList() {
      loading.value = true;
      getAllGroupList().then( response => {
          groupOptions.length = 0; groupOptions.push(...(response.data.groupList || []));
          loading.value = false;
        }
      );
    }

function handleQuery() {
      queryParams.page = 1;
      getList();
    }

function resetQuery() {
      queryForm.value?.resetFields();
      tables.value.sort(defaultSort.prop, defaultSort.order)
      handleQuery();
    }

function handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      modal.confirm('确认要' + text + 'ID等于' + row.id + '的数据项吗？').then(function() {
        return updateCouponStatus(row.id, row.status);
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

function handleAdd() {
      reset();
      open.value = true;
      title.value = "新增卡券";
    }

function reset() {
      formRef.value?.resetFields();
      form.value = initForm;
      goodsIds.value = '';
    }

function cancel() {
      open.value = false;
      reset();
    }

function submitForm() {
      
      app.$refs["form"].validate(valid => {
        if (valid) {
          form.value.storeIds = form.value.storeIds ? form.value.storeIds.join(",") : '';
          form.value.gradeIds = form.value.gradeIds ? form.value.gradeIds.join(",") : '';
          form.value.goodsIds = goodsIds.value;
          // 预存规则
          if (form.value.type == 'P') {
              form.value.inRule = '';
              storeItem.forEach(function(rule){
                 if (form.value.inRule) {
                     form.value.inRule = form.value.inRule + ',' + rule.storeAmount + '_' + rule.giveAmount;
                 } else {
                     form.value.inRule = rule.storeAmount + '_' + rule.giveAmount;
                 }
              })
          }
          if (parseInt(form.value.id) > 0) {
              saveCoupon(form.value).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveCoupon(form.value).then(response => {
                modal.msgSuccess("新增成功");
                open.value = false;
                getList();
              });
          }
        } else {
            modal.msgError("请先完善表单数据项");
        }
      });
    }

function handleUpdate(row) {
      
      reset();
      const id = row.id || ids;
      getCouponInfo(id).then(response => {
        form.value = response.data.couponInfo;
        form.value.isGive = form.value.isGive == true ? '1' : '0';
        form.value.beginTime = parseTime(form.value.beginTime);
        form.value.endTime = parseTime(form.value.endTime);
        goodsIds.value = response.data.goodsIds;
        if (form.value.storeIds && form.value.storeIds.length > 0) {
            form.value.storeIds = form.value.storeIds.split(",");
        }
        if (form.value.gradeIds && form.value.gradeIds.length > 0) {
            form.value.gradeIds = form.value.gradeIds.split(",");
        }
        if (form.value.type == 'P' && form.value.inRule) {
           const storeRules = form.value.inRule.split(",");
           storeItem.length = 0;
           if (storeRules.length > 0) {
               storeRules.forEach(function(rule){
                   const ruleItem = rule.split("_");
                   if (ruleItem.length == 2) {
                       storeItem.push( { storeAmount: ruleItem[0], giveAmount: ruleItem[1] } );
                   }
               })
           }
        }
        open.value = true;
        title.value = "编辑卡券";
      });
    }

function handleDelete(row) {
      modal.confirm('是否确认删除ID等于' + row.id + '的数据项？').then(function() {
         return deleteCoupon(row.id);
      }).then(() => {
         getList();
         modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

function handleSend(row) {
       openSendCouponDialog.value = true;
       sendForm.couponName = row.name;
       sendForm.couponId = row.id;
       sendForm.num = row.sendNum ? parseInt(row.sendNum): '';
       sendForm.object = 'part';
       sendForm.memberIds = [];
       sendForm.remark = '';
    }

function cancelSend() {
      if (sendLoading.value) {
          modal.msgError("请耐心等待...");
          return false;
      }
      openSendCouponDialog.value = false;
    }

function handleQrCode(row) {
      qr.value = { type: "coupon", id: row.id };
      openQrCode.value = true;
    }

function objectChange() {
      if (sendForm.object == 'all') {
          sendForm.memberIds = [];
      }
    }

function selectUser() {
      openUserSelect.value = true;
    }

function doSelectUser(memberIds) {
      sendForm.memberIds = memberIds;
      openUserSelect.value = false;
    }

function closeDialog() {
      openUserSelect.value = false;
    }

function closeQrDialog() {
      openQrCode.value = false;
    }

function doSendCoupon() {
      
      if (sendLoading.value) {
          return false;
      }
      app.$refs["sendForm"].validate(valid => {
        if (valid) {
          app.$confirm('您确定要发放卡券吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
              sendLoading.value = true;
              const userIds = sendForm.memberIds ? sendForm.memberIds.join(",") : '';
              const param = { couponId: sendForm.couponId, userIds : userIds, object: sendForm.object, num : sendForm.num, remark: sendForm.remark };
              sendCoupon(param).then(response => {
                if (response.data) {
                    openSendCouponDialog.value = false
                    modal.msgSuccess("卡券发放成功");
                    sendLoading.value = false;
                }
              }).catch(() => {
                  sendLoading.value = false;
              });;
          }).catch(() => {
              sendLoading.value = false;
          });
        }
      })
    }

function addStoreItem() {
      storeItem.push( { storeAmount: '', giveAmount: '' } );
    }

function removeStoreItem(index) {
      const newStoreItem = [];
      storeItem.forEach(function(item, i){
        if (index !== i) {
            newStoreItem.push(item);
        }
      });
      storeItem.length = 0; storeItem.push(...(newStoreItem || []));
    }

function handleUploadSuccess(file) {
      form.value.image = file.data.fileName
    }

function handleRemove(file, fileList) {
      setTimeout(() => {
        hideUpload.value = fileList.length > 0
      }, 520)
    }

getList();
getGroupList();
getTotalMember();
</script>
<style scoped>
.common-dialog :deep(.el-upload--picture-card) {
  width: 60px;
  height: 50px;
  line-height: 60px;
}
.sp {
  font-size: 12px;
  margin-left: 5px;
  margin-right: 5px;
}
.store-item {
  margin-top: 5px;
  margin-bottom: 5px;
}
.remove-item {
  color: red;
  cursor: pointer;
  margin-left: 10px;
}
</style>
