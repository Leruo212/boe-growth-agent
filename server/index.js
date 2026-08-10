import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const ENV_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'
const ENV_API_TOKEN = process.env.COZE_API_TOKEN
const ENV_BOT_ID = process.env.COZE_BOT_ID

// ============================================================
// Coze v3 API 异步流程：
// 1. POST /v3/chat           → 返回 { id, conversation_id }
// 2. GET  /v3/chat/retrieve  → 轮询直到 status=completed
// 3. GET  /v3/chat/message/list → 获取 type=answer 的回复
// ============================================================

async function callCozeChat(apiBase, apiToken, botId, messages) {
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }

  // Step 1: 发起对话
  const chatRes = await fetch(`${apiBase}/v3/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      bot_id: botId,
      user_id: 'web-user-' + Date.now(),
      stream: false,
      auto_save_history: true,
      additional_messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        content_type: 'text'
      }))
    })
  })

  const chatData = await chatRes.json()
  console.log('[Coze] chat response:', JSON.stringify(chatData).slice(0, 500))

  if (chatData.code !== 0) {
    throw new Error(`Coze API error: ${chatData.msg || JSON.stringify(chatData)}`)
  }

  const conversationId = chatData.data?.conversation_id
  const chatId = chatData.data?.id

  if (!conversationId || !chatId) {
    throw new Error('Missing conversation_id or id in response')
  }

  // Step 2: 轮询等待完成（最多 60 秒）
  const retrieveUrl = `${apiBase}/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`
  let status = ''
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const retrieveRes = await fetch(retrieveUrl, { headers })
    const retrieveData = await retrieveRes.json()
    status = retrieveData.data?.status || ''
    console.log(`[Coze] poll #${i + 1}: status=${status}`)

    if (status === 'completed' || status === 'failed') break
  }

  if (status !== 'completed') {
    throw new Error(`Chat did not complete in time (status: ${status})`)
  }

  // Step 3: 获取消息列表
  const msgUrl = `${apiBase}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`
  const msgRes = await fetch(msgUrl, { headers })
  const msgData = await msgRes.json()
  console.log('[Coze] messages:', JSON.stringify(msgData).slice(0, 800))

  if (msgData.code !== 0) {
    throw new Error(`Failed to get messages: ${msgData.msg}`)
  }

  // 找到 type=answer 的 assistant 消息
  const messages2 = msgData.data || []
  const answerMsg = messages2.find(m => m.type === 'answer' && m.role === 'assistant')
  return answerMsg?.content || '收到，请继续描述你的工作内容。'
}

app.post('/api/chat', async (req, res) => {
  const { messages, apiConfig = {} } = req.body

  const apiBase = apiConfig.apiBase || ENV_API_BASE
  const apiToken = apiConfig.apiToken || ENV_API_TOKEN
  const botId = apiConfig.botId || ENV_BOT_ID

  // 无 API 配置 → Demo 模式
  if (!apiToken || !botId) {
    const lastMsg = messages[messages.length - 1]?.content || ''
    const reply = generateDemoReply(lastMsg)
    return res.json({ reply, mode: 'demo' })
  }

  try {
    console.log(`[Coze] calling with bot_id=${botId}, messages=${messages.length}`)
    const reply = await callCozeChat(apiBase, apiToken, botId, messages)
    res.json({ reply, mode: 'coze' })
  } catch (err) {
    console.error('[Coze] error:', err.message)
    res.json({
      reply: `调用 Coze API 出错：${err.message}\n\n请检查：\n1. API Token 是否正确\n2. Bot ID 是否正确\n3. 智能体是否已发布`,
      mode: 'error'
    })
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
