<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" class="main-search" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属店铺" prop="store">
        <el-select
          v-model="queryParams.storeId"
          placeholder="所属店铺"
          clearable
          style="width: 180px">
          <el-option :key="0" label="公共分类" v-if="!storeId" :value="0" />
          <el-option v-for="storeInfo in storeOptions" :key="storeInfo.id" :label="storeInfo.name" :value="storeInfo.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option key="A" label="启用" value="A" />
          <el-option key="N" label="禁用" value="N" />
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
          v-hasPermi="['goods:cate:index']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="分类ID" prop="id" width="66" />
      <el-table-column label="所属店铺" align="center">
        <template #default="scope">
          <span v-if="scope.row.storeName">{{ scope.row.storeName }}</span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="图片" align="center" width="200">
        <template #default="scope">
            <img class="list-img" :src="imagePath + scope.row.logo">
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="N"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['goods:cate:index']"
            v-if="storeId == scope.row.storeId || storeId == 0"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['goods:cate:index']"
            v-if="storeId == scope.row.storeId || storeId == 0"
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select class="input" v-model="form.storeId" clearable placeholder="请选择所属店铺">
                <el-option :key="0" label="公共分类" v-if="storeId == 0" :value="0" />
                <el-option
                  v-for="item in storeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 'A'"></el-option>
              </el-select>
              <div class="form-tips">提示：未选择则属于公共分类</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
              <div class="form-tips">提示：数值越小，排行越靠前</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="9">
            <el-form-item label="图片" prop="image">
              <el-upload
                   :action="uploadAction"
                   list-type="picture-card"
                   :class="{hide:hideUpload}"
                   :file-list="uploadFiles"
                   :auto-upload="true"
                   :show-file-list="false"
                   :headers="uploadHeader"
                   :on-success="handleUploadSuccess">
                <img
                  v-if="form.logo"
                  :src="imagePath + form.logo"
                  class="list-img" />
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <p class="form-tips">（提示：点击图片修改，建议尺寸：128 x 128）</p>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.description" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio key="A" label="A" value="A">启用</el-radio>
                <el-radio key="N" label="N" value="N">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { useStore } from 'vuex'

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getToken } from '@/utils/auth'
import { getGoodsCateList, getGoodsCateInfo, saveGoodsCate, updateGoodsCateStatus } from "@/api/goodsCate";


defineOptions({ name: 'GoodsCateIndex' })


const store = useStore()

const storeId = store.getters.storeId

const loading = ref(true)

const title = ref("")

const ids = reactive([])

const multiple = ref(true)

const showSearch = ref(true)

const imagePath = ref("")

const total = ref(0)

const list = reactive([])

const storeOptions = reactive([])

const open = ref(false)

const defaultSort = reactive({prop: 'sort', order: 'descending'})

const form = reactive({ storeId: store.getters.storeId, id: '', name: '', logo: '', sort: 0, status: "A" })

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const uploadHeader = reactive({ 'Access-Token' : getToken() })

const hideUpload = ref(false)

const uploadFiles = reactive([])

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        name: '',
        status: ''
      })

const rules = reactive({
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" },
          { min: 2, max: 200, message: '名称长度必须介于2 和 200 之间', trigger: 'blur' }
        ],
        logo: [{ required: true, message: "请上传图片", trigger: "blur" }]
      })

const queryForm = ref(null)

const formRef = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getGoodsCateList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.paginationResponse.content || []));
          total.value = response.data.paginationResponse.totalElements;
          imagePath.value = response.data.imagePath;
          storeOptions.length = 0; storeOptions.push(...(response.data.storeList || []));
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
      modal.confirm('确认要' + text + '"' + row.name + '"吗？').then(function() {
        return updateGoodsCateStatus(row.id, row.status);
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
      title.value = "新增商品分类";
    }

function reset() {
      Object.assign(form, {
        id: "",
        storeId: storeId,
        name: "",
        status: "A",
        logo: "",
        sort: 0,
        description: ""
      });
      uploadFiles.length = 0
      formRef.value?.resetFields();
    }

function cancel() {
      open.value = false;
      reset();
    }

function submitForm() {
      formRef.value.validate(valid => {
        if (valid) {
          if (form.logo.length < 1) {
              form.logo = '/static/defaultImage/none.png';
          }
          if (form.id) {
              saveGoodsCate(form).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveGoodsCate(form).then(response => {
                modal.msgSuccess("新增成功");
                open.value = false;
                getList();
              });
          }
        }
      });
    }

function handleUpdate(row) {
      reset();
      const id = row.id || ids;
      getGoodsCateInfo(id).then(response => {
        Object.assign(form, response.data.cateInfo);
        uploadFiles.length = 0; uploadFiles.push(...[{ url: response.data.imagePath + form.logo, status: 'finished'}])
        open.value = true;
        title.value = "编辑商品分类";
      });
    }

function handleDelete(row) {
      const name = row.name
      modal.confirm('是否确认删除"' + name + '"的数据项？').then(function() {
        return updateGoodsCateStatus(row.id, 'D');
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

function handleUploadSuccess(file) {
      form.logo = file.data.fileName;
    }

getList();
</script>
<style scoped>
.common-dialog :deep(.el-upload--picture-card) {
  width: 60px;
  height: 50px;
  line-height: 60px;
}
</style>

