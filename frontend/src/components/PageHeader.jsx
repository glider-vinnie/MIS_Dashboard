function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      {subtitle && (
        <p className="text-text-secondary mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  )
}

export default PageHeader
