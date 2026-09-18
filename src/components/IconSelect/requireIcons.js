const modules = import.meta.glob('../../assets/icons/svg/*.svg')

export default Object.keys(modules).map(item => item.replace(/^.*\/(.*)\.svg$/, '$1'))
