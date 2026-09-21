import { clsx } from "clsx";

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      {title ? (
        <h2 className="mb-3 text-sm font-semibold text-slate-500">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}
