import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useFit(containerRef: Ref<HTMLElement | null>, boardW: Ref<number>, boardH: Ref<number>, padding = 80) {
    const scale = ref(1)
    let ro: ResizeObserver | null = null

    function measure() {
        const el = containerRef.value
        if (!el) return
        const r = el.getBoundingClientRect()
        const s = Math.min((r.width - padding) / boardW.value, (r.height - padding) / boardH.value, 1.35)
        scale.value = s > 0 ? s : 1
    }

    onMounted(() => {
        measure()
        ro = new ResizeObserver(measure)
        if (containerRef.value) ro.observe(containerRef.value)
    })

    onUnmounted(() => ro?.disconnect())

    watch(containerRef, (el, old) => {
        if (old && ro) ro.unobserve(old)
        if (el && ro) { ro.observe(el); measure() }
    })

    watch([boardW, boardH], measure)

    return { scale }
}
