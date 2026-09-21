import { type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Badge
export function Badge({
  children,
  className = '',
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning' | 'info';
}) {
  const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors';
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

// Button
export function Button({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'whatsapp';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp/90',
  };
  const sizes: Record<string, string> = {
    default: 'h-9 px-4 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-sm',
    icon: 'h-9 w-9',
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Card
export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`text-base font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

// Input
export function Input({
  className = '',
  placeholder,
  value,
  onChange,
  type = 'text',
  id,
  required,
  step,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  id?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      step={step}
    />
  );
}

// Textarea
export function Textarea({
  className = '',
  placeholder,
  value,
  onChange,
  rows = 3,
  id,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
    />
  );
}

// Select
export function Select({
  children,
  value,
  onChange,
  className = '',
  id,
}: {
  children: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

// Toast
export function ToastContainer({ toasts, removeToast }: { toasts: Array<{ id: string; message: string; type: string }>; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const icons: Record<string, ReactNode> = {
          success: <CheckCircle className="h-4 w-4 text-green-500" />,
          error: <AlertCircle className="h-4 w-4 text-red-500" />,
          info: <Info className="h-4 w-4 text-blue-500" />,
        };
        return (
          <div
            key={toast.id}
            className="animate-toast-in flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg"
          >
            {icons[toast.type]}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Separator
export function Separator({ className = '' }: { className?: string }) {
  return <div className={`shrink-0 bg-border h-[1px] w-full ${className}`} />;
}

// Label
export function Label({
  children,
  className = '',
  htmlFor,
}: {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none ${className}`}
    >
      {children}
    </label>
  );
}

// Switch
export function Switch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Tabs
export function Tabs({
  tabs,
  active,
  onChange,
  className = '',
}: {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            active === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 font-mono text-[11px] ${active === tab.value ? 'opacity-70' : 'opacity-50'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// KPI Card
export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendDirection,
  icon,
  urgent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  urgent?: boolean;
}) {
  return (
    <Card className={urgent ? 'border-destructive/50' : ''}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="font-mono text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium ${
                trendDirection === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : trendDirection === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
          {urgent && (
            <span className="flex items-center gap-1 text-xs font-medium text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              Action needed
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Empty State
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">{icon}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}