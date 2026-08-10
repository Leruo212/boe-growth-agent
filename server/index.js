import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// .env fallback values
const ENV_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'
const ENV_API_TOKEN = process.env.COZE_API_TOKEN
const ENV_BOT_ID = process.env.COZE_BOT_ID

const SYSTEM_PROMPT = `你是 BOE（京东方）的成长智能体，帮助团队成员记录和总结工作。

## 你的功能：
1. **记录工作** - 当用户描述今天的工作时，提取关键信息并记录
2. **日报总结** - 按日期生成当日工作总结，突出亮点
3. **周报总结** - 汇总一周工作，分析时间分配和项目参与度
4. **月报/季报/年报** - 生成长周期的结构化报告

## 工作记录格式：
当用户描述工作时，请按以下格式整理并回复：
- **日期**：自动提取或确认
- **工作内容**：具体做了什么
- **成果/亮点**：产出了什么
- **所属项目**：归哪个项目
- **工时**：预估花了多久

## 总结报告格式：
- 使用清晰的标题和分点
- 突出亮点和成长点
- 给出简洁的评价和建议

## 注意：
- 用中文回复
- 语气专业但友好
- 如果信息不完整，主动询问补充
- 每次回复后提示用户可以继续记录或请求总结`

app.post('/api/chat', async (req, res) => {
  const { messages, apiConfig = {} } = req.body

  // Merge: frontend apiConfig (localStorage) overrides .env
  const apiBase = apiConfig.apiBase || ENV_API_BASE
  const apiToken = apiConfig.apiToken || ENV_API_TOKEN
  const botId = apiConfig.botId || ENV_BOT_ID

  if (!apiToken || !botId) {
    const lastMsg = messages[messages.length - 1]?.content || ''
    const reply = generateDemoReply(lastMsg, messages)
    return res.json({ reply, mode: 'demo' })
  }

  try {
    const response = await fetch(`${apiBase}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: 'web-user',
        stream: false,
        auto_save_history: true,
        additional_messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          content_type: 'text'
        }))
      })
    })

    const data = await response.json()

    if (data.code !== 0) {
      console.error('Coze API error:', data)
      return res.json({ reply: `Coze API 错误: ${data.msg || '未知错误，请检查 API 配置'}` })
    }

    const replyMsg = data.data?.messages?.find(m => m.role === 'assistant' && m.type === 'answer')
    const reply = replyMsg?.content || '收到，请继续描述你的工作内容。'

    res.json({ reply, mode: 'coze' })
  } catch (err) {
    console.error('Request failed:', err)
    res.status(500).json({ error: '服务暂时不可用，请检查 API 地址是否正确' })
  }
})

function generateDemoReply(input) {
  const lower = input.toLowerCase()

  if (lower.includes('记录') || lower.includes('今天') || lower.includes('做了')) {
    const items = input.replace(/请帮我记录|今天的工作|今天做了|记录今日工作/g, '').trim()
    if (items.length < 5) {
      return '请详细描述你今天做了哪些工作？比如：\n\n• 完成了 XX 模块的代码开发\n• 参加了 XX 项目评审会\n• 修复了 XX bug\n\n告诉我具体内容，我来帮你整理记录。'
    }
    return `已记录 ✅\n\n📋 **工作记录**\n• 内容：${items}\n• 时间：${new Date().toLocaleDateString('zh-CN')}\n\n已保存到工作日志。你可以继续描述更多工作内容，或点击左侧「今日总结」查看汇总。`
  }

  if (lower.includes('日报') || lower.includes('今日总结') || lower.includes('今日工作总结')) {
    return `📊 **今日工作总结** (${new Date().toLocaleDateString('zh-CN')})\n\n**工作事项：**\n1. [待补充今日记录]\n\n**亮点：**\n• [待识别]\n\n**建议：**\n• 继续保持记录习惯\n\n💡 提示：先告诉我今天做了什么，我来帮你生成更完整的总结。`
  }

  if (lower.includes('本周') || lower.includes('周报')) {
    return `📈 **本周工作总结**\n\n**工作量统计：**\n• 本周记录：12 条\n• 累计工时：约 40h\n• 涉及项目：3 个\n\n**主要成果：**\n• [基于本周记录生成]\n\n**成长亮点：**\n• [待识别]\n\n💡 每天坚持记录，周报会更完整。`
  }

  if (lower.includes('本月') || lower.includes('月报')) {
    return `📉 **本月工作总结**\n\n**工作量概览：**\n• 本月记录：48 条\n• 平均每日：2.4 条\n• 累计工时：约 160h\n\n**项目参与度：**\n• [基于记录统计]\n\n**成长轨迹：**\n• [待累积数据后生成]\n\n💡 建议每周做一次小结，月末汇总更高效。`
  }

  if (lower.includes('季度') || lower.includes('季报')) {
    return `📋 **本季度工作总结**\n\n**季度概览：**\n• 记录总数：待统计\n• 平均每周：待统计\n• 参与项目：待统计\n\n**核心成果：**\n• [季度维度汇总]\n\n**成长分析：**\n• 技能提升：待评估\n• 项目贡献：待评估\n\n💡 季度总结建议在季度末前两周开始整理。`
  }

  if (lower.includes('年度') || lower.includes('年报')) {
    return `🏆 **本年度工作总结**\n\n**年度概览：**\n• 全年记录：待统计\n• 参与项目：待统计\n• 成长指标：待统计\n\n**核心成就：**\n• [年度维度汇总]\n\n**未来规划：**\n• [待制定]\n\n💡 年度总结是展示个人价值的重要材料，建议提前准备。`
  }

  return `收到你的消息！我可以帮你：\n\n• **记录工作** — 告诉我今天做了什么\n• **生成总结** — 日报/周报/月报/季报/年报\n• **追踪成长** — 识别亮点和进步\n\n请问需要什么帮助？`
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
  if (!ENV_API_TOKEN) {
    console.log('⚠️  COZE_API_TOKEN 未配置，使用 Demo 模式（可通过网页端设置填入）')
  }
})
