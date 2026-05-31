import './PageHeader.css'

interface PageHeaderProps {
  emoji: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export default function PageHeader({ emoji, title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <span className="page-header-emoji">{emoji}</span>
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </header>
  )
}
