<template>
    <div class="about-container">
        <h1>关于本系统</h1>
        <ul class="about-list">
            <li><strong>系统名称：</strong>Clash WebUI</li>
            <li><strong>版本：</strong>1.0.0</li>
            <li><strong>简介：</strong>本系统是一个基于 Vue3 + Vite 构建的 Clash 控制面板，旨在为用户提供简洁高效的代理管理体验。</li>
            <li><strong>作者：</strong>Yxx99</li>
            <li><strong>技术栈：</strong>Vue3、Vite、TypeScript、SCSS、Element Plus</li>
            <li><strong>开源协议：</strong>MIT License</li>
            <li><strong>项目地址：</strong><a href="https://github.com/Yxx99/clashWebUI" target="_blank">GitHub</a></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
// 可根据需要添加逻辑
</script>

<style lang="scss" scoped>
.about-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 32px 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.about-list {
    list-style: none;
    padding: 0;
    margin: 24px 0 0 0;

    li {
        margin-bottom: 16px;
        font-size: 16px;
        line-height: 1.7;

        a {
            color: #42b983;
            text-decoration: underline;
        }
    }
}
</style>