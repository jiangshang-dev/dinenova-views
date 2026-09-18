<script>
import { h, resolveComponent } from 'vue'
import draggable from 'vuedraggable'
import Render from '@/utils/generator/render'

const layouts = {
  colFormItem(element, index, parent) {
    const activeItem = this.$attrs.onActiveItem
    let className = this.activeId === element.formId ? 'drawing-item active-from-item' : 'drawing-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    return h(resolveComponent('el-col'), {
      span: element.span,
      class: className,
      onClick: event => {
        activeItem(element)
        event.stopPropagation()
      }
    }, () => [
      h(resolveComponent('el-form-item'), {
        labelWidth: element.labelWidth ? `${element.labelWidth}px` : null,
        label: element.label,
        required: element.required
      }, () => h(Render, {
        key: element.renderKey,
        conf: element,
        onInput: event => {
          element.defaultValue = event
        }
      })),
      ...itemBtns.call(this, element, index, parent)
    ])
  },
  rowFormItem(element, index, parent) {
    const activeItem = this.$attrs.onActiveItem
    const className = this.activeId === element.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item'
    const child = h(draggable, {
      list: element.children,
      itemKey: 'renderKey',
      animation: 340,
      group: 'componentsGroup',
      class: 'drag-wrapper'
    }, {
      item: ({ element: el, index: i }) => {
        const layout = layouts[el.layout]
        return layout ? layout.call(this, el, i, element.children) : null
      }
    })
    const rowChild = element.type === 'flex'
      ? h(resolveComponent('el-row'), { type: element.type, justify: element.justify, align: element.align }, () => child)
      : child
    return h(resolveComponent('el-col'), { span: element.span }, () => [
      h(resolveComponent('el-row'), {
        gutter: element.gutter,
        class: className,
        onClick: event => {
          activeItem(element)
          event.stopPropagation()
        }
      }, () => [
        h('span', { class: 'component-name' }, element.componentName),
        rowChild,
        ...itemBtns.call(this, element, index, parent)
      ])
    ])
  }
}

function itemBtns(element, index, parent) {
  const copyItem = this.$attrs.onCopyItem
  const deleteItem = this.$attrs.onDeleteItem
  return [
    h('span', {
      class: 'drawing-item-copy',
      title: '复制',
      onClick: event => {
        copyItem(element, parent)
        event.stopPropagation()
      }
    }, [h('i', { class: 'el-icon-copy-document' })]),
    h('span', {
      class: 'drawing-item-delete',
      title: '删除',
      onClick: event => {
        deleteItem(index, parent)
        event.stopPropagation()
      }
    }, [h('i', { class: 'el-icon-delete' })])
  ]
}

export default {
  components: {
    Render,
    draggable
  },
  inheritAttrs: false,
  props: [
    'element',
    'index',
    'drawingList',
    'activeId',
    'formConf'
  ],
  render() {
    const layout = layouts[this.element.layout]
    if (layout) {
      return layout.call(this, this.element, this.index, this.drawingList)
    }
    throw new Error(`没有与${this.element.layout}匹配的layout`)
  }
}
</script>
