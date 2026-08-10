import { useState, useEffect } from 'react'
import { X, Save, Check, AlertCircle } from 'lucide-react'

const DEFAULTS = {
  apiBase: 'https://api.coze.cn',
  apiToken: '',
  botId: '',
}

export default function SettingsModal({ open, onClose }) {
  const [form, setForm] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('boe_agent_api_config')
      if (stored) {
        try { setForm({ ...DEFAULTS, ...JSON.parse(stored) }) } catch {}
      }
      setSaved(false)
    }
  }, [open])

  const handleSave = () => {
    localStorage.setItem('boe_agent_api_config', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('boe_agent_api_config')
    setForm(DEFAULTS)
    setSaved(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[480px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">API 配置</h2>
            <p className="text-xs text-gray-500 mt-0.5">填入 Coze 接口地址与密钥，连接你的智能体</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <Field
            label="API 地址"
            value={form.apiBase}
            onChange={v => setForm(p => ({ ...p, apiBase: v }))}
            placeholder="https://api.coze.cn"
            hint="Coze 国内站填 https://api.coze.cn，海外站填 https://api.coze.com"
          />
          <Field
            label="API Token"
            value={form.apiToken}
            onChange={v => setForm(p => ({ ...p, apiToken: v }))}
            placeholder="pat_xxxxxxxxxxxxxxxxxxxx"
            type="password"
            hint="在 Coze 开放平台 → 个人令牌 中获取"
          />
          <Field
            label="Bot ID"
            value={form.botId}
            onChange={v => setForm(p => ({ ...p, botId: v }))}
            placeholder="7xxxxxxxxxxxxxxxxx"
            hint="智能体设置页面的 Bot ID"
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              配置保存在浏览器本地存储中，不会上传至任何第三方服务器。
              未填写时将使用内置 Demo 模式运行。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            清除配置
          </button>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3.5 h-3.5" /> 已保存
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#005BAC] text-white text-sm font-medium rounded-lg hover:bg-[#003D7A] transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> 保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
