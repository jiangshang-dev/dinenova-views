<template>
  <div class="sku-list">
    <template v-if="!disabled">
      <div class="sku-list-head">
        <el-button type="primary" size="small" @click="addSkuRow">添加规格</el-button
        >
      </div>
      <div
        class="sku-list-item"
        v-for="(item, index) in skuData.attrList"
        :key="index">
        <div class="sku-list-item-main">
          <div class="sku-list-item__layout">
            <span class="span">规格名</span>
            <el-input
              size="small"
              v-model="item.name"
              class="input"></el-input>
          </div>
          <div class="sku-list-item__layout">
            <span class="span">规格值</span>
            <div class="sku-list-item-tags">
              <template v-for="(subItem, i) in (item.child || [])" :key="i">
                <el-tag
                  v-if="subItem && subItem.name"
                  class="sku-list-item-tag"
                  closable
                  @close="removeSkuAttr(index, i)"
                >{{ subItem.name }}</el-tag>
              </template>
              <el-button
                size="small"
                icon="el-icon-plus"
                @click="addSkuAttr(index)">添加</el-button
              >
            </div>
          </div>
        </div>
        <el-button
          type="text"
          size="small"
          class="sku-list-item-removeBtn"
          @click="removeSkuRow(index)">删除规格</el-button
        >
      </div>
    </template>

    <div class="batch-setting">
      <span class="label">批量设置</span>
      <el-input size="small" v-model="batch.skuNo" placeholder="sku编码" class="input input-sn"></el-input>
      <span class="create-sn" @click="createGoodsSn()">随机生成</span>
      <el-input size="small" v-model="batch.price" placeholder="商品价格" class="input"></el-input>
      <el-input size="small" v-model="batch.linePrice" placeholder="划线价格" class="input"></el-input>
      <el-input size="small" v-model="batch.stock" placeholder="商品库存" class="input"></el-input>
      <el-input size="small" v-model="batch.weight" placeholder="商品重量" class="input"></el-input>
      <el-button size="small" type="danger" class="button" @click="batchSetSku()">确认设置</el-button>
    </div>

    <el-table border :data="skuData.skuList">
      <el-table-column label="序号" align="center" width="60">
        <template #default="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" width="120">
        <template #default="scope">
          <el-upload
            :disabled="disabled"
            :action="uploadAction"
            list-type="picture-card"
            :auto-upload="true"
            :headers="uploadHeader"
            :file-list="[]"
            :limit="1"
            :on-success="function(file) {
               return onUploadImgSuccess(file, scope.$index) }"
            :show-file-list="false">
            <img
              v-if="scope.row.logo"
              :src="uploadDomain + scope.row.logo"
              class="sku-logo" />
            <i v-if="!scope.row.logo" class="el-icon-plus"></i>
          </el-upload>
        </template>
      </el-table-column>
      <el-table-column label="规格" align="center">
        <template #default="scope">
          <div class="spec-tag" v-for="spec in scope.row.specList"><span class="i">{{ spec.value }}</span></div>
        </template>
      </el-table-column>
      <el-table-column label="sku编码" align="center" width="160">
        <template #default="scope">
          <el-input
            :readonly="disabled"
            v-model="scope.row.skuNo"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="销售价格(元)" align="center">
        <template #default="scope">
          <el-input
            :readonly="disabled"
            v-model="scope.row.price"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="划线价格(元)" align="center">
        <template #default="scope">
          <el-input
            :readonly="disabled"
            v-model="scope.row.linePrice"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="商品库存" align="center">
        <template #default="scope">
          <el-input :readonly="disabled" v-model="scope.row.stock"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="重量(千克)" align="center">
        <template #default="scope">
          <el-input :readonly="disabled" v-model="scope.row.weight"></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

import { ElMessageBox } from 'element-plus'
import modal from '@/plugins/modal'
import { getToken } from '@/utils/auth';
import { saveSpecName, saveSpecValue, deleteSpec, deleteSpecValue } from "@/api/goods";


defineOptions({ name: 'Sku' })


const props = defineProps({
    goodsId: {
      type: String,
      default: "",
    },
    uploadDomain: {
      type: String,
      default: "",
    },
    skuData: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

const emit = defineEmits(['skuChange'])

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const uploadHeader = reactive({ 'Access-Token' : getToken() })

const batch = reactive({ price: '', skuNo: '', linePrice: '', weight: '', stock: '' })

function addSkuRow(i) {
      ElMessageBox.prompt("请输入规格名称", "添加规格", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S+/,
        inputErrorMessage: "规格名称不能为空",
        closeOnClickModal: false,
      }).then(({ value }) => {
          saveSpecName({ goodsId: props.goodsId, name: value }).then(response => {
            props.skuData.attrList.push({
                id: response.data.id,
                name: value,
                child: [],
            });
            emit("skuChange", props.skuData);
          })
      });
    }

function removeSkuRow(i) {
      modal.confirm('确认删除该规格吗？').then(function() {
          deleteSpec({ goodsId: props.goodsId, specName: props.skuData.attrList[i].name }).then(response => {
              props.skuData.attrList.splice(i, 1);
              emit("skuChange", props.skuData);
          })
      });
    }

function removeSkuAttr(a, b) {
      modal.confirm('确认删除该规格值吗？').then(function() {
          deleteSpecValue({ id: props.skuData.attrList[a].child[b].id }).then(response => {
              props.skuData.attrList[a].child.splice(b, 1);
              emit("skuChange", props.skuData);
          })
      });
    }

function addSkuAttr(i) {
      ElMessageBox.prompt("请输入规格值", "添加规格值", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S+/,
        inputErrorMessage: "规格值不能为空",
        closeOnClickModal: false,
      }).then(({ value }) => {
          saveSpecValue({ goodsId: props.goodsId, specName: props.skuData.attrList[i].name, value: value }).then(response => {
              props.skuData.attrList[i].child.push({
                 id: response.data.id,
                 name: value,
                 value: value,
              });
              emit("skuChange", props.skuData);
          })
      });
    }

