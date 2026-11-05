// ============================================
// Pinia Store - 仓房状态管理
// ============================================
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WAREHOUSE_TOTAL } from '@/constants/warehouse';
export { WAREHOUSE_TOTAL } from '@/constants/warehouse';
/**
 * 仓房状态 Store
 * 管理当前选中的仓房 ID，跨组件共享状态
 * 仓号格式：Q01 ~ Q95
 */
export const useWarehouseStore = defineStore('warehouse', () => {
    // 当前选中仓房 ID，默认 Q01
    const currentWarehouseId = ref('Q01');
    // 仓房总数
    const totalWarehouse = ref(WAREHOUSE_TOTAL);
    /**
     * 设置当前选中仓房 ID
     * @param id 仓房编号（必须以 Q 开头）
     */
    function setCurrentId(id) {
        if (/^Q\d{2}$/.test(id)) {
            currentWarehouseId.value = id;
        }
        else {
            console.warn(`[warehouseStore] 无效的仓房编号: ${id}`);
        }
    }
    /**
     * 切换到下一个仓房
     */
    function nextWarehouse() {
        const currentNum = parseInt(currentWarehouseId.value.replace('Q', ''), 10);
        const nextNum = currentNum >= WAREHOUSE_TOTAL ? 1 : currentNum + 1;
        currentWarehouseId.value = `Q${String(nextNum).padStart(2, '0')}`;
    }
    /**
     * 切换到上一个仓房
     */
    function prevWarehouse() {
        const currentNum = parseInt(currentWarehouseId.value.replace('Q', ''), 10);
        const prevNum = currentNum <= 1 ? WAREHOUSE_TOTAL : currentNum - 1;
        currentWarehouseId.value = `Q${String(prevNum).padStart(2, '0')}`;
    }
    return {
        currentWarehouseId,
        totalWarehouse,
        setCurrentId,
        nextWarehouse,
        prevWarehouse,
    };
});
