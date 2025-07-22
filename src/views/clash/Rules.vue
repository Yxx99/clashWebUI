<template>
    <el-card>
        <el-form v-model="searchForm" inline>
            <div style="margin-bottom: 10px;">按规则类型或名称搜索</div>
            <el-form-item label="规则类型" style="width: 300px;">
                <el-select v-model="searchForm.type" placeholder="请选择规则类型">
                    <el-option v-for="(item, index) in typeList" :key="index" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="规则名称" style="width: 300px;">
                <el-input v-model="searchForm.content" placeholder="请输入规则名称" />
            </el-form-item>
            <el-form-item style="width: 300px;">
                <el-button type="primary" @click="select">查询</el-button>
                <el-button type="primary" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="proxies-list">
            <el-button type="primary" @click="addRule" style="margin-bottom: 10px;">新增</el-button>
            <div class="rules-list">
                <el-card v-for="item in ruleList" :key="item.id" class="rule-card"
                    :class="{ 'rule-card-inactive': item.status === 0 }">
                    <div class="rule-content">
                        <div class="rule-header">
                            <span class="rule-name">名称 {{ item.content }}</span>
                            <span class="rule-type">类型 {{ item.type }}</span>
                        </div>
                        <div class="rule-right">
                            <div>{{ item.relate_name }}</div>
                            <div class="more-option">
                                <el-dropdown>
                                    <span class="more-option-btn">...</span>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                @click="changeStatus(item.id, item.status === 1 ? 0 : 1)">{{
                                                    item.status
                                                        === 1 ? '禁用' : '启用' }}</el-dropdown-item>
                                            <el-dropdown-item @click="editRule(item)">编辑</el-dropdown-item>
                                            <el-dropdown-item @click="deleteRule(item.id)">删除</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
            <div class="pagination">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next"
                    @change="handleChange" />
            </div>
        </div>
    </el-card>

    <el-dialog v-model="ruleDialog" :title="dialogTitle" width="500px" @close="handleClose">
        <el-form :model="ruleForm" label-width="100px">
            <el-form-item label="内容">
                <el-input v-model="ruleForm.content" placeholder="eg: google.com" />
            </el-form-item>
            <el-form-item label="类型">
                <el-select v-model="ruleForm.type" placeholder="请选择规则类型">
                    <el-option v-for="(item, index) in typeList" :key="index" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="解析">
                <el-radio-group v-model="ruleForm.resolve">
                    <el-radio label="默认" :value="1"></el-radio>
                    <el-radio label="no-resolve" :value="0"></el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="代理或策略">
                <el-radio-group v-model="currentPolicy">
                    <el-radio v-for="(item, index) in policyList" :key="index" :label="item.name" :value="index"
                        @change="changePolicy(item)" />
                </el-radio-group>
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
import { GetRuleListAPI, GetPolicyListAPI, SaveRuleAPI, ChangeRuleStatusAPI, DeleteRuleAPI } from '@/api/rule'
import { loadingService } from '@/utils/tools'

onMounted(() => {
    getRuleList()
    getPolicyList()
})

const loading = ref(null)
const submitLoading = ref(false)
const ruleList = ref([])
const currentPage = ref(1)
const pageSize = ref(60)
const total = ref(0)
const ruleDialog = ref(false)
const dialogTitle = ref('')
const policyList = ref([])
const currentPolicy = ref()
const ruleForm = reactive({
    id: 0,
    type: '',
    resolve: 1,
    policy: [],
    content: '',
})
const searchForm = reactive({
    type: '',
    content: '',
})
const typeList = [
    { label: 'DOMAIN-SUFFIX', value: 'DOMAIN-SUFFIX' },
    { label: 'DOMAIN', value: 'DOMAIN' },
    { label: 'DOMAIN-KEYWORD', value: 'DOMAIN-KEYWORD' },
    { label: 'IP-CIDR', value: 'IP-CIDR' },
    { label: 'SRC-IP-CIDR', value: 'SRC-IP-CIDR' },
    { label: 'GEOIP', value: 'GEOIP' },
    { label: 'PROCESS-NAME', value: 'PROCESS-NAME' },
    { label: 'DST-PORT', value: 'DST-PORT' },
    { label: 'SRC-PORT', value: 'SRC-PORT' },
    { label: 'MATCH', value: 'MATCH' },
]

