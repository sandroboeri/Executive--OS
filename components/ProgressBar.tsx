type ProgressBarProps = { value: number };
export function ProgressBar({ value }: ProgressBarProps) { return <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950 transition-all duration-300" style={{ width: `${value}%` }} /></div>; }
