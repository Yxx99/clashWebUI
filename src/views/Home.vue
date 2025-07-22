<template>
    <el-card>
        <h2 class="welcome-title">欢迎使用 Clash 管理面板</h2>
        <p class="welcome-desc">这是一个功能强大的 Clash 代理管理系统</p>

        <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.sub_count }}</div>
                    <div class="stat-label">订阅数量</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <div class="stat-number">{{ stats.sub_active }}</div>
                    <div class="stat-label">活跃订阅</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <div class="stat-number">{{ stats.proxy_count }}</div>
                    <div class="stat-label">代理数量</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                    <div class="stat-number">{{ stats.rule_count }}</div>
                    <div class="stat-label">规则数量</div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 30px;">
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <span>快速操作</span>
                    </template>
                    <el-space wrap>
                        <el-button type="primary" @click="quickAction('start')">
                            <el-icon><Video-Play /></el-icon>启动服务
                        </el-button>
                        <el-button type="warning" @click="quickAction('restart')">
                            <el-icon>
                                <Refresh />
                            </el-icon>重启服务
                        </el-button>
                        <el-button type="danger" @click="quickAction('stop')">
                            <el-icon><Video-Pause /></el-icon>停止服务
                        </el-button>
                        <el-button type="info" @click="quickAction('update')">
                            <el-icon>
                                <Download />
                            </el-icon>更新订阅
                        </el-button>
                    </el-space>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <span>系统状态</span>
                    </template>
                    <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="服务状态">
                            <el-tag :type="systemStatus.service === 'running' ? 'success' : 'danger'">
                                {{ systemStatus.service === 'running' ? '运行中' : '已停止' }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="CPU 使用率">{{ systemStatus.cpu_usage }}%</el-descriptions-item>
                        <el-descriptions-item label="内存使用率">{{ systemStatus.memory_usage }}%</el-descriptions-item>
                        <el-descriptions-item label="运行时间">{{ systemStatus.uptime }}</el-descriptions-item>
                    </el-descriptions>
                </el-card>
            </el-col>
        </el-row>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { GetSystemInfoAPI } from '@/api/home'

// 示例数据
const stats = reactive({
    sub_count: 0,
    sub_active: 0,
    proxy_count: 0,
    rule_count: 0,
})

const systemStatus = reactive({
    service: 'running', // 'running' 或 'stopped'
    cpu_usage: 0,
    memory_usage: 0,
    uptime: '0天0小时'
})

function quickAction(action: string) {
    switch (action) {
        case 'start':
            systemStatus.service = 'running'
            ElMessage.success('服务已启动')
            break
        case 'restart':
            ElMessage.info('服务正在重启...')
            setTimeout(() => {
                ElMessage.success('服务重启成功')
            }, 1000)
            break
        case 'stop':
            systemStatus.service = 'stopped'
            ElMessage.warning('服务已停止')
            break
        case 'update':
            ElMessage.info('正在更新订阅...')
            setTimeout(() => {
                ElMessage.success('订阅更新完成')
            }, 1000)
            break
    }
}

// 可选：onMounted时可请求后端接口获取数据
onMounted(() => {
    GetSystemInfoAPI().then(res => {
        console.log(res)
        stats.sub_count = res.data.stat.sub_count
        stats.sub_active = res.data.stat.sub_active
        stats.proxy_count = res.data.stat.proxy_count
        stats.rule_count = res.data.stat.rule_count

        systemStatus.service = res.data.system_status.service
        systemStatus.cpu_usage = res.data.system_status.cpu_usage
        systemStatus.memory_usage = res.data.system_status.memory_usage
        systemStatus.uptime = res.data.system_status.uptime
    })
})
</script>

<style lang="scss" scoped>
.welcome-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
}

.welcome-desc {
    text-align: center;
    color: #888;
    margin-bottom: 32px;
}

.stats-row {
    margin-bottom: 32px;
}

.stat-card {
    background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
    border-radius: 10px;
    padding: 24px 0;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.stat-number {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
}

.stat-label {
    margin-top: 8px;
    color: #666;
    font-size: 1rem;
}
</style>