import { useState } from 'react'

export default function ColumnConfig({ sheets, setSheets, prevStep, nextStep }) {
  const addColumn = (sheetIndex) => {
    const newSheets = [...sheets]
    newSheets[sheetIndex].columns.push({
      id: Date.now(),
      header: '',
      description: '',
      maxLength: 100
    })
    setSheets(newSheets)
  }

  const addSheet = () => {
    setSheets([...sheets, {
      name: `Sheet ${sheets.length + 1}`,
      columns: [{ id: Date.now(), header: '', description: '', maxLength: 100 }]
    }])
  }

  return (
    <div>
      <h2>Configure Columns</h2>
      
      {sheets.map((sheet, sheetIndex) => (
        <div key={sheetIndex} className="sheet-section">
          <h3>
            <input
              value={sheet.name}
              onChange={e => {
                const newSheets = [...sheets]
                newSheets[sheetIndex].name = e.target.value
                setSheets(newSheets)
              }}
            />
          </h3>
          
          {sheet.columns.map((col, colIndex) => (
            <div key={col.id} className="column-config">
              <input
                placeholder="Column Header"
                value={col.header}
                onChange={e => {
                  const newSheets = [...sheets]
                  newSheets[sheetIndex].columns[colIndex].header = e.target.value
                  setSheets(newSheets)
                }}
              />
              
              <textarea
                placeholder="Content Description"
                value={col.description}
                onChange={e => {
                  const newSheets = [...sheets]
                  newSheets[sheetIndex].columns[colIndex].description = e.target.value
                  setSheets(newSheets)
                }}
              />
              
              <input
                type="number"
                placeholder="Max Length"
                value={col.maxLength}
                onChange={e => {
                  const newSheets = [...sheets]
                  newSheets[sheetIndex].columns[colIndex].maxLength = e.target.value
                  setSheets(newSheets)
                }}
              />
              
              <button onClick={() => {
                const newSheets = [...sheets]
                newSheets[sheetIndex].columns = newSheets[sheetIndex].columns.filter((_, i) => i !== colIndex)
                setSheets(newSheets)
              }}>Remove</button>
            </div>
          ))}
          
          <button onClick={() => addColumn(sheetIndex)}>Add Column</button>
        </div>
      ))}
      
      <button onClick={addSheet}>Add Sheet</button>
      <button onClick={prevStep}>← Back</button>
      <button onClick={nextStep}>Next →</button>
    </div>
  )
} 