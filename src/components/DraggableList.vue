<template>
  <div ref="root">
    <template v-for="(element, index) in list" :key="rowKey(element, index)">
      <slot name="item" :element="element" :index="index" />
    </template>
  </div>
</template>

<script>
import Sortable from "sortablejs";

/**
 * vuedraggable 4.1 在 Vue 3.5 里会改写只读 vnode，插槽内容渲染失败。
 * 保持原来的 v-model / #item 用法，列表用 v-for 画出来，排序交给 sortablejs。
 */
export default {
  name: "DraggableList",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    itemKey: {
      type: [String, Function],
      default: undefined,
    },
    group: {
      type: [String, Object],
      default: undefined,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    list() {
      return Array.isArray(this.modelValue) ? this.modelValue : [];
    },
  },
  mounted() {
    this.sortable = Sortable.create(this.$refs.root, {
      animation: 150,
      group: {
        name: "diy-list-" + this.$.uid,
        pull: false,
        put: false,
      },
      filter:
        "input,textarea,button,select,option,a,.btn-del,.el-slider,.el-input,.el-button,.el-upload,.el-color-picker",
      preventOnFilter: false,
      onEnd: (evt) => this.onDragEnd(evt),
    });
  },
  beforeUnmount() {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }
  },
  methods: {
    rowKey(element, index) {
      if (typeof this.itemKey === "function") {
        const key = this.itemKey(element);
        return key == null ? index : key;
      }
      if (
        typeof this.itemKey === "string" &&
        element &&
        element[this.itemKey] != null
      ) {
        return element[this.itemKey];
      }
      return index;
    },
    onDragEnd(evt) {
      const { oldIndex, newIndex, item, from } = evt;
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
        return;
      }
      if (item.parentNode === from) {
        from.removeChild(item);
        const ref = from.children[oldIndex];
        if (ref) {
          from.insertBefore(item, ref);
        } else {
          from.appendChild(item);
        }
      }
      const next = this.list.slice();
      const moved = next.splice(oldIndex, 1)[0];
      next.splice(newIndex, 0, moved);
      this.$emit("update:modelValue", next);
    },
  },
};
</script>
