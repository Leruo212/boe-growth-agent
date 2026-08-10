import { Bot, Settings } from 'lucide-react'

export default function Header({ onSettingsClick }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3 shrink-0">
      <div className="w-8 h-8 bg-[#005BAC] rounded-lg flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-sm font-semibold text-gray-900 leading-tight">BOE 成长智能体</h1>
        <p className="text-xs text-gray-500">工作记录 · 总结分析 · 成长追踪</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-400">在线</span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <button
          onClick={onSettingsClick}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center ml-2 transition-colors"
          title="API 配置"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  )
}
