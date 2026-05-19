import React from 'react';
export const Card = React.memo(function Card({ children, className = '', ...props }) { return <section className={`card ${className}`} {...props}>{children}</section>; });
export const Button = React.memo(function Button({ children, variant = 'primary', className = '', ...props }) { return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>; });
export const Badge = React.memo(function Badge({ children, tone = 'orange' }) { return <span className={`badge badge-${tone}`}>{children}</span>; });
export const Field = React.memo(function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; });
export const NumberInput = React.memo(function NumberInput({ value, onChange, min = 0, ...props }) { return <input className="input" type="number" min={min} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props} />; });
export const MiniDato = React.memo(function MiniDato({ label, value, highlight }) { return <div className={`mini-dato ${highlight ? 'mini-highlight' : ''}`}><span>{label}</span><strong>{value}</strong></div>; });
