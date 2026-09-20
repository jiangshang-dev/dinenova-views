<script setup>
import draggable from 'vuedraggable'
import Render from '@/utils/generator/render'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, onActivated, nextTick, toRefs } from 'vue'

defineOptions({ name: 'DraggableItem' })

const props = defineProps(['element', 'index', 'drawingList', 'activeId', 'formConf'])
</script>
