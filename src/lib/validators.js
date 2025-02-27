export function validateProject(project) {
  if(!project.title?.match(/^[\w\s-]{3,50}$/)) {
    throw new Error('Invalid project title (3-50 characters)')
  }
  if(!project.openaiKey?.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format')
  }
  if(!project.readingLevel?.match(/^\d+(th|rd|st|nd) grade$/i)) {
    throw new Error('Reading level should be like "8th grade"')
  }
  return true
}

export function validateSheetConfig(sheets) {
  // Add sheet validation logic
} 