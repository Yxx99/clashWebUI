<template>
    <el-card>
        <el-form inline>
            <el-form-item label="订阅" style="width: 300px;">
                <el-select v-model="subId" placeholder="请选择订阅">
                    <el-option v-for="item in subList" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="select">查询</el-button>
                <el-button type="primary" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="proxies-list">
            <el-button type="primary" @click="addProxy" style="margin-bottom: 10px;">新增</el-button>
            <el-table :data="proxyList" style="width: 100%" v-loading="tableLoading">
                <el-table-column prop="id" label="ID" width="100"></el-table-column>
                <el-table-column prop="name" label="名称" width="400"></el-table-column>
                <el-table-column prop="sub_id" label="订阅" width="200">
                    <template #default="scope">
                        <span>{{ scope.row.sub?.title || '自定义代理' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100"></el-table-column>
                <el-table-column prop="config" label="配置" min-width="200" show-overflow-tooltip>
                    <template #default="scope">
                        <div class="config-content">
                            <span>{{ scope.row.config }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                            :loading="switchLoading" @change="changeStatus(scope.row.id, scope.row.status)"
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" size="small" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template #default="scope">
                        <div style="display: flex; gap: 10px;">
                            <el-link type="primary" @click="editProxy(scope.row)" size="small"
                                underline="never">编辑</el-link>
                            <el-link type="danger" @click="deleteProxy(scope.row.id)" size="small"
                                underline="never">删除</el-link>
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

    <el-dialog v-model="proxyDialog" :title="dialogTitle" width="500px" @close="handleClose">
        <el-form :model="proxyForm" label-width="100px">
            <el-form-item label="名称">
                <el-input v-model="proxyForm.name" />
            </el-form-item>
            <el-form-item label="订阅">
                <el-select v-model="proxyForm.sub_id" placeholder="请选择订阅">
                    <el-option v-for="item in subList" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="协议">
                <el-select v-model="proxyForm.protocol" placeholder="请选择协议">
                    <el-option label="Shadowsocks" value="Shadowsocks" />
                    <el-option label="VMess" value="VMess" />
                    <el-option label="HTTP" value="HTTP" />
                    <el-option label="SOCKS5" value="SOCKS5" />
                    <el-option label="VLESS" value="VLESS" />
                    <el-option label="Trojan" value="Trojan" />
                    <el-option label="ShadowsocksR" value="ShadowsocksR" />
                </el-select>
            </el-form-item>
            <el-form-item label="类型">
                <el-input v-model="proxyForm.type" disabled />
            </el-form-item>
            <el-form-item label="配置">
                <el-input v-model="proxyForm.config" type="textarea" :rows="10" />
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
import { GetSubListAPI, GetProxyListAPI, ChangeProxyStatusAPI, EditProxyAPI, DeleteProxyAPI } from '@/api/clash'

onMounted(() => {
    getSubList()
    getProxyList()
})

const tableLoading = ref(false)
const switchLoading = ref(false)
const submitLoading = ref(false)
const subList = ref([])
const proxyList = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const proxyDialog = ref(false)
const dialogTitle = ref('')
const proxyForm = reactive({
    id: 0,
    name: '',
    sub_id: null,
    protocol: 'Shadowsocks',
    type: 'ss',
    config: '',
})

// 监听proxyForm.protocol，如果为Shadowsocks，则proxyForm.type为ss，如果为ShadowsocksR，则proxyForm.type为ssr，如果为VMess，则proxyForm.type为vmess，如果为VLESS，则proxyForm.type为vless，如果为Trojan，则proxyForm.type为trojan，如果为HTTP，则proxyForm.type为http，如果为SOCKS5，则proxyForm.type为socks
watch(() => proxyForm.protocol, (newVal, oldVal) => {
    if (newVal === 'Shadowsocks') {
        proxyForm.type = 'ss'
    }
    if (newVal === 'ShadowsocksR') {
        proxyForm.type = 'ssr'
    }
    if (newVal === 'VMess') {
        proxyForm.type = 'vmess'
    }
    if (newVal === 'VLESS') {
        proxyForm.type = 'vless'
    }
    if (newVal === 'Trojan') {
        proxyForm.type = 'trojan'
    }
    if (newVal === 'HTTP') {
        proxyForm.type = 'http'
    }
    if (newVal === 'SOCKS5') {
        proxyForm.type = 'socks'
    }
})

// 获取订阅列表
const getSubList = () => {
    GetSubListAPI().then(res => {
        subList.value = res.data
    })
}

const subId = ref(null)

// 查询代理
const select = () => {
    getProxyList()
}

// 重置
const reset = () => {
    subId.value = null
    select()
}

// 获取代理列表
const getProxyList = () => {
    tableLoading.value = true
    GetProxyListAPI({ sub_id: subId.value, page: currentPage.value, size: pageSize.value }).then(res => {
        proxyList.value = res.data.list
        total.value = res.data.total
        tableLoading.value = false
    }).catch(() => {
        tableLoading.value = false
    })
}

const handleChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
    getProxyList()
}

const changeStatus = (id: number, status: number) => {
    switchLoading.value = true
    ChangeProxyStatusAPI({ id: id, status: status }).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        }
        switchLoading.value = false
    }).catch(() => {
        switchLoading.value = false
    })
}

const addProxy = () => {
    dialogTitle.value = '新增代理'
    proxyForm.id = 0
    proxyForm.name = ''
    proxyForm.sub_id = null
    proxyForm.protocol = 'Shadowsocks'
    proxyForm.type = 'ss'
    proxyForm.config = ''
    proxyDialog.value = true
}

const editProxy = (row: any) => {
    dialogTitle.value = '编辑代理'
    proxyForm.id = row.id
    proxyForm.name = row.name
    proxyForm.sub_id = row.sub_id
    proxyForm.protocol = row.protocol
    proxyForm.type = row.type
    proxyForm.config = JSON.stringify(row.config, null, 2)
    proxyDialog.value = true
}

const handleClose = () => {
    proxyForm.id = 0
    proxyForm.name = ''
    proxyForm.sub_id = null
    proxyForm.protocol = 'Shadowsocks'
    proxyForm.type = 'ss'
    proxyForm.config = ''
    proxyDialog.value = false
}

const handleSubmit = () => {
    // 将proxyForm复制一份
    const form = JSON.parse(JSON.stringify(proxyForm))
    form.config = JSON.parse(form.config)
    submitLoading.value = true
    EditProxyAPI(form).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            ElMessage.success(res.msg)
        }
        handleClose()
        getProxyList()
        submitLoading.value = false
    }).catch(() => {
        submitLoading.value = false
    })
}

const deleteProxy = (id: number) => {
    ElMessageBox.confirm('确定删除该代理吗？', '提示', {
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
            getProxyList()
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

.pagination {
    margin-top: 20px;
    text-align: right;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
}
</style>