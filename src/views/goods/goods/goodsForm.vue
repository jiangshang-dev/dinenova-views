<template>
  <div class="app-container">
    <div class="main-panel">
      <el-tabs class="goods-edit-tabs" v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="基础信息" name="base" />
        <el-tab-pane label="扩展信息" name="extend" />
        <el-tab-pane label="商品介绍" name="detail" />
      </el-tabs>
      <div v-show="activeTab === 'base'" class="content">
        <el-form ref="baseFormRef" :model="baseForm" :rules="baseRules" label-width="120px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品类型" prop="cateId">
                <el-select class="input" v-model="baseForm.type" placeholder="请选择商品类型">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品名称" prop="name">
                <el-input class="input" v-model="baseForm.name" placeholder="请输入商品名称" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品条码" prop="goodsNo">
                <el-input class="input" v-model="baseForm.goodsNo" placeholder="请输入商品条码，或使用扫码枪扫描" maxlength="50" />
                <div class="create-sn" @click="createGoodsSn()">随机生成条码</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品分类" prop="cateId">
                <el-select class="input" v-model="baseForm.cateId" placeholder="请选择商品分类">
                  <el-option
                    v-for="item in cateOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                    :disabled="item.status !== 'A'"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="所属店铺" prop="storeId">
                <el-select class="input" v-model="baseForm.storeId" clearable placeholder="请选择所属店铺">
                  <el-option :key="0" label="公共商品" v-if="storeId == 0" :value="0" />
                  <el-option
                    v-for="item in storeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                    :disabled="item.status !== 'A'"></el-option>
                </el-select>
                <div class="form-tips">提示：未选择则属于公共商品</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品图片" prop="images">
                <el-upload class="form__head-icon-upload"
                           :action="uploadAction"
                           list-type="picture-card"
                           :file-list="uploadFiles"
                           :limit="10"
                           :auto-upload="true"
                           :headers="uploadHeader"
                           :on-success="handleUploadSuccess"
                           :on-remove="handleRemove">
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="显示排序" prop="sort">
                <el-input-number v-model="baseForm.sort" :min="0" />
                <div class="form-tips">提示：数值越小，排行越靠前</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品状态">
                <el-radio-group v-model="baseForm.status">
                  <el-radio key="A" label="A" value="A">上架</el-radio>
                  <el-radio key="N" label="N" value="N">下架</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-show="activeTab === 'extend'" class="content">
        <el-form ref="extendFormRef" :model="extendForm" :rules="extendRules" label-width="120px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="积分抵扣" prop="canUsePoint">
                <el-radio-group v-model="extendForm.canUsePoint">
                  <el-radio key="Y" label="Y" value="Y">可用</el-radio>
                  <el-radio key="N" label="N" value="N">不可用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="会员折扣" prop="isMemberDiscount">
                <el-radio-group v-model="extendForm.isMemberDiscount">
                  <el-radio key="Y" label="Y" value="Y">有折扣</el-radio>
                  <el-radio key="N" label="N" value="N">无折扣</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="规格类型" prop="isSingleSpec">
                <el-radio-group v-model="extendForm.isSingleSpec">
                  <el-radio key="Y" label="Y" value="Y">单规格</el-radio>
                  <el-radio key="N" label="N" value="N">多规格</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="extendForm.isSingleSpec == 'N'">
            <el-col :span="24">
              <el-form-item label="商品规格" prop="goodsSpec">
                 <Sku ref="Sku" :skuData="skuData" :goodsId="baseForm.goodsId" :uploadDomain="uploadDomain" @skuChange="skuChange" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="baseForm.type == 'service'">
            <el-col :span="24">
              <el-form-item label="服务时长" prop="serviceTime">
                <el-input v-model="extendForm.serviceTime" class="min-input" placeholder="请输入服务时长，单位：分钟" maxlength="50" />
                <div class="form-tips">提示：输入数字，单位：分钟</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="baseForm.type == 'coupon'">
            <el-col :span="24">
              <el-form-item label="卡券ID" prop="couponIds">
                <el-input v-model="extendForm.couponIds" class="input" rows="2" type="textarea" placeholder="请输入购买的卡券ID，英文逗号分隔，如：1000,1001,1002" maxlength="1000" />
                <div class="form-tips">提示：购买的卡券ID，英文逗号分隔</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="extendForm.isSingleSpec == 'Y'">
            <el-col :span="24">
              <el-form-item label="库存数量" prop="stock">
                <el-input v-model="extendForm.stock" class="min-input" placeholder="请输入库存数量" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="extendForm.isSingleSpec == 'Y'">
            <el-col :span="24">
              <el-form-item label="商品价格" prop="price">
                <el-input v-model="extendForm.price" class="min-input" placeholder="请输入商品价格" maxlength="50" />
                <div class="form-tips">单位：元</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="extendForm.isSingleSpec == 'Y'">
            <el-col :span="24">
              <el-form-item label="划线价格" prop="linePrice">
                <el-input v-model="extendForm.linePrice" class="min-input" placeholder="请输入商品划线，空则不显示" maxlength="50" />
                <div class="form-tips">单位：元</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="extendForm.isSingleSpec == 'N'">
            <el-col :span="24">
              <el-form-item label="商品加料" prop="feedData">
                <div v-for="(item, index) in extendForm.feedData" :key="index" class="feed-row">
                  <span class="feed-label">加料名称</span>
                  <el-input type="text" class="min-input" v-model="item.feedName" placeholder="请输入加料名称" maxlength="50" />
                  <span class="feed-label">价格</span>
                  <el-input type="number" class="min-input" v-model="item.price" placeholder="请输入价格" maxlength="10" />
                  <div class="feeding">
                    <i class="el-icon-remove" @click="feed('-', index)"></i>
                    <i class="el-icon-circle-plus" @click="feed('+')"></i>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="初始销量" prop="initSale">
                <el-input v-model="extendForm.initSale" class="min-input" placeholder="请输入初始销量" maxlength="10" />
                <div class="form-tips">提示：输入数字，虚拟销量</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="extendForm.isSingleSpec == 'Y' && baseForm.type == 'product'">
            <el-col :span="24">
              <el-form-item label="商品重量" prop="weight">
                <el-input v-model="extendForm.weight" class="min-input" placeholder="请输入商品重量" maxlength="10" />
                <div class="form-tips">提示：输入数字，单位kg</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品卖点" prop="salePoint">
                <el-input class="input" v-model="extendForm.salePoint" placeholder="请输入商品卖点，几个字总结" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-if="activeTab === 'detail'" class="content" style="width: 375px;margin-left: 80px;">
        <el-form ref="detailFormRef" :model="detailForm" :rules="detailRules" label-width="120px">
           <editor v-model="detailForm.description" :min-height="550" />
        </el-form>
      </div>
      <div class="footer">
         <el-button type="primary" @click="submitForm">确定</el-button>
         <el-button @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import modal from '@/plugins/modal'
