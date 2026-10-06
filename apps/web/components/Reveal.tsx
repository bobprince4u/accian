import type { ReactNode } from "react";

/** Content is visible from server render; motion never gates access to it. */
export default function Reveal({ children, className = "" }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  return <div className={`content-reveal ${className}`}>{children}</div>;
}
