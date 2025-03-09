import Link from "next/link";
import { type FC, type ReactNode } from "react";

interface LinkComponentProps {
  href: string;
  children: ReactNode;
}

export const LinkComponent: FC<LinkComponentProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="shrink-0 text-sm font-medium text-zinc-800 dark:text-zinc-200"
    >
      {children}
    </Link>
  );
};
