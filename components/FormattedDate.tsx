"use client";

interface FormattedDateProps {
  date: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  showTime?: boolean;
}

export default function FormattedDate({ date, options, className = "", showTime = false }: FormattedDateProps) {
  if (!date) return null;
  const defaultOptions: Intl.DateTimeFormatOptions = showTime
    ? { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }
    : { year: "numeric", month: "numeric", day: "numeric" };
  const formattedDate = new Date(date).toLocaleString(undefined, options || defaultOptions);
  return <span className={className} suppressHydrationWarning>{formattedDate}</span>;
}
