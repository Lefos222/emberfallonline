import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { useEscapeClose } from "./ui";

export type WtTab<T extends string = string> = { id: T; name: string };

/**
 * The ornate game window the Inventory, Blacksmith and Astral screens wear: a rust-red
 * plate inside a gilded frame, a centred title bar and an optional tab strip along the top.
 * It is presentation only — the panels keep their own state and handlers.
 */
export function WtWindow<T extends string>({
  title,
  onClose,
  tabs,
  value,
  onChange,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  tabs?: readonly WtTab<T>[];
  value?: T;
  onChange?: (id: T) => void;
  children: ReactNode;
  className?: string;
}) {
  useEscapeClose(onClose);
  return (
    <div className="wt-overlay" onClick={onClose}>
      <div className={`wt-window ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="wt-titlebar">
          <span className="wt-title-plate">{title}</span>
          <span className="wt-ornament" aria-hidden="true" />
          <button className="wt-close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {tabs && value !== undefined && onChange && (
          <div className="wt-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={tab.id === value}
                className="wt-tab"
                onClick={() => onChange(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        <div className="wt-body">{children}</div>
      </div>
    </div>
  );
}

/** A carved square frame with a label beneath it — the Equipment and Luck Stone wells. */
export function WtFrame({
  label,
  size = 96,
  children,
  className = "",
}: {
  label?: ReactNode;
  size?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className="wt-frame-wrap">
      <div className={`wt-frame ${className}`} style={{ width: size, height: size }}>
        {children}
      </div>
      {label && <span className="wt-frame-label">{label}</span>}
    </div>
  );
}

/** The big metal action button that anchors each window. */
export function WtButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`wt-btn ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** A dark inset well that holds a block of content, edged in gold. */
export function WtSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`wt-inset ${className}`}>{children}</div>;
}
