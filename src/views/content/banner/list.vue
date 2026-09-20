<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属店铺" prop="store">
        <el-select
          v-model="queryParams.storeId"
          placeholder="所属店铺"
          clearable
          style="width: 180px">
          <el-option :key="0" label="公共所有" v-if="!storeId" :value="0" />
          <el-option v-for="storeInfo in storeList" :key="storeInfo.id" :label="storeInfo.name" :value="storeInfo.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 100px">
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
          v-hasPermi="['content:banner:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" prop="id" width="55" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="所属店铺" align="center" prop="store">
        <template #default="scope">
          <span v-if="scope.row.storeId && scope.row.storeId > 0">
              <span>{{ getName(storeList, scope.row.storeId) }}</span>
          </span>
          <span v-else>公共所有</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" width="200">
        <template #default="scope">
            <img class="list-img" :src="imagePath + scope.row.image">
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
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            v-hasPermi="['content:banner:edit']"
            @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            v-hasPermi="['content:banner:edit']"
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
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属店铺" prop="storeId">
              <el-select
                v-model="form.storeId"
                style="width: 260px"
                placeholder="所属店铺，空则为公共所有">
                <el-option :key="0" label="公共所有" v-if="!storeId" :value="0" />
                <el-option v-for="storeInfo in storeList" :key="storeInfo.id" :label="storeInfo.name" :value="storeInfo.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="展示位置" prop="position">
              <el-select
                v-model="form.position"
                style="width: 260px"
                placeholder="展示位置">
                <el-option v-for="position in positionList" :key="position.key" :label="position.name" :value="position.key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="链接" prop="url">
              <el-input v-model="form.url" placeholder="请输入链接，如：pages/user/index" maxlength="200" />
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
                  v-if="form.image"
                  :src="imagePath + form.image"
                  class="list-img" />
                <i v-if="!form.image" class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <p class="form-tips">（提示：点击图片修改，建议尺寸：640 x 350）</p>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="form.sort" placeholder="请输入排序数字，越小越靠前" maxlength="10" />
            </el-form-item>
          </el-col>
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

import modal from '@/plugins/modal'

import { parseTime } from '@/utils/fuint'

import { getName } from '@/utils/fuint'

import { getToken } from '@/utils/auth';
import { getBannerList, updateBannerStatus, getBannerInfo, saveBanner } from "@/api/banner";


defineOptions({ name: 'BannerList' })


const loading = ref(true)

const title = ref("")

const ids = reactive([])

const multiple = ref(true)

const showSearch = ref(true)

const imagePath = ref("")

const total = ref(0)

const list = reactive([])

const open = ref(false)

const defaultSort = reactive({prop: 'sort', order: 'ascending'})

const form = reactive({ id: '', title: '', storeId: 0,  status: "A", sort: 0 })

const storeList = reactive([])

const positionList = reactive([])

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const hideUpload = ref(false)

const uploadFiles = reactive([])

const uploadHeader = reactive({ 'Access-Token' : getToken() })

const queryParams = reactive({
        page: 1,
        pageSize: 10,
        title: '',
        storeId: '',
        status: ''
      })

const rules = reactive({
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" },
          { min: 2, max: 200, message: '标题长度必须介于2 和 200 之间', trigger: 'blur' }
        ],
        image: [{ required: true, message: "请上传图片", trigger: "blur" }]
      })

const queryForm = ref(null)

const formRef = ref(null)

const tables = ref(null)

function getList() {
      loading.value = true;
      getBannerList(queryParams).then( response => {
          list.length = 0; list.push(...(response.data.dataList.content || []));
          total.value = response.data.dataList.totalElements;
          imagePath.value = response.data.imagePath;
          storeList.length = 0; storeList.push(...(response.data.storeList || []));
          positionList.length = 0; positionList.push(...(response.data.positionList || []));
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
      modal.confirm('确认要' + text + '"' + row.title + '"吗？').then(function() {
        return updateBannerStatus(row.id, row.status);
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
      title.value = "新增轮播图";
    }

function reset() {
      Object.assign(form, {
        id: "",
        title: "",
        status: "A",
        image: "",
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
          if (form.id) {
              saveBanner(form).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveBanner(form).then(response => {
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
      getBannerInfo(id).then(response => {
        Object.assign(form, response.data.bannerInfo);
        uploadFiles.length = 0; uploadFiles.push(...[{ url: response.data.imagePath + form.image, status: 'finished'}])
        open.value = true;
        title.value = "编辑轮播图";
      });
    }

function handleDelete(row) {
      const name = row.title
      modal.confirm('是否确认删除"' + name + '"的数据项？').then(function() {
        return updateBannerStatus(row.id, 'D');
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    }

function handleUploadSuccess(file) {
      form.image = file.data.fileName
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
