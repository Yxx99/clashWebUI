<template>
    <el-config-provider :locale="zhCN">
        <router-view />
    </el-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style lang="scss">
body {
    margin: 0;
    padding: 0;
}
</style>