import { getToken } from '@/utils/auth'
import { saveGoods, getGoodsInfo as fetchGoodsInfo } from '@/api/goods'
import Sku from '../components/Sku.vue'

defineOptions({ name: 'GoodsForm' })

const router = useRouter()
const route = useRoute()
const store = useStore()
const storeId = store.getters.storeId

const loading = ref(false)
const activeTab = ref('base')
const storeOptions = ref([])
const cateOptions = ref([])
const typeOptions = ref([])
const skuData = reactive({ attrList: [], skuList: [], initSkuList: [] })
const baseForm = reactive({
  type: 'goods',
  goodsId: '',
  name: '',
  storeId: store.getters.storeId,
  cateId: '',
  goodsNo: '',
  images: [],
  status: 'A',
  sort: 0
})
const extendForm = reactive({
  goodsId: '',
  canUsePoint: 'Y',
  isMemberDiscount: 'Y',
  isSingleSpec: 'Y',
  serviceTime: 0,
  couponIds: '',
  stock: '',
  price: '',
  linePrice: '',
  salePoint: '',
  initSale: '',
  weight: '',
  skuData: null,
  feedData: [{ feedName: '', price: '' }]
})
const detailForm = reactive({ goodsId: '', description: '' })
const uploadAction = import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload'
const uploadHeader = { 'Access-Token': getToken() }
const uploadDomain = ref('')
const uploadFiles = ref([])
const baseRules = {
  name: [
    { required: true, message: '商品名称不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '商品名称长度必须介于2和200 之间', trigger: 'blur' }
  ],
  goodsNo: [
    { required: true, message: '商品条码不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '商品条码长度必须介于2和100之间', trigger: 'blur' }
  ],
  cateId: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
  images: [{ required: true, message: '请上传商品图片', trigger: 'blur' }]
}
const extendRules = {
  couponIds: [
    { required: true, message: '卡券ID不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '卡券ID长度必须介于1和100之间', trigger: 'blur' }
  ],
  canUsePoint: [{ required: true, message: '请选择', trigger: 'blur' }],
  isMemberDiscount: [{ required: true, message: '请选择', trigger: 'blur' }],
  isSingleSpec: [{ required: true, message: '请选择', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { pattern: /^[0-9]{1,10}$/, message: '库存数量必须是正整数', trigger: 'blur' }
  ],
  initSale: [{ pattern: /^[0-9]{1,10}$/, message: '初始销量必须是正整数', trigger: 'blur' }],
  weight: [
    { pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/, message: '重量必须大于等于0', trigger: 'blur' }
  ]
}
const detailRules = {
  description: [{ required: true, message: '请输入商品详情', trigger: 'blur' }]
}

const baseFormRef = ref(null)
const extendFormRef = ref(null)
const detailFormRef = ref(null)

function handleTabClick(pane) {
  const name = pane && (pane.paneName || (pane.props && pane.props.name))
  if (name !== undefined && name !== null && name !== '') {
    activeTab.value = name
  }
}

function resolveFileUrl(imagePath, url) {
  if (!url) return ''
  const src = String(url)
  if (src.indexOf('http') === 0 || src.indexOf('data:') === 0) return src
  const prefix = imagePath || ''
  if (!prefix) return src
  const host = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  const pathPart = src.startsWith('/') ? src : '/' + src
  return host + pathPart
}

function feed(type, index) {
  if (type === '-') {
    if (extendForm.feedData.length > 1) {
      extendForm.feedData.splice(index, 1)
    }
    return
  }
  extendForm.feedData.push({ feedName: '', price: '' })
}

function loadGoodsInfo(goodsId) {
  fetchGoodsInfo(goodsId).then((response) => {
    const goodsInfo = response.data.goods
    const imagePath = response.data.imagePath
    uploadDomain.value = imagePath
    if (response.data.feedData && response.data.feedData.length > 0) {
      extendForm.feedData = response.data.feedData
    } else {
      extendForm.feedData = [{ feedName: '', price: '' }]
    }
    if (goodsInfo) {
      baseForm.goodsId = goodsInfo.id + ''
      baseForm.type = goodsInfo.type
      baseForm.name = goodsInfo.name
      baseForm.goodsNo = goodsInfo.goodsNo
      baseForm.cateId = goodsInfo.cateId
      baseForm.storeId = goodsInfo.storeId
      baseForm.sort = goodsInfo.sort
      baseForm.status = goodsInfo.status
      baseForm.images = response.data.images || []
      uploadFiles.value = []
      baseForm.images.forEach((url) => {
        uploadFiles.value.push({ url: resolveFileUrl(imagePath, url) })
      })
      extendForm.goodsId = goodsInfo.id
      extendForm.canUsePoint = goodsInfo.canUsePoint == null ? 'Y' : goodsInfo.canUsePoint
      extendForm.isMemberDiscount = goodsInfo.isMemberDiscount == null ? 'Y' : goodsInfo.isMemberDiscount
      extendForm.isSingleSpec = goodsInfo.isSingleSpec == null ? 'Y' : goodsInfo.isSingleSpec
      extendForm.stock = goodsInfo.stock
      extendForm.price = goodsInfo.price
      extendForm.linePrice = goodsInfo.linePrice
      extendForm.initSale = goodsInfo.initSale
      extendForm.salePoint = goodsInfo.salePoint
      extendForm.weight = goodsInfo.weight
      extendForm.serviceTime = goodsInfo.serviceTime
      extendForm.couponIds = goodsInfo.couponIds
      skuData.attrList = response.data.specData || []
      skuData.skuList = response.data.skuData || []
      skuData.initSkuList = response.data.skuData || []
      detailForm.goodsId = goodsInfo.id
      detailForm.description = goodsInfo.description
    }
    cateOptions.value = response.data.cateList || []
    storeOptions.value = response.data.storeList || []
    typeOptions.value = response.data.typeList || []
  })
}

function afterSave(id) {
  if (!id) return
  // 保存后先离开商品介绍，卸载富文本，避免随后切菜单时 Quill DOM 报错
  if (activeTab.value === 'detail') {
    activeTab.value = 'base'
  }
  loadGoodsInfo(id)
}

function cancel() {
  store.dispatch('tagsView/delView', route)
  router.push({ path: '/goods/goods/index' })
}

function skuChange() {}

function submitForm() {
  extendForm.feedData = (extendForm.feedData || []).filter(
    (i) => i.feedName != '' && i.price !== '' && i.price != null
  )
  extendForm.feedData.forEach((i) => {
    i.price = parseFloat(Number(i.price)).toFixed(2)
  })
  if (extendForm.feedData.length < 1) {
    extendForm.feedData = [{ feedName: '', price: '' }]
  }
  if (activeTab.value == 'base') {
    baseFormRef.value.validate((valid) => {
      if (valid) {
        saveGoods(baseForm).then((response) => {
          modal.msgSuccess('保存成功！')
          afterSave(response.data.goodsInfo.id)
        })
      }
    })
  } else if (activeTab.value == 'extend') {
    if (!extendForm.goodsId) {
      modal.msgError('请先提交商品基础信息')
      activeTab.value = 'base'
      return false
    }
    if (skuData.skuList && skuData.skuList.length > 0) {
      let isValid0 = true
      let isValid1 = true
      let isValid2 = true
      skuData.skuList.forEach((item) => {
        if (!item.skuNo || item.skuNo.length < 1) isValid0 = false
        if (item.stock < 0) isValid1 = false
        if (item.price < 0) isValid2 = false
      })
      if (!isValid0) {
        modal.alert('商品sku编码长度需大于1，请仔细核对！')
        return false
      }
      if (!isValid1) {
        modal.alert('商品库存须大于等于0，请仔细核对！')
        return false
      }
      if (!isValid2) {
        modal.alert('商品价格须大于等于0，请仔细核对！')
        return false
      }
    }
    extendForm.skuData = skuData.skuList
    extendForm.specData = skuData.attrList
    extendFormRef.value.validate((valid) => {
      if (valid) {
        saveGoods(extendForm).then((response) => {
          modal.msgSuccess('保存成功！')
          afterSave(response.data.goodsInfo.id)
        })
      }
    })
  } else {
    if (!detailForm.goodsId) {
      modal.msgError('请先提交商品基础信息')
      activeTab.value = 'base'
      return false
    }
    detailFormRef.value.validate((valid) => {
      if (valid) {
        saveGoods(detailForm).then((response) => {
          modal.msgSuccess('保存成功！')
          afterSave(response.data.goodsInfo.id)
        })
      }
    })
  }
}

function handleUploadSuccess(file) {
  baseForm.images.push(file.data.fileName)
}

function handleRemove(file) {
  const newImages = []
  if (baseForm.images && baseForm.images.length > 0) {
    baseForm.images.forEach((item) => {
      if (file.url.indexOf(item) == -1) {
        newImages.push(item)
      }
    })
  }
  baseForm.images = newImages
}

function createGoodsSn() {
  const sn = (Math.random() + 1) * 100000000000000
  baseForm.goodsNo = sn.toFixed(0)
}

const goodsId = route.query.goodsId ? route.query.goodsId : '0'
loadGoodsInfo(goodsId)

watch(
  () => route.query.goodsId,
  (val) => {
    if (route.path.indexOf('/goods/goods/') === -1) return
    loadGoodsInfo(val ? val : '0')
  }
)
</script>
<style rel="stylesheet/scss" lang="scss">
   .feeding {
      display: inline-block;
      font-size: 26px;
      vertical-align: middle;
      margin-left: 10px;
      i {
        margin-left: 16px;
        cursor: pointer;
        color: #113a28;
      }
   }
   .main-panel {
      padding-top: 5px;
      .goods-edit-tabs > .el-tabs__content {
        display: none;
      }
      .content {
          margin-top: 30px;
          margin-left: 20px;
      }
     .footer {
        margin-top: 20px;
     }
     .create-sn {
        font-size: 12px;
        color: blue;
        cursor: pointer;
        width: 100px;
     }
     .feed-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 12px;
        .feed-label {
          margin: 0 8px 0 0;
          white-space: nowrap;
          color: #606266;
        }
        .feed-label + .min-input {
          margin-right: 16px;
        }
        .min-input {
          width: 180px;
        }
     }
   }
</style>
