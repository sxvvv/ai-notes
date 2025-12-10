import { Calendar, TrendingUp } from 'lucide-react'
import { Note } from '../lib/supabase'

interface ContributionGraphProps {
  notes: Note[]
}

interface DayData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export function ContributionGraph({ notes }: ContributionGraphProps) {
  // 生成过去一年的日期数据
  const generateYearData = (): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    
    // 统计每天的笔记数量
    const noteCountByDate: Record<string, number> = {}
    notes.forEach(note => {
      const date = new Date(note.created_at).toISOString().split('T')[0]
      noteCountByDate[date] = (noteCountByDate[date] || 0) + 1
    })
    
    // 生成所有日期
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const count = noteCountByDate[dateStr] || 0
      
      // 计算等级（0-4）
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0) {
        if (count >= 5) level = 4
        else if (count >= 3) level = 3
        else if (count >= 2) level = 2
        else level = 1
      }
      
      days.push({ date: dateStr, count, level })
    }
    
    return days
  }

  const yearData = generateYearData()
  
  // 计算统计信息
  const totalDays = yearData.length
  const activeDays = yearData.filter(d => d.count > 0).length
  const totalNotes = yearData.reduce((sum, d) => sum + d.count, 0)
  const maxCount = Math.max(...yearData.map(d => d.count), 0)
  const currentStreak = calculateCurrentStreak(yearData)
  const longestStreak = calculateLongestStreak(yearData)

  // 获取等级对应的颜色
  const getLevelColor = (level: number): string => {
    const colors = [
      '#161b22', // 0 - 无记录
      '#0e4429', // 1 - 1条
      '#006d32', // 2 - 2条
      '#26a641', // 3 - 3-4条
      '#39d353', // 4 - 5条以上
    ]
    return colors[level] || colors[0]
  }

  // 按周组织数据（53周）
  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []
  
  // 找到第一个周一的索引
  let firstMondayIndex = 0
  for (let i = 0; i < yearData.length; i++) {
    const date = new Date(yearData[i].date)
    if (date.getDay() === 1) { // Monday
      firstMondayIndex = i
      break
    }
  }
  
  // 添加第一周（可能不完整）
  if (firstMondayIndex > 0) {
    weeks.push(yearData.slice(0, firstMondayIndex))
  }
  
  // 按周组织剩余数据
  for (let i = firstMondayIndex; i < yearData.length; i += 7) {
    weeks.push(yearData.slice(i, i + 7))
  }

  // 计算连续记录天数
  function calculateCurrentStreak(data: DayData[]): number {
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].date > today) continue
      if (data[i].count > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  function calculateLongestStreak(data: DayData[]): number {
    let maxStreak = 0
    let currentStreak = 0
    
    data.forEach(day => {
      if (day.count > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })
    
    return maxStreak
  }

  return (
    <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-6 border border-border-subtle">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-accent-primary" />
        <h2 className="text-xl font-semibold text-text-primary">学习记录</h2>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{totalNotes}</div>
          <div className="text-xs text-text-muted mt-1">总记录数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{activeDays}</div>
          <div className="text-xs text-text-muted mt-1">活跃天数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-primary">{currentStreak}</div>
          <div className="text-xs text-text-muted mt-1">当前连续</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{longestStreak}</div>
          <div className="text-xs text-text-muted mt-1">最长连续</div>
        </div>
      </div>

      {/* 贡献表 */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 mb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const date = new Date(day.date)
                const isToday = day.date === new Date().toISOString().split('T')[0]
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-accent-primary/50 cursor-pointer ${
                      isToday ? 'ring-2 ring-accent-primary' : ''
                    }`}
                    style={{ backgroundColor: getLevelColor(day.level) }}
                    title={`${day.date}: ${day.count} 条记录`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>少</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getLevelColor(level) }}
              />
            ))}
          </div>
          <span>多</span>
        </div>
        <div className="text-xs text-text-muted">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          过去一年
        </div>
      </div>
    </div>
  )
}

