# 华光国瓷 · 内容创作智能助手

一个可以对外发布的网页应用。访客打开网址即可使用，**无需任何人登录账号、默认使用通义千问（能看图）**。

---

## 它是怎么工作的？

```
访客的浏览器  →  你的服务器（藏着 API Key）  →  通义千问 AI 接口
```

API Key 保存在服务器端，不会暴露给访客，访客也不需要自己的账号。每次生成内容产生的费用，都从你自己的 Anthropic 账户扣除。

---

## 准备工作（一次性）

本项目默认使用 **阿里通义千问 VL**（能看图、国内稳定、有大量免费额度）。

### 1. 获取通义千问 API Key
- 打开 https://bailian.console.aliyun.com （阿里云百炼平台），用阿里云账号登录
- 开通"百炼"服务（免费开通）
- 在 **API-KEY** 页面创建一个新 Key，复制保存好这串 `sk-...` 密钥
  （**这是收费凭证，不要泄露给别人**）
- 新账号每个主流模型都有 **100 万免费 Token**，前期测试基本零成本

### 2. 费用预估
默认用 qwen-vl-plus 模型，价格很低，每生成一次约几分钱人民币，
免费额度用完后充值也支持微信/支付宝。想要更强可改 qwen-vl-max。

### 关于产品图片（这是选千问的关键原因）
通义千问 VL 是**多模态模型，能直接识别图片**。上传产品图后，
AI 会结合图片里的釉色、造型、纹饰来创作文案——这正是 DeepSeek 做不到的。

> 三种模型对比：
> - **qwen（默认）**：能看图，国内稳定，有免费额度 —— 推荐
> - **deepseek**：最便宜，但看不了图，上传图片无效
> - **anthropic（Claude）**：能看图，质量高，但服务器在海外、需外网、用美元

## 部署方式（任选其一）

### 方式 A：本地电脑运行（最快，自己测试用）
适合先在自己电脑上跑起来看看效果。

1. 安装 Node.js（https://nodejs.org 下载 LTS 版本，一路下一步）
2. 把本文件夹放到电脑任意位置
3. 打开终端（Mac 用"终端"，Windows 用"命令提示符"），进入本文件夹：
   ```
   cd 本文件夹路径
   ```
4. 安装依赖：
   ```
   npm install
   ```
5. 设置 API Key（把 .env.example 复制成 .env，填入你的 Key），然后启动：
   ```
   QWEN_API_KEY=你的密钥 npm start
   ```
   （Windows 用：`set QWEN_API_KEY=你的密钥 && npm start`）
6. 浏览器打开 http://localhost:3000 即可使用

> 注意：本地运行只有你自己能访问。要让别人用，需要用下面的方式 B 部署到云端。

---

### 方式 B：部署到云端，得到公开网址（推荐，给别人用）

推荐用 **Render** 或 **Railway**，都有免费额度、对新手友好、支持中文界面操作。

#### 用 Render 部署（图文步骤）
1. 把本项目上传到 GitHub（新建一个仓库，把这些文件传上去）
   - 不会用 GitHub？可以直接把整个文件夹拖进 https://github.com 新建的仓库网页上传
2. 打开 https://render.com 注册（可用 GitHub 账号直接登录）
3. 点击 **New +** → **Web Service**
4. 选择你刚上传的 GitHub 仓库
5. 配置填写：
   - **Build Command（构建命令）**：`npm install`
   - **Start Command（启动命令）**：`npm start`
6. 在 **Environment（环境变量）** 区域，添加一条：
   - Key（名称）：`QWEN_API_KEY`
   - Value（值）：你的 `sk-...` 密钥
   （可再加一条 `PROVIDER` = `qwen`，确保用通义千问）
7. 点击 **Create Web Service**，等待几分钟部署完成
8. 部署成功后，Render 会给你一个公开网址，类似 `https://huaguang-xxxx.onrender.com`
9. **把这个网址发给任何人，他们打开就能用** ✅

#### 用 Railway 部署（更简单）
1. 打开 https://railway.app 注册登录
2. **New Project** → **Deploy from GitHub repo**，选你的仓库
3. 进入项目 → **Variables**，添加 `QWEN_API_KEY` = 你的密钥
4. Railway 自动部署，在 **Settings → Networking** 点 **Generate Domain** 得到公开网址

---

## 想做成手机 App 或微信小程序？

当前是**网页版**，手机浏览器打开就能用，体验已接近 App。如果要进一步：

- **快速变 App 图标**：用手机浏览器打开网址 →「添加到主屏幕」，即可像 App 一样从桌面打开（PWA 方式，零成本）
- **微信小程序**：需要额外开发（小程序用的是另一套技术栈），并申请小程序账号、做内容备案。这一步建议找开发者协助，我可以帮你出一份对接说明文档。
- **正式上架的原生 App**：成本较高，一般在网页版验证效果后再考虑。

---

## 五个模型，一键切换

本项目内置 5 个大模型，只需改环境变量 `PROVIDER` 一行，无需改代码：

| PROVIDER 值 | 模型 | 能看图 | 特点 | 申请地址 |
|---|---|---|---|---|
| `qwen`（默认） | 通义千问 VL | ✅ | 国内稳定、免费额度多 | bailian.console.aliyun.com |
| `doubao` | 豆包 Vision | ✅ | 视觉最强；个人需企业认证 | console.volcengine.com/ark |
| `kimi` | Kimi k2.5 | ✅ | 中文文采强、擅长长文 | platform.moonshot.cn |
| `deepseek` | DeepSeek | ❌ | 最便宜，但看不了图 | platform.deepseek.com |
| `anthropic` | Claude | ✅ | 质量最高，需外网用美元 | console.anthropic.com |

切换方法：在部署平台的环境变量里设置 `PROVIDER=对应值`，并填好该模型的 API Key
（变量名见 .env.example）。建议先用各家的免费额度，同一张图、同一组人群分别生成，
对比文案质量后选最对味的那个。

各模型注意事项：
- **豆包**：个人开发者在火山引擎正式商用需企业认证，且 DOUBAO_MODEL 要填你在
  控制台开通的视觉接入点 ID。如果个人不方便认证，建议先用 qwen 或 kimi。
- **Kimi**：必须用 kimi-k2.5 及以上或 moonshot-v1-*-vision 型号才能看图，
  普通文本型号发图片会报错。
- **DeepSeek**：纯文本，上传图片无效（会自动退化为按文字关键词创作）。

## 文件说明
- `server.js` — 后端代理服务器（保管 API Key、转发请求）
- `public/index.html` — 前端界面（访客看到的页面）
- `package.json` — 项目依赖配置
- `.env.example` — API Key 配置模板

---

## 常见问题

**Q：访客需要付费或登录吗？**
不需要。访客只是打开网页，所有 AI 费用从你的 Anthropic 账户扣。

**Q：会不会被人滥用刷爆我的费用？**
公开网址理论上谁拿到都能用。建议：① 在阿里云百炼后台设置消费上限；② 国产模型本身便宜、且有免费额度，风险较低；③ 如担心滥用，可加一个简单的访问密码（需要可以让 AI 帮你加）。

**Q：内容质量不满意怎么调？**
品牌知识库、人群标签、内容模板都写在代码里（server.js 顶部 + index.html 的 BRAND/DIMS/CTS 部分），可以直接改文字。需要我帮忙调整告诉我即可。
