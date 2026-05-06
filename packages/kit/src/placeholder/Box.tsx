import type { ReactNode } from "react";

export interface BoxProps {
  children?: ReactNode;
  /**
   * Optional Tailwind class string. Real primitives in Chapter 3 will compose
   * Tailwind classes bound to Lattice tokens internally; this placeholder
   * only forwards the prop so the build/test loop can be validated end-to-end.
   */
  className?: string;
  /**
   * Test hook for the Chapter 1 component test. Real primitives will not
   * accept arbitrary data attributes by default.
   */
  "data-testid"?: string;
}

export function Box({ children, className, ...rest }: BoxProps): ReactNode {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
