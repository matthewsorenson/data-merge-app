export default function SetupForm({ project, setProject, nextStep }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Project Setup</h2>
      
      <label>
        Project Title:
        <input type="text" 
          value={project.title}
          onChange={e => setProject({...project, title: e.target.value})}
          required />
      </label>

      <label>
        OpenAI API Key:
        <input type="password"
          value={project.openaiKey}
          onChange={e => setProject({...project, openaiKey: e.target.value})}
          required />
      </label>

      <label>
        Model:
        <select value={project.model} onChange={e => setProject({...project, model: e.target.value})}>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </select>
      </label>

      <label>
        Reading Level:
        <input type="text"
          value={project.readingLevel}
          onChange={e => setProject({...project, readingLevel: e.target.value})}
          required />
      </label>

      <button type="submit">Next →</button>
    </form>
  )
} 