function batchSetSku() {
      props.skuData.skuList.forEach(function(skuInfo, index) {
         if (batch.skuNo) {
             skuInfo.skuNo = batch.skuNo + index;
         }
         if (batch.price) {
             if (batch.price > 0) {
                 skuInfo.price = batch.price;
             } else {
                 modal.alert("商品价格须大于0！");
                 return false;
             }
         }
         if (batch.linePrice) {
             if (batch.linePrice >= 0) {
                 skuInfo.linePrice = batch.linePrice;
             } else {
                 modal.alert("商品划线价格须大于等于0！");
                 return false;
             }
         }
         if (batch.weight) {
             if (batch.weight >= 0) {
                 skuInfo.weight = batch.weight;
             } else {
                 modal.alert("商品重量须大于等于0！");
                 return false;
             }
         }
         if (batch.stock) {
             if (batch.stock >= 0) {
                 skuInfo.stock = batch.stock;
             } else {
                 modal.alert("商品库存须大于等于0！");
                 return false;
             }
         }
      })
    }

function createGoodsSn() {
      let sn = (Math.random() + 1) * 10000000000000;
      batch.skuNo = sn.toFixed(0);
    }

function onUploadImgSuccess(file, index) {
      if (!file) {
          return;
      }
      props.uploadDomain = file.data.domain;
      props.skuData.skuList[index].logo = file.data.fileName
      emit("skuChange", props.skuData);
    }

function getTable() {
      const table = [];
      const attrValueAry = [];
      const arr = [];
      const tmpSkuData = (props.skuData.attrList || []).filter(
        (d) => d.name != "" && d.child.length > 0
      );
      if (!tmpSkuData || tmpSkuData.length == 0) {
         return [];
      }

      tmpSkuData.forEach((item) => {
         attrValueAry.push(item.child);
      });

      function func(skuArr = [], i) {
        for (let j = 0; j < attrValueAry[i].length; j++) {
          if (i < attrValueAry.length - 1) {
            skuArr[i] = attrValueAry[i][j];
            func(skuArr, i + 1);
          } else {
            arr.push([...skuArr, attrValueAry[i][j]]);
          }
        }
      }
      func([], 0);

      console.log('arr = ', arr);

      arr.forEach((item) => {
        let specIds = "",
            specList = [],
            findItem,
            tableItem;
        item.forEach((d) => {
            specIds += specIds ? `-${d.id}` : `${d.id}`;
            specList.push( { id: d.id, name: d.name, value: d.name } )
        });

        console.log('specList = ', specList);

        findItem =
          (props.skuData.initSkuList || []).find((item) => {
            return String(item.specIds) === specIds;
          }) || {};

        tableItem = Object.assign(
          {
            price: '',
            linePrice: '',
            skuNo: '',
            stock: '',
            logo: '',
            weight: '0',
            specList: specList
          },
          findItem,
          {
            specIds,
          }
        );
        tableItem.specList = specList;
        console.log('tableItem = ', tableItem)
        table.push(tableItem);
      });

      return table;
    }

watch(
  () => props.skuData.attrList,
  () => {
    if (!props.disabled) {
      props.skuData.skuList = getTable()
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.sku-list {
  &-head {
    margin-bottom: 10px;
  }
  &-item {
    display: flex;
    align-items: center;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 5px;
    padding: 10px;
    background: #f5f5f5;
    &-main {
      flex: 1;
    }
    &-removeBtn {
      margin-left: 20px;
      color: #f56c6c;
    }
    &__layout {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      &:last-child {
        margin-bottom: 0;
      }
      .input {
        width: 240px;
      }
      .span {
        font-size: 13px;
        font-weight: bold;
        margin-right: 10px;
        color: #666;
      }
    }
    &-tags {
      flex: 1;
    }
    &-tag {
      margin-bottom: 10px;
      margin-right: 10px;
    }
  }
}
.spec-tag {
     margin: 10px 0px 10px 0px;
    .i {
       background: #cceeee;
       color: #113a28;
       padding: 5px;
       border-radius: 12px;
    }
}
.sku-logo {
    height: 78px;
    width: 78px;
    border-radius: 6px;
}
.batch-setting {
    margin: 20px 0px 3px 0px;
   .input {
      width: 100px;
      margin-left: 10px;
   }
   .input-sn {
      width: 140px;
   }
   .button {
     margin-left: 5px;
   }
}
.create-sn {
  margin-left: 2px;
}
</style>