// 查询代理
const select = () => {
    getRuleList()
}

// 重置
const reset = () => {
    searchForm.type = ''
    searchForm.content = ''
    select()
}

// 获取规则列表
const getRuleList = (isLoading = true) => {
    if (isLoading) {
        loading.value = loadingService()
    }
    GetRuleListAPI({ type: searchForm.type, content: searchForm.content, page: currentPage.value, size: pageSize.value }).then(res => {
        ruleList.value = res.data.list
        total.value = res.data.total
        if (isLoading) {
            loading.value.close()
        }
    }).catch(() => {
        if (isLoading) {
            loading.value.close()
        }
    })
}

// 获取可用的代理或策略
const getPolicyList = () => {
    GetPolicyListAPI().then(res => {
        policyList.value = res.data
    })
}

// 选择代理或策略
const changePolicy = (value) => {
    ruleForm.policy = value
}

const handleChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
    getRuleList()
}

const changeStatus = (id: number, status: number) => {
    loading.value = loadingService()
    ChangeRuleStatusAPI({ id: id, status: status }).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            ElMessage.success(res.msg)
            getRuleList(false)
        }
        loading.value.close()
    }).catch(() => {
        loading.value.close()
    })
}

const addRule = () => {
    dialogTitle.value = '新增规则'
    ruleForm.id = 0
    ruleForm.content = ''
    ruleForm.type = ''
    ruleForm.resolve = 1
    ruleForm.policy = []
    ruleDialog.value = true
}

const editRule = (row: any) => {
    dialogTitle.value = '编辑规则'
    ruleForm.id = row.id
    ruleForm.content = row.content
    ruleForm.type = row.type
    ruleForm.resolve = row.resolve
    currentPolicy.value = policyList.value.findIndex(item => item.type === row.relate_type && item.name === row.relate_name && item.rid === row.rid)
    console.log(ruleForm)
    ruleDialog.value = true
}

const handleClose = () => {
    ruleForm.id = 0
    ruleForm.content = ''
    ruleForm.type = ''
    ruleForm.resolve = 1
    ruleForm.policy = []
    ruleDialog.value = false
}

const handleSubmit = () => {
    if (ruleForm.policy.length === 0) {
        ruleForm.policy = policyList.value[currentPolicy.value]
    }
    submitLoading.value = true
    SaveRuleAPI(ruleForm).then(res => {
        if (res.code !== 1) {
            ElMessage.error(res.msg)
        } else {
            ElMessage.success(res.msg)
        }
        handleClose()
        getRuleList()
        submitLoading.value = false
    }).catch(() => {
        submitLoading.value = false
    })
}

const deleteRule = (id: number) => {
    ElMessageBox.confirm('确定删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        DeleteRuleAPI({ id: id }).then(res => {
            if (res.code !== 1) {
                ElMessage.error(res.msg)
            } else {
                ElMessage.success(res.msg)
            }
            getRuleList()
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

.rules-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
}

.rule-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 180px;
    max-width: 100%;
    width: auto;
    padding: 12px 20px;
    box-sizing: border-box;
    word-break: break-all;
    cursor: default;

    :deep(.el-card__body) {
        padding: 0;
    }


    :deep(.el-card__footer) {
        padding: 0;
    }
}

.rule-content {
    display: flex;
    flex-direction: row;
    gap: 20px;
    // align-items: flex-start;
}

.rule-header {
    display: flex;
    flex-direction: column;
    // margin-bottom: 8px;

    .rule-name {
        font-size: 16px;
        font-weight: bold;
    }

    .rule-type {
        font-size: 14px;
        color: #999;
    }
}

.rule-right {
    display: flex;
    flex-direction: column;

    .more-option {
        display: flex;
        justify-content: end;

        .more-option-btn {
            cursor: pointer;
        }
    }
}

.rule-option {
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    gap: 10px;
}


// .rule-footer {
//     display: flex;
//     flex-direction: row;
//     justify-content: space-between;

//     :deep(.el-splitter-panel) {
//         display: flex;

//         &:first-child {
//             justify-content: left;
//         }

//         &:last-child {
//             justify-content: right;
//         }
//     }

// }

.edit-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #999;
}

.rule-card-inactive {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>