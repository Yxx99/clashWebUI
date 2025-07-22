import { ElLoading } from 'element-plus'
import useClipboard from 'vue-clipboard3'

export const loadingService = (target = '.main-content', text = '加载中...') => {
  return ElLoading.service({
    lock: true,
    text: text,
    background: 'rgba(0, 0, 0, 0.5)',
    target: target,
    fullscreen: false,
  })
}

export const copyText = (text: string) => {
  const { toClipboard } = useClipboard()
  toClipboard(text)
    .then(() => {
      ElMessage.success('复制成功')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
