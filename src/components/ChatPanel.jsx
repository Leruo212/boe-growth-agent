import { useRef, useEffect, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function ChatPanel({ messages, input, setInput, onSend, isLoading, quickCommands }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#005BAC] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Chips */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {quickCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSend(cmd.prompt)}
              className="px-3 py-1.5 text-xs bg-blue-50 text-[#005BAC] rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-4 pt-2">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm focus-within:border-[#005BAC] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入工作内容，或点击左侧快捷操作..."
            rows={1}
            className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 min-h-[24px] max-h-[120px]"
            style={{ lineHeight: '24px' }}
          />
          <button
            onClick={() => onSend()}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-[#005BAC] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[#003D7A] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? 'bg-gray-200' : 'bg-[#005BAC]'
      }`}>
        <span className={`text-xs font-bold ${isUser ? 'text-gray-600' : 'text-white'}`}>
          {isUser ? 'U' : 'B'}
        </span>
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? 'bg-[#005BAC] text-white rounded-tr-md'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md'
      }`}>
        <div className="text-sm whitespace-pre-wrap leading-relaxed"
             dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
        />
      </div>
    </div>
  )
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
    .replace(/^• (.*$)/gm, '<span class="block pl-2">• $1</span>')
    .replace(/^(\d+)\. (.*$)/gm, '<span class="block pl-2">$1. $2</span>')
}
