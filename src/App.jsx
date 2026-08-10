import { useState } from 'react'
import ChatPanel from './components/ChatPanel'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import SettingsModal from './components/SettingsModal'

const QUICK_COMMANDS = [
  { label: '记录今日工作', prompt: '请帮我记录今天的工作事项' },
  { label: '今日总结', prompt: '请生成今天的工作总结' },
  { label: '本周总结', prompt: '请生成本周的工作总结' },
  { label: '本月总结', prompt: '请生成本月的工作总结' },
  { label: '本季度总结', prompt: '请生成本季度的工作总结' },
  { label: '本年度总结', prompt: '请生成本年度的工作总结' },
]

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是 BOE 成长智能体 🎯\n\n我可以帮你：\n• **记录每日工作** — 告诉我今天做了什么\n• **生成工作总结** — 按日/周/月/季度/年度输出\n• **追踪成长轨迹** — 识别亮点与进步\n\n请问今天想记录什么工作内容？'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleSend = async (text) => {
    const content = text || input.trim()
    if (!content || isLoading) return

    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Read API config from localStorage
    let apiConfig = {}
    try {
      const stored = localStorage.getItem('boe_agent_api_config')
      if (stored) apiConfig = JSON.parse(stored)
    } catch {}

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          apiConfig
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || '抱歉，处理请求时出错。'
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '网络错误，请检查后重试。'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar quickCommands={QUICK_COMMANDS} onSend={handleSend} />
      <div className="flex-1 flex flex-col">
        <Header onSettingsClick={() => setSettingsOpen(true)} />
        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          quickCommands={QUICK_COMMANDS}
        />
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
