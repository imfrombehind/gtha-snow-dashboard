"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SiteNav, type SiteSection } from "@/components/SiteHeader";

const RECIPIENTS = "thuan.truong@municipalvu.ca,thinh.lang@mail.utoronto.ca";
const SUBJECT = "GTHA snow dashboard feedback";

export default function FeedbackFooter() {
  const [message, setMessage] = useState("");
  // The footer lives in the root layout, so it reads the current section from the URL.
  const pathname = usePathname();
  const currentSlug = pathname.match(/^\/municipality\/([^/]+)/)?.[1];
  const active: SiteSection | undefined =
    pathname === "/" ? "dashboard" : pathname.startsWith("/project") ? "project"
    : currentSlug || pathname.startsWith("/level-of-service") ? "profile" : undefined;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    // The static site has no server, so the visitor's own email app sends it.
    window.location.href = `mailto:${RECIPIENTS}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(message)}`;
  }

  return (
    // Same grey as the basemap water. Form on the left, section links on the right (below on phones).
    <footer className="bg-[#d4dadc]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-5 md:flex-row md:gap-12">
        <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-3 text-ink">
          <h2 className="font-serif text-xl font-semibold">Please send us your feedback</h2>
          <label htmlFor="feedback" className="text-base text-ink">
            Spotted an error, or have an idea for the dashboard? Tell us here.
          </label>
          <textarea
            id="feedback"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded border border-seq-3 bg-panel p-3 text-base text-ink placeholder:text-ink-3"
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="rounded bg-ink px-5 py-2 font-medium text-white hover:bg-seq-4">
              Submit
            </button>
            <p className="text-sm text-ink">
              Your email app should open with the message ready. Press Send there. If nothing opened, contact us at{" "}
              <a href="https://www.thuantruong.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                Thuan Truong
              </a>{" "}
              and{" "}
              <a href="https://www.thinhlang.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                Thinh Lang
              </a>
              .
            </p>
          </div>
        </form>
        <div className="md:border-l md:border-seq-3 md:pl-8">
          <SiteNav active={active} currentSlug={currentSlug} label="Footer sections" selectId="footer-open-municipality" vertical />
        </div>
      </div>
    </footer>
  );
}
