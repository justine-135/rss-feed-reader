import Link from "next/link";
import { Newspaper } from "lucide-react";
import { clsx } from "clsx";

type FeedReaderLogoProps = {
  compact?: boolean;
  href?: string;
};

export function FeedReaderLogo({
  compact = false,
  href = "/",
}: FeedReaderLogoProps) {
  return (
    <Link className="inline-flex items-center gap-3" href={href}>
      <span className="feed-logo-mark flex h-10 w-10 items-center justify-center rounded-2xl text-white">
        <Newspaper className="h-5 w-5" />
      </span>
      <span
        className={clsx(
          "app-text-primary font-semibold tracking-[-0.03em]",
          compact ? "hidden text-xl sm:inline-flex" : "inline-flex text-xl",
        )}
      >
        Frontpage
      </span>
    </Link>
  );
}
