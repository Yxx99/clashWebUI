<template>
    <div class="login-bg">
        <div class="login-container">
            <el-card>
                <div class="login-title">
                    <h2>用户登录</h2>
                </div>
                <el-form :model="loginForm" class="login-form" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitLogin" :loading="loading">登录</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { LoginAPI } from '@/api/login'
import { useStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const loginForm = reactive({
    username: '',
    password: '',
})
const loading = ref(false);
// 提交登录
const submitLogin = () => {
    loading.value = true;
    LoginAPI(loginForm).then(res => {
        console.log(res);
        if (res.code === 1) {
            ElMessage.success(res.msg);
            store.login(res.data)
            router.push('/')
        } else {
            ElMessage.error(res.msg || '登录失败');
        }
    }).catch(() => { }).finally(() => {
        loading.value = false;
    });
};
</script>

<style lang="scss" scoped>
.login-bg {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    width: 400px;
    margin: 0 auto;
    border-radius: 8px;
    background-color: #fff;
}

.login-title {
    text-align: center;
    margin-bottom: 20px;
}
</style>