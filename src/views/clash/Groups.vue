<template>
    <el-card>
        <div class="proxies-list">
            <el-button type="primary" @click="addGroup" style="margin-bottom: 10px;">新增</el-button>
            <div class="group-list">
                <el-card v-for="item in groupList" :key="item.id" class="group-card">
                    <div class="group-content">
                        <div class="group-header">
                            <span>{{ item.name }}</span>
                        </div>
                        <div class="edit-btn" @click="editGroup(item)">
                            <el-icon>
                                <Edit />
                            </el-icon>
                            <span>编辑</span>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </el-card>

    <el-dialog v-model="proxyDialog" :title="dialogTitle" width="500px" @close="handleClose">
        <el-form :model="groupForm" label-width="100px">
            <el-form-item label="名称">
                <el-input v-model="groupForm.name" />
            </el-form-item>
            <el-form-item label="策略">
                <el-select v-model="groupForm.type" placeholder="选择分组策略">
                    <el-option v-for="item in typeList" :key="item.key" :label="item.key" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="测试URL" v-if="groupForm.type === 'url-test'">
                <el-input v-model="groupForm.url" />
            </el-form-item>
            <el-form-item label="成员" style="height: 300px; overflow-y: auto;">
                <el-checkbox-group v-model="groupForm.members">
                    <div v-for="(item, index) in selectMembers" :key="index"
                        style="display: flex; align-items: center; margin-bottom: 8px;">
                        <el-checkbox :label="item.name" :value="item" />
                        <span style="margin-left: 10px;">优先级：</span>
                        <el-input v-model.number="memberPriorities[item.name]" placeholder="优先级" size="small"
                            style="width: 80px; margin-left: 5px;" type="number" :min="1" :max="9999" />
                    </div>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
                <el-button @click="handleClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { GetGroupListAPI, ChangeProxyStatusAPI, EditProxyAPI, DeleteProxyAPI, GetSelectMembersAPI, ModifyGroupAPI } from '@/api/clash'
import { loadingService } from '@/utils/tools'

onMounted(() => {
    getSelectMembers()
    getGroupList()
})

const tableLoading = ref(false)
const submitLoading = ref(false)
const typeList = [
    { key: '手动选择', value: 'select' },
    { key: '延迟测试', value: 'url-test' },
]
const groupList = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const proxyDialog = ref(false)
const dialogTitle = ref('')
const groupForm = reactive({
    id: 0,
    name: '',
    type: null,
    members: [], // 只存成员名
    url: '',
})

// 新增优先级映射
const memberPriorities = reactive({} as Record<string, number>)

const selectMembers = ref([])

const getSelectMembers = () => {
    GetSelectMembersAPI().then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            selectMembers.value = res.data
            selectMembers.value.forEach((item: any) => {
                memberPriorities[item.name] = item.sort
            })
        }
    })
}

// 获取代理列表
const getGroupList = () => {
    let loading = loadingService()
    GetGroupListAPI().then(res => {
        groupList.value = res.data
        loading.close()
    }).catch(() => {
        loading.close()
    })
}


const addGroup = () => {
    dialogTitle.value = '新增分组'
    groupForm.id = 0
    groupForm.name = ''
    groupForm.type = null
    groupForm.url = ''
    groupForm.members = []
    selectMembers.value.forEach((item: any) => {
        memberPriorities[item.name] = 100
    })
    proxyDialog.value = true
}

// 编辑时回填优先级
const editGroup = (row: any) => {
    console.log(row)
    dialogTitle.value = '编辑分组'
    groupForm.id = row.id
    groupForm.name = row.name
    groupForm.type = row.type
    groupForm.url = row.url
    groupForm.members = row.members
    groupForm.members.forEach((item: any) => {
        memberPriorities[item.name] = item.sort
    })
    selectMembers.value.forEach((item: any) => {
        item.sort = memberPriorities[item.name]
    })

    console.log(groupForm.members)
    console.log(memberPriorities)
    proxyDialog.value = true
}

// 关闭时清空优先级
const handleClose = () => {
    proxyDialog.value = false
    groupForm.id = 0
    groupForm.name = ''
    groupForm.type = null
    groupForm.url = ''
    groupForm.members = []
    // Object.keys(memberPriorities).forEach(key => delete memberPriorities[key])
}

// 提交时带上优先级
const handleSubmit = () => {
    submitLoading.value = true
    // 遍历groupForm.members，为每个成员添加sort属性
    groupForm.members.forEach((item: any) => {
        item.sort = memberPriorities[item.name]
    })
    ModifyGroupAPI(groupForm).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            ElMessage.success(res.msg)
        }
        handleClose()
        getSelectMembers()
        getGroupList()
        submitLoading.value = false
    }).catch(() => {
        submitLoading.value = false
    })
}

const deleteGroup = (id: number) => {
    ElMessageBox.confirm('确定删除该分组吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        DeleteProxyAPI({ id: id }).then(res => {
            if (res.code !== 1) {
                ElMessage.error(res.msg)
            } else {
                ElMessage.success(res.msg)
            }
            getGroupList()
        })
    })
}
</script>

<style lang="scss" scoped>
.config-content {
    width: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.group-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.group-card {
    position: relative;
    width: 200px;
    height: 100%;
    border-radius: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    .group-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        position: relative;
    }

    .group-header {
        font-size: 16px;
        font-weight: bold;
    }

    .edit-btn {
        position: static;
        display: flex;
        align-items: center;
        color: #409EFF;
        cursor: pointer;
        font-size: 14px;
        margin-left: 10px;

        &:hover {
            color: #66b1ff;
        }
    }
}
</style>