import { Calendar, BarChart3, TrendingUp, Target } from 'lucide-react'

export default function Sidebar({ quickCommands, onSend }) {
  const sections = [
    { title: '快捷操作', items: quickCommands },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#005BAC] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm tracking-wide">BOE</div>
            <div className="text-[11px] text-gray-500">京东方科技集团</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.title}>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">
              {sec.title}
            </div>
            {sec.items.map((item, i) => (
              <button
                key={i}
                onClick={() => onSend(item.prompt)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-[#005BAC] transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-[#00A3E0] rounded-full shrink-0"></span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="pt-3 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">
            数据看板
          </div>
          <SidebarStat icon={<Calendar className="w-4 h-4" />} label="本周记录" value="12 条" />
          <SidebarStat icon={<BarChart3 className="w-4 h-4" />} label="本月工时" value="128h" />
          <SidebarStat icon={<TrendingUp className="w-4 h-4" />} label="成长指数" value="↑ 15%" />
          <SidebarStat icon={<Target className="w-4 h-4" />} label="KPI 完成" value="--" />
        </div>
      </nav>
    </aside>
  )
}

function SidebarStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50">
      <span className="text-[#005BAC]">{icon}</span>
      <span className="text-gray-500 flex-1">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
