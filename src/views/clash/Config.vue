<template>
    <el-card>
        <div class="proxies-list">
            <el-button type="primary" @click="addConfig" style="margin-bottom: 10px;">新增</el-button>
            <el-table :data="configList" style="width: 100%" v-loading="tableLoading">
                <el-table-column prop="id" label="ID" width="100"></el-table-column>
                <el-table-column prop="name" label="名称" width="200"></el-table-column>
                <el-table-column prop="port" label="监听端口" width="100"></el-table-column>
                <el-table-column prop="socks_port" label="SOCKS端口" width="100"></el-table-column>
                <el-table-column prop="allow_lan" label="允许局域网" width="100">
                    <template #default="scope">
                        <el-tag v-if="scope.row.allow_lan === 1" type="success">是</el-tag>
                        <el-tag v-else type="danger">否</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="mode" label="模式" width="100"></el-table-column>
                <el-table-column prop="log_level" label="日志级别" width="100"></el-table-column>
                <el-table-column prop="external_controller" label="外部控制" width="200"></el-table-column>
                <el-table-column label="操作" min-width="120">
                    <template #default="scope">
                        <div style="display: flex; gap: 10px;">
                            <el-link type="primary" @click="editConfig(scope.row)" size="small"
                                underline="never">编辑</el-link>
                            <el-link type="danger" @click="deleteConfig(scope.row.id)" size="small"
                                underline="never">删除</el-link>
                            <el-link type="primary" @click="viewConfig(scope.row)" size="small"
                                underline="never">查看</el-link>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next"
                    @change="handleChange" />
            </div>
        </div>
    </el-card>

    <el-dialog v-model="configDialog" :title="dialogTitle" width="500px" @close="handleClose">
        <el-form :model="configForm" label-width="100px">
            <el-form-item label="名称">
                <el-input v-model="configForm.name" />
            </el-form-item>
            <el-form-item label="端口">
                <el-input-number v-model="configForm.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="SOCKS端口">
                <el-input-number v-model="configForm.socks_port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="允许局域网">
                <el-switch v-model="configForm.allow_lan" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="模式">
                <el-select v-model="configForm.mode" placeholder="请选择模式">
                    <el-option label="Rule" value="rule" />
                    <el-option label="Global" value="global" />
                    <el-option label="Direct" value="direct" />
                    <el-option label="Script" value="script" />
                </el-select>
            </el-form-item>
            <el-form-item label="日志级别">
                <el-select v-model="configForm.log_level" placeholder="请选择日志级别">
                    <el-option label="info" value="info" />
                    <el-option label="warning" value="warning" />
                    <el-option label="error" value="error" />
                </el-select>
            </el-form-item>
            <el-form-item label="流量统计">
                <el-checkbox-group v-model="configForm.usage_sub">
                    <el-checkbox v-for="item in subscriptionList" :key="item.id" :label="item.title" :value="item.id" />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
                <el-button @click="handleClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

    <el-dialog v-model="qrcodeDialog" title="订阅链接" width="300px" @close="handleCloseQrcode">
        <div class="qrcode-container">
            <div class="qrcode-item">
                <qrcode-vue :value="qrcodeUrl" :size="200" level="H" render-as="svg" />
            </div>
            <div class="qrcode-url">
                <el-tooltip class="box-item" effect="dark" content="点击复制" placement="right">
                    <span class="qrcode-url-text" @click="copyText(qrcodeUrl)">{{ qrcodeUrl }}</span>
                </el-tooltip>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { GetConfigListAPI, SaveConfigAPI, DeleteConfigAPI, GetSubscriptionListAPI } from '@/api/config'
import QrcodeVue from 'qrcode.vue'
import { copyText } from '@/utils/tools'

const configDialog = ref(false)
const dialogTitle = ref('')
const configForm = reactive({
    id: 0,
    name: '',
    port: 7890,
    socks_port: 7891,
    allow_lan: 1,
    mode: 'rule',
    log_level: 'info',
    external_controller: '0.0.0.0:9090',
    usage_sub: [], // 使用指定订阅的流量统计数据
})
const submitLoading = ref(false)

const configList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableLoading = ref(false)
const subscriptionList = ref([])
const qrcodeDialog = ref(false)
const qrcodeUrl = ref('')

// 获取配置列表
const getConfigList = () => {
    tableLoading.value = true
    GetConfigListAPI({
        page: currentPage.value,
        size: pageSize.value
    }).then(res => {
        configList.value = res.data.list
        total.value = res.data.total
        tableLoading.value = false
    }).catch(() => {
        tableLoading.value = false
    })
}

// 获取订阅列表
const getSubscriptionList = () => {
    GetSubscriptionListAPI().then(res => {
        subscriptionList.value = res.data
    })
}

const handleChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
    getConfigList()
}

onMounted(() => {
    getConfigList()
    getSubscriptionList()
})

// 新增/编辑
const addConfig = () => {
    configDialog.value = true
    dialogTitle.value = '新增配置'
}
// 关闭
const handleClose = () => {
    configDialog.value = false
    configForm.id = 0
    configForm.name = ''
    configForm.port = 7890
    configForm.socks_port = 7891
    configForm.allow_lan = true
    configForm.mode = 'rule'
    configForm.log_level = 'info'
    configForm.external_controller = '0.0.0.0:9090'
    configForm.usage_sub = []
}
// 编辑
const editConfig = (row: any) => {
    configDialog.value = true
    dialogTitle.value = '编辑配置'
    configForm.id = row.id
    configForm.name = row.name
    configForm.port = row.port
    configForm.socks_port = row.socks_port
    configForm.allow_lan = row.allow_lan
    configForm.mode = row.mode
    configForm.log_level = row.log_level
    configForm.external_controller = row.external_controller
    configForm.usage_sub = row.usage_sub
}

// 删除
const deleteConfig = (id: number) => {
    ElMessageBox.confirm('确定删除该配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        DeleteConfigAPI({ id: id }).then(res => {
            if (res.code !== 1) {
                ElMessage.error(res.msg)
            } else {
                getConfigList()
            }
        })
    })
}
// 提交
const handleSubmit = () => {
    submitLoading.value = true
    SaveConfigAPI(configForm).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            configDialog.value = false
            getConfigList()
        }
        submitLoading.value = false
    }).catch(() => {
        submitLoading.value = false
    })
}

const handleCloseQrcode = () => {
    qrcodeDialog.value = false
}

const viewConfig = (row: any) => {
    qrcodeUrl.value = row.sub_link
    qrcodeDialog.value = true
}

</script>

<style lang="scss" scoped>
.qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .qrcode-item {
        margin-bottom: 10px;
    }

    .qrcode-url {
        width: 100%;
        text-align: center;

        .qrcode-url-text {
            cursor: pointer;
        }
    }

    .qrcode-url-text {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
    }
}
</style>