import { useState, useEffect } from 'react'
import { validateProject } from './lib/validators'
import SetupForm from './components/SetupForm'
import ColumnConfig from './components/ColumnConfig'
import ContentGenerator from './components/ContentGenerator'
import SecurityWarning from './components/SecurityWarning'

export default function App() {
  const [step, setStep] = useState(1)
  const [project, setProject] = useState(() => {
    const saved = localStorage.getItem('projectTemplate')
    return saved ? JSON.parse(saved) : {
      title: '',
      openaiKey: '',
      model: 'gpt-3.5-turbo',
      readingLevel: '8th grade'
    }
  })
  
  const [sheets, setSheets] = useState([{
    name: 'Main',
    columns: [{ id: 1, header: '', description: '', maxLength: 100 }]
  }])

  // Save templates automatically
  useEffect(() => {
    localStorage.setItem('projectTemplate', JSON.stringify(project))
  }, [project])

  return (
    <div className="container">
      <SecurityWarning />
      
      {step === 1 && <SetupForm project={project} setProject={setProject} nextStep={() => {
        if(validateProject(project)) setStep(2)
      }} />}
      {step === 2 && <ColumnConfig sheets={sheets} setSheets={setSheets} prevStep={() => setStep(1)} nextStep={() => setStep(3)} />}
      {step === 3 && <ContentGenerator project={project} sheets={sheets} goBack={() => setStep(2)} />}
    </div>
  )
} 