<template>
  <div class="app-container">
    <el-form :model="queryParams" class="main-search" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
          clearable
          style="width: 240px">
          <el-option key="A" label="启用" value="A" />
          <el-option key="N" label="禁用" value="N" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:role:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:role:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:role:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="100" align="center" />
      <el-table-column label="ID" prop="id" width="100" />
      <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="角色类型" prop="type" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="状态" align="center" width="200">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="A"
            inactive-value="N"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <template v-if="row && row.id !== 1">
            <el-button
              size="small"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(row)"
              v-hasPermi="['system:role:edit']">修改</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(row)"
              v-hasPermi="['system:role:delete']">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" class="common-dialog" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" style="width: 300px" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select
            v-model="form.roleType"
            placeholder="角色类型"
            style="width: 300px">
          <el-option key="1" label="超级管理员" value="1" />
          <el-option key="2" label="普通管理员" value="2" />
          <el-option key="3" label="用户角色" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio key="A" label="A" value="A">启用</el-radio>
            <el-radio key="N" label="N" value="N">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menu"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listRole, getRole, delRole, addRole, updateRole, changeRoleStatus } from "@/api/system/role";
import { treeselect as menuTreeselect } from "@/api/system/menu";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import modal from '@/plugins/modal'

defineOptions({ name: 'Role' })

const router = useRouter()
const route = useRoute()
const state = reactive({
// 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: { id: '', status: 'A', roleType: '1', description: '', menuCheckStrictly: true },
      defaultProps: {
        children: "childrens",
        label: "label"
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" }
        ],
        roleType: [
          { required: true, message: "角色类型不能为空", trigger: "blur" }
        ]
      }
})
const { loading, ids, single, multiple, showSearch, total, roleList, title, open, openDataScope, menuExpand, menuNodeAll, menuOptions, deptOptions, queryParams, form, defaultProps, rules } = toRefs(state)

function getList() {

      loading.value = true;
      listRole(queryParams.value).then(response => {
        const data = (response && response.data) || {};
        roleList.value = data.content || [];
        total.value = data.totalElements || 0;
      }).finally(() => {
        loading.value = false;
      });
    
}

function getMenuTreeselect() {

      return menuTreeselect().then(response => {
          menuOptions.value = response.data;
          return response
      });
    
}

function getMenuAllCheckedKeys() {

      // 目前被选中的菜单节点
      let checkedKeys = menuRef.value.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    
}

function handleStatusChange(row) {

      let text = row.status === "N" ? "禁用" : "启用";
      modal.confirm('确认要' + text + '"' + row.name + '"角色吗？').then(function() {
        return changeRoleStatus(row.id, row.status);
      }).then(() => {
        modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "A" ? "N" : "A";
      });
    
}

function cancel() {

      open.value = false;
      reset();
    
}

function cancelDataScope() {

      openDataScope.value = false;
      reset();
    
}

function reset() {

      if (menuRef.value != undefined) {
          menuRef.value.setCheckedKeys([]);
      }
      menuExpand.value = false,
      menuNodeAll.value = false,
      form.value = {
        id: undefined,
        roleName: '',
        roleType: '1',
        status: "A",
        menuIds: [],
        menuCheckStrictly: true,
        description: ''
      };
      formRef.value?.resetFields();
    
}

function handleQuery() {

      queryParams.value.page = 1;
      getList();
    
}

function resetQuery() {

      dateRange.value = [];
      queryParams.value.name = '';
      queryParams.value.status = '';
      queryFormRef.value?.resetFields();
      handleQuery();
    
}

function handleSelectionChange(selection) {

      ids.value = selection.map(item => item.id)
      single.value = selection.length!=1
      multiple.value = !selection.length
    
}

function handleCheckedTreeExpand(value, type) {

      if (type == 'menu') {
          let treeList = menuOptions.value;
          for (let i = 0; i < treeList.length; i++) {
               menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
          }
      }
    
}

function handleCheckedTreeNodeAll(value, type) {

      if (type == 'menu') {
          menuRef.value.setCheckedNodes(value ? menuOptions.value: []);
      }
    
}

function handleCheckedTreeConnect(value, type) {

      if (type == 'menu') {
          form.value.menuCheckStrictly = value ? true: false;
      }
    
}

function handleAdd() {

      reset();
      getMenuTreeselect();
      open.value = true;
      title.value = "添加角色";
    
}

function handleUpdate(row) {

      reset();
      const roleMenu = getMenuTreeselect();
      const roleId = row.id || ids.value
      getRole(roleId).then(response => {
        form.value.roleName = response.data.roleInfo.name;
        form.value.roleType = response.data.roleInfo.type;
        form.value.status = response.data.roleInfo.status;
        form.value.id = response.data.roleInfo.id;
        form.value.description = response.data.roleInfo.description;
        open.value = true;
        title.value = "修改角色";
        let checkedKeys = response.data.checkedKeys

        nextTick(() => {
          roleMenu.then(res => {
            checkedKeys.forEach((v) => {
              nextTick(()=>{
                  menuRef.value.setChecked(v, true ,false);
              })
            })
          });
        });
      });
    
}

function handleAuthUser(row) {

      const roleId = row.id;
      router.push("/system/role-auth/account/" + roleId);
    
}

function submitForm() {

      formRef.value.validate(valid => {
        if (valid) {
          if (form.value.id) {
            form.value.menuIds = getMenuAllCheckedKeys();
            updateRole(form.value).then(response => {
              modal.msgSuccess("修改成功");
              open.value = false;
              getList();
            });
          } else {
            form.value.menuIds = getMenuAllCheckedKeys();
            addRole(form.value).then(response => {
              modal.msgSuccess("新增成功");
              open.value = false;
              getList();
            });
          }
        }
      });
    
}

function handleDelete(row) {

      const roleIds = row.id || ids.value;
      modal.confirm('是否确认删除角色ID为"' + roleIds + '"的数据项？').then(function() {
        return delRole(roleIds);
      }).then(() => {
        getList();
        modal.msgSuccess("删除成功");
      }).catch(() => {});
    
}

getList()
</script>
