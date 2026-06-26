// ════════════════════════════════════════════════════════════
//  华光国瓷 · 内容创作助手 — 后端代理服务器（5 模型版）
//  通过环境变量 PROVIDER 切换服务商：
//    qwen      → 阿里通义千问 VL（默认，能看图，国内稳定，有免费额度）
//    doubao    → 字节豆包 Vision（能看图，视觉强；个人需企业认证或中转）
//    kimi      → 月之暗面 Kimi k2.5（能看图，中文文采强，擅长长文）
//    deepseek  → DeepSeek（最便宜，但不能看图）
//    anthropic → Claude（能看图，质量最高，海外）
// ════════════════════════════════════════════════════════════

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PROVIDER = (process.env.PROVIDER || "qwen").toLowerCase();

// 各服务商配置（端点、模型、是否支持图片）
const PROVIDERS = {
  qwen: {
    key: process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY,
    model: process.env.QWEN_MODEL || "qwen-vl-plus",
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    vision: true, format: "openai"
  },
  doubao: {
    key: process.env.DOUBAO_API_KEY || process.env.ARK_API_KEY,
    // 豆包需在火山引擎控制台填入具体的接入点/模型ID，如 doubao-seed-1-6-vision 或你的 endpoint id
    model: process.env.DOUBAO_MODEL || "doubao-seed-1-6-vision",
    url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    vision: true, format: "openai"
  },
  kimi: {
    key: process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY,
    // k2.5 及以上、或 moonshot-v1-*-vision 才支持图片
    model: process.env.KIMI_MODEL || "kimi-k2.5",
    url: "https://api.moonshot.cn/v1/chat/completions",
    vision: true, format: "openai"
  },
  deepseek: {
    key: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    url: "https://api.deepseek.com/chat/completions",
    vision: false, format: "openai"
  },
  anthropic: {
    key: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    url: "https://api.anthropic.com/v1/messages",
    vision: true, format: "anthropic"
  }
};

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, imageBase64, imageType } = req.body;
    const cfg = PROVIDERS[PROVIDER] || PROVIDERS.qwen;

    if (!cfg.key) {
      return res.status(500).json({ error: `服务器未配置 ${PROVIDER} 的 API Key，请联系管理员。` });
    }

    // ───── Anthropic 格式 ─────
    if (cfg.format === "anthropic") {
      const content = imageBase64
        ? [
            { type: "image", source: { type: "base64", media_type: imageType || "image/jpeg", data: imageBase64 } },
            { type: "text", text: prompt }
          ]
        : prompt;

      const r = await fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: cfg.model, max_tokens: 8000, messages: [{ role: "user", content }] })
      });
      if (!r.ok) { const e = await r.text(); console.error("API error:", r.status, e); return res.status(r.status).json({ error: "AI 接口调用失败：" + r.status }); }
      const data = await r.json();
      return res.json({ text: (data.content || []).map(i => i.text || "").join("\n") });
    }

    // ───── OpenAI 兼容格式（qwen / doubao / kimi / deepseek）─────
    let userContent;
    if (imageBase64 && cfg.vision) {
      // 支持图片的模型：用多模态数组格式
      userContent = [
        { type: "image_url", image_url: { url: `data:${imageType || "image/jpeg"};base64,${imageBase64}` } },
        { type: "text", text: prompt }
      ];
    } else if (imageBase64 && !cfg.vision) {
      // 不支持图片的模型（deepseek）：退化为纯文本 + 提示
      userContent = prompt + "\n\n（注意：当前模型无法识别图片，请主要依据上方文字关键词进行创作。）";
    } else {
      userContent = prompt;
    }

    const r = await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cfg.key}` },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 8000,
        messages: [{ role: "user", content: userContent }]
      })
    });
    if (!r.ok) { const e = await r.text(); console.error("API error:", r.status, e); return res.status(r.status).json({ error: "AI 接口调用失败：" + r.status }); }
    const data = await r.json();
    return res.json({ text: data.choices?.[0]?.message?.content || "" });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "生成失败：" + err.message });
  }
});

app.get("/api/health", (req, res) => {
  const cfg = PROVIDERS[PROVIDER] || PROVIDERS.qwen;
  res.json({ ok: true, provider: PROVIDER, model: cfg.model, vision: cfg.vision, hasKey: !!cfg.key });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const cfg = PROVIDERS[PROVIDER] || PROVIDERS.qwen;
  console.log(`华光国瓷内容助手已启动： http://localhost:${PORT}`);
  console.log(`当前服务商： ${PROVIDER}（${cfg.model}）`);
  console.log(`是否支持看图： ${cfg.vision ? "是" : "否"}`);
  console.log(`API Key 状态： ${cfg.key ? "已配置 ✓" : "未配置 ✗（请设置对应环境变量）"}`);
});
