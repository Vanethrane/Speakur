import type { CSSProperties, ReactNode } from "react";

type StableSlotProps = {
  children: ReactNode;
  /** Reserved height to prevent CLS when interactive content hydrates */
  minHeight: number | string;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "aside";
  "aria-label"?: string;
};

/**
 * Explicit min-height wrapper for interactive / deferred UI to eliminate CLS.
 */
export function StableSlot({
  children,
  minHeight,
  className = "",
  style,
  as: Tag = "div",
  ...rest
}: StableSlotProps) {
  return (
    <Tag
      className={`stable-slot contain-layout ${className}`}
      style={{
        minHeight,
        contain: "layout",
        width: "100%",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default StableSlot;
