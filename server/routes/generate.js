import express from 'express'
import { Configuration, OpenAIApi } from 'openai'
import XLSX from 'xlsx'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Limit to 5 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later'
})

router.post('/generate', limiter, async (req, res) => {
  // Add validation
  if(!req.body.project?.openaiKey?.startsWith('sk-')) {
    return res.status(400).json({ error: 'Invalid API key format' })
  }
  
  const { project, sheets, topic, count } = req.body
  
  try {
    // 1. Generate content using OpenAI
    const configuration = new Configuration({
      apiKey: project.openaiKey,
    })
    
    const openai = new OpenAIApi(configuration)
    
    // 2. Build the workbook
    const workbook = XLSX.utils.book_new()
    
    for (const sheetConfig of sheets) {
      const worksheetData = []
      
      // Generate headers
      const headers = sheetConfig.columns.map(col => col.header)
      worksheetData.push(headers)
      
      // Generate content for each row
      for (let i = 0; i < count; i++) {
        const row = []
        
        for (const col of sheetConfig.columns) {
          const prompt = `Create ${col.header} for "${project.title}" about ${topic}. 
            Reading level: ${project.readingLevel}. 
            ${col.description} 
            Maximum length: ${col.maxLength} characters.`
            
          const response = await openai.createChatCompletion({
            model: project.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: col.maxLength
          })
          
          row.push(response.data.choices[0].message.content.trim())
        }
        
        worksheetData.push(row)
      }
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetConfig.name)
    }
    
    // 3. Send back the generated file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    res.setHeader('Content-Disposition', 'attachment; filename="generated-data.xlsx"')
    res.setHeader('X-Tokens-Used', totalTokens)
    res.send(buffer)
    
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: 'Generation failed' })
  }
})

// Add preview endpoint
router.post('/preview', limiter, async (req, res) => {
  try {
    const { project, sheets, topic } = req.body
    
    // Validate inputs
    if (!topic?.trim()) throw new Error('Topic is required')
    if (sheets.some(s => !s.columns.length)) throw new Error('All sheets must have columns')

    // Generate limited preview data
    const preview = await generateContent({
      project,
      sheets,
      topic,
      count: 3 // Preview 3 entries
    })

    res.json({ preview })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Helper function for content generation
async function generateContent({ project, sheets, topic, count }) {
  const configuration = new Configuration({ apiKey: project.openaiKey })
  const openai = new OpenAIApi(configuration)
  
  const allData = []
  
  // Add token tracking
  let totalTokens = 0
  
  for (const sheetConfig of sheets) {
    const worksheetData = []
    const headers = sheetConfig.columns.map(col => col.header)
    worksheetData.push(headers)

    for (let i = 0; i < count; i++) {
      const row = []
      
      for (const col of sheetConfig.columns) {
        const prompt = `Create ${col.header} for "${project.title}" about ${topic}. 
          Reading level: ${project.readingLevel}. 
          ${col.description} 
          Maximum length: ${col.maxLength} characters.`
        
        const response = await openai.createChatCompletion({
          model: project.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: col.maxLength
        })
        
        totalTokens += response.data.usage.total_tokens
        row.push(response.data.choices[0].message.content.trim())
      }
      
      worksheetData.push(row)
    }
    
    allData.push(worksheetData)
  }
  
  // Return token count with response
  return {
    preview: allData,
    tokensUsed: totalTokens
  }
}

export default router 