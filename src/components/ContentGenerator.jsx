import { useState, useEffect } from 'react'
import { validateSheetConfig } from '../lib/validators'

export default function ContentGenerator({ project, sheets, goBack }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(10)
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [estimatedCost, setEstimatedCost] = useState(0)

  useEffect(() => {
    setEstimatedCost(calculateCostEstimate())
  }, [project.model, sheets, count])

  const calculateCostEstimate = () => {
    const PRICE_PER_TOKEN = project.model.includes('gpt-4') ? 0.06 : 0.002
    const averageTokensPerCell = 100 // Fixed variable name
    const totalCells = sheets.reduce((acc, sheet) => 
      acc + sheet.columns.length * count, 0)
    
    return (totalCells * averageTokensPerCell * PRICE_PER_TOKEN / 1000).toFixed(2)
  }

  const generatePreview = async () => {
    try {
      setLoading(true)
      setError('')
      
      validateSheetConfig(sheets)
      
      setProgress(0)
      const totalSteps = sheets[0].columns.length * 3 // 3 preview entries
      let currentStep = 0

      const updateProgress = () => {
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          sheets,
          topic,
          count: 3 // Generate 3 preview entries
        })
      })

      if (!response.ok) throw new Error('Preview generation failed')
      
      const data = await response.json()
      setPreviewData(data.preview)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalGeneration = async () => {
    try {
      setLoading(true)
      setProgress(0)
      
      const totalSteps = sheets.reduce((acc, sheet) => 
        acc + sheet.columns.length * count, 0)
      let currentStep = 0

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          sheets,
          topic,
          count
        })
      })

      if (!response.ok) throw new Error('Generation failed')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', `${project.title}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="generator">
      <button onClick={goBack}>← Back</button>
      <h2>Generate Content</h2>

      <div className="config-section">
        <label>
          Topic:
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </label>

        <label>
          Number of Entries:
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Math.min(e.target.value, 100))}
          />
        </label>
      </div>

      <div className="cost-estimate">
        <h4>Estimated Cost: ${estimatedCost}</h4>
        <small>Based on average token usage (approximate)</small>
      </div>

      {progress > 0 && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button 
        onClick={generatePreview} 
        disabled={loading || !topic}
      >
        {loading ? 'Generating...' : 'Preview Entries'}
      </button>

      {previewData && (
        <div className="preview-section">
          <h3>Preview (First 3 Entries)</h3>
          <table>
            <thead>
              <tr>
                {sheets[0].columns.map(col => (
                  <th key={col.id}>{col.header || 'Untitled'}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((entry, i) => (
                <tr key={i}>
                  {entry.map((value, j) => (
                    <td key={j}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="approval-buttons">
            <button onClick={handleFinalGeneration}>
              Approve & Generate Full List
            </button>
            <button onClick={() => setPreviewData(null)}>
              Reject & Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 