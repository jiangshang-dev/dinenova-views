# DineNova Views

> 多租户 SaaS 餐饮点餐 · PC 管理后台（Vue 3 + Vite + Element Plus）

<p align="center">
  <a href="https://github.com/jiangshang-dev/dinenova-views/stargazers"><img src="https://img.shields.io/github/stars/jiangshang-dev/dinenova-views?style=for-the-badge&logo=github" alt="Stars"/></a>
  <a href="https://github.com/jiangshang-dev/dinenova-views/network/members"><img src="https://img.shields.io/github/forks/jiangshang-dev/dinenova-views?style=for-the-badge" alt="Forks"/></a>
  <img src="https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vue.js" alt="Vue"/>
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Element%20Plus-2-409eff?style=for-the-badge&logo=element" alt="Element Plus"/>
  <img src="https://img.shields.io/badge/SaaS-Admin-purple?style=for-the-badge" alt="SaaS"/>
</p>

<p align="center">
  <a href="https://github.com/jiangshang-dev/dinenova">后端 API</a> ·
  <b>PC 管理后台（本仓库）</b> ·
  <a href="https://github.com/jiangshang-dev/dinenova-uniapp">顾客端 UniApp</a> ·
  <a href="https://github.com/jiangshang-dev/dinenova-admin-uniapp">商家端 UniApp</a>
</p>

---

## ⭐ 开源约定（请先读）

本仓库遵循开源精神，代码可自由学习与二次开发。

同时请遵守一条**君子协议**：

> **请先给本仓库点一个 Star，再执行 Clone。**  
> 未 Star 禁止 Clone（开源江湖规矩，不做技术校验，全靠人品）。

点 Star 是对作者最大的鼓励。建议四个仓库一起点：

| 仓库 | 说明 | Star |
|------|------|------|
| [dinenova](https://github.com/jiangshang-dev/dinenova) | 后端 API | [![Star](https://img.shields.io/github/stars/jiangshang-dev/dinenova?style=social)](https://github.com/jiangshang-dev/dinenova) |
| [dinenova-views](https://github.com/jiangshang-dev/dinenova-views) | PC 管理后台（本仓库） | [![Star](https://img.shields.io/github/stars/jiangshang-dev/dinenova-views?style=social)](https://github.com/jiangshang-dev/dinenova-views) |
| [dinenova-uniapp](https://github.com/jiangshang-dev/dinenova-uniapp) | 顾客点餐端 | [![Star](https://img.shields.io/github/stars/jiangshang-dev/dinenova-uniapp?style=social)](https://github.com/jiangshang-dev/dinenova-uniapp) |
| [dinenova-admin-uniapp](https://github.com/jiangshang-dev/dinenova-admin-uniapp) | 商家管理端 | [![Star](https://img.shields.io/github/stars/jiangshang-dev/dinenova-admin-uniapp?style=social)](https://github.com/jiangshang-dev/dinenova-admin-uniapp) |

```bash
# 正确姿势：浏览器点亮 Star → 再拉代码
git clone https://github.com/jiangshang-dev/dinenova-views.git
```

---

## 项目简介

本仓库是 **DineNova SaaS 点餐系统** 的 PC 管理端，面向平台运营与商户后台人员，用于管理商户、门店、菜品、订单、会员、营销与系统配置。需配合 [dinenova](https://github.com/jiangshang-dev/dinenova) 后端使用。

### 技术栈

| 项 | 说明 |
|----|------|
| 框架 | Vue 3.5 · Vue Router 4 · Vuex 4 |
| 构建 | Vite 6 |
| UI | Element Plus 2 |
| 图表 | ECharts |
| 请求 | Axios |

### 主要模块

- **数据看板** · **商户 / 门店** · **菜品 / 库存**  
- **订单 / 退款 / 结算** · **收银**  
- **会员 / 等级 / 积分 / 余额** · **优惠券 / 佣金**  
- **员工 / 桌台** · **短信与订阅消息**  
- **系统设置 / 权限**  

---

## 快速开始

### 环境要求

- Node.js 18+
- 已启动后端 `dinenova`（默认 `http://localhost:8082`）

### 安装与运行

```bash
cd dinenova-views

# 安装依赖（建议使用官方源或 npmmirror，不建议 cnpm）
npm install
# 或
npm install --registry=https://registry.npmmirror.com

# 启动开发服务
npm run dev
```

浏览器访问：`http://localhost:81`（以 `vite.config.js` 中 `server.port` 为准）

请确认环境变量 / 代理中的 API 地址指向后端，例如 `VUE_APP_BASE_API` → `http://127.0.0.1:8082`（以项目 `.env*` 实际配置为准）。

### 构建发布

```bash
npm run build
# 如有 stage / prod 脚本，按 package.json 选用
```

---

## 与 SaaS 后端的关系

1. 先启动 [dinenova](https://github.com/jiangshang-dev/dinenova) 并导入 SQL  
2. 在后台创建 / 查看商户，拿到 `merchantNo`  
3. 将 `merchantNo` 配置到顾客端 UniApp 的 `config.js`，即可完成「一商户一前端」的 SaaS 接入演示  

---

## License

以仓库内 `LICENSE` 为准（通常为 MIT）。  
觉得有用请 **Star**，未 Star 请勿 Clone —— 谢谢！

<p align="center">
  <sub>Part of <a href="https://github.com/jiangshang-dev/dinenova">DineNova</a> · by <a href="https://github.com/jiangshang-dev">jiangshang-dev</a></sub>
</p>
