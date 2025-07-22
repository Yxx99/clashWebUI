<template>
    <el-button type="primary" style="margin-bottom: 16px;" @click="addSub">新增</el-button>
    <div class="card-list" ref="cardListRef">
        <el-card v-for="item in tableData" :key="item.id" class="sub-card" :header="item.title">
            <div class="card-content">
                <el-progress type="dashboard" :percentage="getUsagePercent(item)" :status="progressStatus(item)">
                    <span class="percentage-value">{{ getUsagePercent(item) }}%</span>
                </el-progress>
                <div class="usage-info">
                    <div>已用：{{ formatNumber(item.usage) }} / 总量：{{ formatNumber(item.total) }}</div>
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="editSub(item)" size="small">编辑</el-button>
                <el-button type="danger" @click="deleteSub(item)" size="small">删除</el-button>
                <el-button v-if="!!item.url.length" @click="updateSubscriptionFromServer(item)"
                    size="small">更新</el-button>
            </template>
        </el-card>
    </div>
    <el-dialog v-model="subDialogVisible" :title="subDialogTitle" width="30%">
        <el-form :model="subForm" label-width="120px">
            <el-form-item label="名称">
                <el-input v-model="subForm.title" />
            </el-form-item>
            <el-form-item label="URL">
                <el-input v-model="subForm.url" />
            </el-form-item>
            <el-form-item label="备用URL">
                <el-input v-model="subForm.bak_url" />
            </el-form-item>
            <el-form-item label="统计URL">
                <el-input v-model="subForm.counter_url" />
            </el-form-item>
            <el-form-item label="状态">
                <el-switch v-model="subForm.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="closeSubDialog">取消</el-button>
            <el-button type="primary" @click="modifySubscription" :loading="subDialogBtnLoading">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { GetSubscriptionListAPI, ModifySubscriptionAPI, DeleteSubscriptionAPI, UpdateSubscriptionAPI } from '@/api/subscription'
import { ElMessageBox, ElMessage } from 'element-plus'
import { loadingService } from '@/utils/tools'

onMounted(() => {
    getSubscriptionList()
})

const cardListRef = ref(null)
const tableData = ref([])

// 获取订阅列表
const getSubscriptionList = () => {
    let loading = loadingService()
    GetSubscriptionListAPI().then(res => {
        tableData.value = res.data
        loading.close()
    })
}

// 计算流量百分比
const getUsagePercent = (item: any) => {
    if (!item.total) return 0
    return Math.round((item.usage / item.total) * 100)
}
const formatUsage = (item: any) => () => `${getUsagePercent(item)}%`

const progressStatus = (item: any) => {
    let percent = getUsagePercent(item)
    if (percent >= 90) return 'exception'
    if (percent >= 70) return 'warning'
    return 'success'
}

// 保留两位小数
const formatNumber = (val: number) => {
    if (typeof val !== 'number') return val
    return val.toFixed(2) + 'GB'
}

// 新增订阅弹窗
const subDialogBtnLoading = ref(false)
const subDialogVisible = ref(false)
const subDialogTitle = ref('新增订阅')

const subForm = reactive({
    id: 0,
    title: '',
    url: '',
    bak_url: '',
    counter_url: '',
    status: 1,
})

const addSub = () => {
    subDialogTitle.value = '新增订阅'
    subDialogVisible.value = true
}

const editSub = (row: any) => {
    subDialogTitle.value = '编辑订阅'
    subForm.id = row.id
    subForm.title = row.title
    subForm.url = row.url
    subForm.bak_url = row.bak_url
    subForm.counter_url = row.counter_url
    subForm.status = row.status
    subDialogVisible.value = true
}

const closeSubDialog = () => {
    subForm.id = 0
    subForm.title = ''
    subForm.url = ''
    subForm.bak_url = ''
    subForm.counter_url = ''
    subForm.status = 1
    subDialogVisible.value = false
}

// 更新订阅信息
const modifySubscription = () => {
    subDialogBtnLoading.value = true
    ModifySubscriptionAPI(subForm).then(res => {
        ElMessage.success(res.msg)
        subDialogBtnLoading.value = false
        closeSubDialog()
        getSubscriptionList()
    })
}

// 删除订阅
const deleteSub = (row: any) => {
    ElMessageBox.confirm('确定删除该订阅吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        DeleteSubscriptionAPI({ id: row.id }).then(res => {
            ElMessage.success(res.msg)
            getSubscriptionList()
        })
    }).catch(() => {
        ElMessage.info('取消删除')
    })
}

// 从服务器更新订阅信息
const updateSubscriptionFromServer = (row: any) => {
    ElMessageBox.confirm('确定从服务器更新该订阅吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        let loading = loadingService('.main-content', '更新中...')
        UpdateSubscriptionAPI({ id: row.id }).then(res => {
            ElMessage.success(res.msg)
            GetSubscriptionListAPI().then(res => {
                tableData.value = res.data
                loading.close()
            })
        }).catch(err => {
            loading.close()
        })
    }).catch(() => {
        ElMessage.info('取消更新')
    })
}

</script>

<style lang="scss" scoped>
.card-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.sub-card {
    width: 300px;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
}

.usage-info {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
}
</style>