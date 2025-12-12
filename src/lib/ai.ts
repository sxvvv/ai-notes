// AI API 配置和调用
// Get from environment variables
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.zetatechs.com/v1/messages'
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

export interface AIRequest {
  prompt: string
  context?: string
  type?: 'formula' | 'writing' | 'general'
}

export interface AIResponse {
  content: string
  error?: string
}

// 调用 AI API
export async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    // 根据类型构建不同的系统提示
    let systemPrompt = ''
    switch (request.type) {
      case 'formula':
        systemPrompt = '你是一个数学公式助手。用户会描述一个数学公式，你需要返回对应的 LaTeX 代码。只返回 LaTeX 代码，不要包含任何解释、markdown 格式或额外的文字。如果是行内公式，直接返回公式；如果是块级公式，也直接返回公式（不需要 $$ 符号）。'
        break
      case 'writing':
        systemPrompt = '你是一个写作助手。用户会提供一段文字，你需要直接返回优化后的内容，而不是建议。直接输出优化后的文字，不要添加"建议"、"可以"等提示性语言。用中文回复，要专业、简洁。'
        break
      default:
        systemPrompt = '你是一个AI助手，帮助用户解决问题。用中文回复，要专业、友好、实用。'
    }

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-chat-free',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...(request.context ? [{
            role: 'user',
            content: `上下文：${request.context}`
          }] : []),
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 错误: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // 调试：记录 API 响应格式
    console.log('API 响应数据:', JSON.stringify(data, null, 2))
    
    // 根据 API 响应格式解析内容
    let content = ''
    
    try {
      // 辅助函数：安全地将任何值转换为字符串
      const toString = (value: any): string => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') return value
        if (typeof value === 'number' || typeof value === 'boolean') return String(value)
        if (Array.isArray(value)) {
          return value.map(toString).filter(Boolean).join('\n')
        }
        if (typeof value === 'object') {
          // 优先查找常见字段
          for (const key of ['content', 'message', 'text', 'response', 'data', 'result', 'output']) {
            if (value[key] !== undefined && value[key] !== null) {
              const result = toString(value[key])
              if (result) return result
            }
          }
          // 如果找不到，返回 JSON 字符串
          return JSON.stringify(value, null, 2)
        }
        return String(value)
      }
      
      // 尝试多种可能的响应格式
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0]
        if (choice.message) {
          content = toString(choice.message.content || choice.message.text || choice.message)
        } else if (choice.text) {
          content = toString(choice.text)
        } else if (choice.content) {
          content = toString(choice.content)
        } else {
          content = toString(choice)
        }
      } else if (data.content !== undefined) {
        content = toString(data.content)
      } else if (data.message !== undefined) {
        content = toString(data.message)
      } else if (data.text !== undefined) {
        content = toString(data.text)
      } else if (data.response !== undefined) {
        content = toString(data.response)
      } else if (data.data !== undefined) {
        content = toString(data.data)
      } else if (data.result !== undefined) {
        content = toString(data.result)
      } else if (typeof data === 'string') {
        content = data
      } else {
        // 如果都不匹配，尝试递归查找字符串内容
        console.warn('未识别的 API 响应格式，尝试提取文本:', data)
        const findStringContent = (obj: any, depth = 0): string => {
          if (depth > 5) return '' // 防止无限递归
          if (typeof obj === 'string' && obj.trim()) return obj
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const found = findStringContent(item, depth + 1)
              if (found) return found
            }
          }
          if (obj && typeof obj === 'object') {
            // 优先查找常见字段
            for (const key of ['content', 'message', 'text', 'response', 'data', 'result', 'output', 'body']) {
              if (obj[key] !== undefined) {
                const found = findStringContent(obj[key], depth + 1)
                if (found) return found
              }
            }
            // 递归查找所有值
            for (const value of Object.values(obj)) {
              const found = findStringContent(value, depth + 1)
              if (found) return found
            }
          }
          return ''
        }
        content = findStringContent(data) || JSON.stringify(data, null, 2)
      }
      
      // 最终确保 content 是字符串
      content = toString(content).trim()
      
      if (!content || content === '{}' || content === '[]') {
        throw new Error('API 返回的内容为空或无效')
      }
    } catch (parseError: any) {
      console.error('解析 API 响应时出错:', parseError, '原始数据:', data)
      throw new Error(`解析 API 响应失败: ${parseError.message || '未知错误'}`)
    }

    return { content }
  } catch (error: any) {
    console.error('AI API 调用错误:', error)
    return {
      content: '',
      error: error.message || 'AI 服务暂时不可用，请稍后重试',
    }
  }
}

