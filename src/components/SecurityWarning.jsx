export default function SecurityWarning() {
  return (
    <div className="security-banner">
      <h3>🔒 Security First</h3>
      <ul>
        <li>We never store your API key</li>
        <li>All processing happens in your browser</li>
        <li>You can review code at any time</li>
        <li>Data is never sent to external servers</li>
      </ul>
    </div>
  )
} 