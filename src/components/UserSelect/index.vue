<!-- 会员选择对话框 -->
<template>
    <el-dialog class="common-dialog" title="选择会员" :model-value="showDialog" @close="close" width="1000px" destroy-on-close>
        <div class="user-content">
          <div class="group-list">
            <div class="search">
              <el-input
              v-model="keyword"
              placeholder="请输入会员号、手机号..."
              style="width: 190px;margin-right: 2px;"
              clearable></el-input>
              <el-button type="primary" @click="doSearch()">查询</el-button>
            </div>
            <el-tree
              ref="treeRef"
              :data="groupList"
              show-checkbox
              node-key="id"
              @check-change="checkGroup"
              :props="defaultProps">
            </el-tree>
            <div class="clearfix"></div>
          </div>
          <div class="member-list">
            <el-alert type="error" class="tips" :closable="false">共{{ memberList.length }}会员，已选择{{ memberIds.length }}位会员</el-alert>
            <el-table
              v-loading="loading"
              ref="multipleTable"
              :data="memberList"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="checkUser">
              <el-table-column
                type="selection"
                align="center"
                width="55">
              </el-table-column>
              <el-table-column
                label="会员号"
                align="center"
                width="160">
                <template #default="scope">{{ scope.row.userNo }}</template>
              </el-table-column>
              <el-table-column
                prop="name"
                align="center"
                label="名称">
              </el-table-column>
              <el-table-column
                prop="mobile"
                label="手机"
                align="center"
                width="120">
                <template #default="scope">
                  <span>{{ scope.row.mobile ? scope.row.mobile : '-' }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="clearfix"></div>
        <template #footer><div class="dialog-footer">
            <el-button @click="close()">取消</el-button>
            <el-button type="primary" @click="doSelectUser()">确定</el-button>
        </div></template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, toRefs, watch } from 'vue'
import { searchMembers, getGroupList as fetchGroupList } from '@/api/member'

defineOptions({ name: 'UserSelect' })

const props = defineProps({
  showDialog: {
    type: [Boolean],
    default: () => false
  },
  memberInfo: {
    type: [Object],
    default: () => ({})
  },
  cartList: {
    type: [Array],
    default: () => []
  },
})

const emit = defineEmits(['closeDialog', 'doSelectUser'])

const treeRef = ref(null)

const state = reactive({
  loading: false,
  keyword: '',
  groupIds: [],
  memberIds: [],
  groupList: [],
  memberList: [],
  defaultProps: {
    children: 'children',
    label: 'name'
  }
})
const { loading, keyword, groupIds, memberIds, groupList, memberList, defaultProps } = toRefs(state)

function getMemberList() {
  if (groupIds.value.length < 1 && !keyword.value) {
    memberList.value = []
    return false
  }
  const param = { groupIds: groupIds.value.join(','), keyword: keyword.value }
  loading.value = true
  searchMembers(param).then((response) => {
    if (response) {
      memberList.value = response.data
    }
    loading.value = false
  })
}

function loadGroupList() {
  fetchGroupList().then((response) => {
    if (response.data) {
      groupList.value = response.data
    }
  })
}

function checkGroup() {
  groupIds.value = treeRef.value?.getCheckedKeys() || []
  getMemberList()
}

function checkUser(userList) {
  const arr = []
  if (userList) {
    userList.forEach((user) => {
      arr.push(user.id)
    })
  }
  memberIds.value = arr
}

function doSearch() {
  getMemberList()
}

function close() {
  emit('closeDialog', 'selectUser')
}

function doSelectUser() {
  emit('doSelectUser', memberIds.value)
}

watch(
  () => props.showDialog,
  (value) => {
    if (value) {
      loadGroupList()
      memberIds.value = []
      memberList.value = []
    }
  }
)
</script>
<style lang="scss" scoped>
  .user-content {
    min-height: 300px;
    .group-list {
      width: 300px;
      float: left;
      padding: 10px;
      border: solid 1px #cccccc;
      height: 400px;
      overflow-y: scroll;
      .search {
        margin-bottom: 10px;
      }
    }
    .member-list {
      float: left;
      height: 400px;
      overflow-y: scroll;
      border: solid 1px #cccccc;
      width: 606px;
      padding: 10px;
      margin-left: 20px;
      .tips {
         position: absolute;
         width: 400px;
         top: 30px;
      }
    }
  }
</style>