// 生成公式
export async function generateFormula(description: string): Promise<AIResponse> {
  return callAI({
    prompt: `请将以下描述转换为 LaTeX 公式：${description}`,
    type: 'formula',
  })
}

// 获取写作优化（直接返回优化后的内容）
export async function getWritingSuggestion(text: string, context?: string, mode: 'improve' | 'expand' | 'summarize' | 'explain' = 'improve'): Promise<AIResponse> {
  let prompt = ''
  switch (mode) {
    case 'improve':
      prompt = `请直接优化以下文字，使其更清晰、专业、易读。直接输出优化后的内容，不要添加任何说明或建议：\n\n${text}`
      break
    case 'expand':
      prompt = `请直接扩展以下内容，添加更多细节和说明。直接输出扩展后的内容，不要添加任何说明或建议：\n\n${text}`
      break
    case 'summarize':
      prompt = `请直接总结以下内容，提取关键要点。直接输出总结后的内容，不要添加任何说明或建议：\n\n${text}`
      break
    case 'explain':
      prompt = `请直接解释以下内容，使其更容易理解。直接输出解释后的内容，不要添加任何说明或建议：\n\n${text}`
      break
  }
  
  return callAI({
    prompt,
    context,
    type: 'writing',
  })
}

// 通用 AI 对话（支持历史消息）
export async function chatWithAI(prompt: string, context?: string, history?: Array<{ role: 'user' | 'assistant', content: string }>): Promise<AIResponse> {
  // 如果有历史消息，构建完整的消息列表
  if (history && history.length > 0) {
    const messages = [
      {
        role: 'system' as const,
        content: '你是一个AI助手，帮助用户解决问题。用中文回复，要专业、友好、实用。',
      },
      ...(context ? [{
        role: 'user' as const,
        content: `上下文：${context}`
      }] : []),
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ]

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-5-chat-free',
          messages,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API 错误: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // 使用相同的解析逻辑
      const toString = (value: any): string => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') return value
        if (typeof value === 'number' || typeof value === 'boolean') return String(value)
        if (Array.isArray(value)) {
          return value.map(toString).filter(Boolean).join('\n')
        }
        if (typeof value === 'object') {
          for (const key of ['content', 'message', 'text', 'response', 'data', 'result', 'output']) {
            if (value[key] !== undefined && value[key] !== null) {
              const result = toString(value[key])
              if (result) return result
            }
          }
          return JSON.stringify(value, null, 2)
        }
        return String(value)
      }
      
      let content = ''
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0]
        if (choice.message) {
          content = toString(choice.message.content || choice.message.text || choice.message)
        } else if (choice.text) {
          content = toString(choice.text)
        } else if (choice.content) {
          content = toString(choice.content)
        } else {
          content = toString(choice)
        }
      } else if (data.content !== undefined) {
        content = toString(data.content)
      } else if (data.message !== undefined) {
        content = toString(data.message)
      } else if (data.text !== undefined) {
        content = toString(data.text)
      } else if (data.response !== undefined) {
        content = toString(data.response)
      } else if (data.data !== undefined) {
        content = toString(data.data)
      } else if (data.result !== undefined) {
        content = toString(data.result)
      } else if (typeof data === 'string') {
        content = data
      } else {
        const findStringContent = (obj: any, depth = 0): string => {
          if (depth > 5) return ''
          if (typeof obj === 'string' && obj.trim()) return obj
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const found = findStringContent(item, depth + 1)
              if (found) return found
            }
          }
          if (obj && typeof obj === 'object') {
            for (const key of ['content', 'message', 'text', 'response', 'data', 'result', 'output', 'body']) {
              if (obj[key] !== undefined) {
                const found = findStringContent(obj[key], depth + 1)
                if (found) return found
              }
            }
            for (const value of Object.values(obj)) {
              const found = findStringContent(value, depth + 1)
              if (found) return found
            }
          }
          return ''
        }
        content = findStringContent(data) || JSON.stringify(data, null, 2)
      }
      
      content = toString(content).trim()
      
      if (!content || content === '{}' || content === '[]') {
        throw new Error('API 返回的内容为空或无效')
      }

      return { content }
    } catch (error: any) {
      console.error('AI API 调用错误:', error)
      return {
        content: '',
        error: error.message || 'AI 服务暂时不可用，请稍后重试',
      }
    }
  }
  
  // 没有历史消息时使用原来的逻辑
  return callAI({
    prompt,
    context,
    type: 'general',
  })
}

