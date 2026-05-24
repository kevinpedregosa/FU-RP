import { Leaf } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2 text-sm">
          <Leaf className="size-4 text-primary" />
          <span className="font-medium">{APP_NAME}</span>
          <span className="text-muted-foreground">
            — Automated frond counting for aquatic biology research
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Built for undergraduate ecology research
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        © {year} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
