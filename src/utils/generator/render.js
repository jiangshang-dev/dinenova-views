import { h, resolveComponent } from 'vue'
import { makeMap } from '@/utils/index'

const isAttr = makeMap(
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,'
  + 'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,'
  + 'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,'
  + 'name,contenteditable,contextmenu,controls,coords,data,datetime,default,'
  + 'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,'
  + 'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,'
  + 'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,'
  + 'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,'
  + 'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,'
  + 'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,'
  + 'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,'
  + 'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,'
  + 'target,title,type,usemap,value,width,wrap'
)

function comp(name, props, children) {
  return h(resolveComponent(name), props, children)
}

function vModel(self, props, defaultValue) {
  props.modelValue = defaultValue
  props['onUpdate:modelValue'] = val => {
    self.$emit('input', val)
    self.$emit('update:modelValue', val)
  }
}

const componentChild = {
  'el-button': {
    default(conf, key) {
      return conf[key]
    }
  },
  'el-input': {
    prepend(conf, key) {
      return { slot: 'prepend', node: conf[key] }
    },
    append(conf, key) {
      return { slot: 'append', node: conf[key] }
    }
  },
  'el-select': {
    options(conf) {
      return conf.options.map(item => comp('el-option', {
        label: item.label,
        value: item.value,
        disabled: item.disabled
      }))
    }
  },
  'el-radio-group': {
    options(conf) {
      return conf.options.map(item => {
        if (conf.optionType === 'button') {
          return comp('el-radio-button', { label: item.value }, () => item.label)
        }
        return comp('el-radio', { label: item.value, border: conf.border }, () => item.label)
      })
    }
  },
  'el-checkbox-group': {
    options(conf) {
      return conf.options.map(item => {
        if (conf.optionType === 'button') {
          return comp('el-checkbox-button', { label: item.value }, () => item.label)
        }
        return comp('el-checkbox', { label: item.value, border: conf.border }, () => item.label)
      })
    }
  },
  'el-upload': {
    'list-type'(conf) {
      const nodes = []
      if (conf['list-type'] === 'picture-card') {
        nodes.push(h('i', { class: 'el-icon-plus' }))
      } else {
        nodes.push(comp('el-button', { size: 'small', type: 'primary', icon: 'el-icon-upload' }, () => conf.buttonText))
      }
      const slots = { default: () => nodes }
      if (conf.showTip) {
        slots.tip = () => h('div', { class: 'el-upload__tip' }, `只能上传不超过 ${conf.fileSize}${conf.sizeUnit} 的${conf.accept}文件`)
      }
      return { slots }
    }
  }
}

export default {
  props: ['conf'],
  render() {
    const props = {}
    const slots = {}
    const confClone = JSON.parse(JSON.stringify(this.conf))
    const childObjs = componentChild[confClone.tag]
    if (childObjs) {
      Object.keys(childObjs).forEach(key => {
        if (!confClone[key]) return
        const result = childObjs[key](confClone, key)
        if (result && result.slots) {
          Object.assign(slots, result.slots)
        } else if (result && result.slot) {
          slots[result.slot] = () => result.node
        } else if (result != null) {
          const prev = slots.default ? slots.default() : []
          const next = Array.isArray(result) ? result : [result]
          const merged = [].concat(prev, next)
          slots.default = () => merged
        }
      })
    }
    Object.keys(confClone).forEach(key => {
      const val = confClone[key]
      if (key === 'vModel') {
        vModel(this, props, confClone.defaultValue)
      } else if (!isAttr(key)) {
        props[key] = val
      } else {
        props[key] = val
      }
    })
    return h(resolveComponent(this.conf.tag), props, slots)
  }
}
