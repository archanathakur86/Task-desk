export default function FormField({ label, htmlFor, error, wide = false, children }) {
  return (
    <div className={`form-field${wide ? ' form-field-wide' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
