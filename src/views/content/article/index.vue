<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable>
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
          v-hasPermi="['content:article:add']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column label="ID" prop="id" width="60" />
      <el-table-column label="图片" align="center" width="200">
        <template #default="scope">
          <img class="list-img" :src="scope.row.image">
        </template>
      </el-table-column>
      <el-table-column
        label="文章标题"
        align="left"
        prop="title"
        :show-overflow-tooltip="true" />
      <el-table-column label="点击数" prop="click" align="center" width="60" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="N"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="operator" width="100" />
      <el-table-column label="创建时间" align="center" width="160" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['content:article:edit']">修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['content:article:edit']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" v-model="open" class="common-dialog" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入文章标题" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="简介">
                <el-input v-model="form.brief" type="textarea" placeholder="请输入简介"></el-input>
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
            <el-col :span="14">
              <el-form-item label="排序" prop="sort">
                <el-input v-model="form.sort" placeholder="请输入排序数字，越小越靠前" maxlength="10" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="内容">
                <editor v-model="form.description" :min-height="300" />
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

import { getArticleList, getArticle, updateStatus, saveArticle } from "@/api/article";
import { getToken } from '@/utils/auth';


defineOptions({ name: 'Article' })


const loading = ref(true)

const ids = reactive([])

const single = ref(true)

const multiple = ref(true)

const total = ref(0)

const imagePath = ref("")

const uploadAction = ref(import.meta.env.VUE_APP_SERVER_URL + 'backendApi/file/upload')

const hideUpload = ref(false)

const uploadFiles = reactive([])

const uploadHeader = reactive({ 'Access-Token' : getToken() })

const articleList = reactive([])

const storeList = reactive([])

const title = ref("")

const open = ref(false)

const queryParams = reactive({
        pageNum: 1,
        pageSize: 10,
        title: '',
        status: ''
      })

const form = reactive({
        id: '',
        title: '',
        description: '',
        storeId: 0,
        image: '',
        brief: "",
        sort: 0,
        status: "A"
      })

const rules = reactive({
        title: [
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ]
      })

const queryForm = ref(null)

const formRef = ref(null)

function getList() {
      loading.value = true;
      getArticleList(queryParams).then(response => {
        articleList.length = 0; articleList.push(...(response.data.dataList.content || []));
        total.value = response.data.dataList.totalElements;
        imagePath.value = response.data.imagePath
        storeList.length = 0; storeList.push(...(response.data.storeList || []));
        loading.value = false;
      });
    }

function cancel() {
      open.value = false;
      reset();
    }

function reset() {
      Object.assign(form, {
        id: '',
        title: '',
        description: '',
        storeId: 0,
        image: '',
        brief: "",
        sort: 0,
        status: "A"
      });
      formRef.value?.resetFields();
    }

function handleQuery() {
      queryParams.pageNum = 1;
      getList();
    }

function resetQuery() {
      queryForm.value?.resetFields();
      handleQuery();
    }

function handleSelectionChange(selection) {
      ids.length = 0; ids.push(...(selection.map(item => item.articleId) || []))
      single.value = selection.length!=1
      multiple.value = !selection.length
    }

function handleStatusChange(row) {
      let text = row.status == "A" ? "启用" : "禁用";
      modal.confirm('确认要' + text + '"' + row.title + '"吗？').then(function() {
        return updateStatus(row.id, row.status);
      }).then(() => {
        modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "N" ? "A" : "N";
      });
    }

function handleUploadSuccess(file) {
      form.image = file.data.fileName
    }

function handleAdd() {
      reset();
      open.value = true;
      title.value = "新增文章";
    }

function handleUpdate(row) {
      reset();
      const articleId = row.id || ids
      getArticle(articleId).then(response => {
        Object.assign(form, response.data.articleInfo);
        open.value = true;
        title.value = "修改文章";
      });
    }

function submitForm() {
      formRef.value.validate(valid => {
        if (valid) {
          if (form.image.length < 1) {
              form.image = '/static/defaultImage/none.png';
          }
          if (form.articleId != undefined) {
              saveArticle(form).then(response => {
                modal.msgSuccess("修改成功");
                open.value = false;
                getList();
              });
          } else {
              saveArticle(form).then(response => {
                  modal.msgSuccess("新增成功");
                  open.value = false;
                  getList();
              });
          }
        }
      });
    }

function handleDelete(row) {
      const articleId = row.id;
      modal.confirm('是否确认删除文章ID为"' + articleId + '"的数据项？').then(function() {
        return updateStatus(articleId, 'D');
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
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
