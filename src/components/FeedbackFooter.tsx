"use client";

import { useState } from "react";

const RECIPIENTS = "thuan.truong@municipalvu.ca,thinh.lang@mail.utoronto.ca";
const SUBJECT = "GTHA snow dashboard feedback";

export default function FeedbackFooter() {
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    // The static site has no server, so the visitor's own email app sends it.
    window.location.href = `mailto:${RECIPIENTS}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(message)}`;
    setOpened(true);
  }

  return (
    <footer className="border-t border-line bg-panel">
      <form onSubmit={submit} className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-10 text-ink sm:px-5">
        <h2 className="font-serif text-xl font-semibold">Please send us your feedback</h2>
        <label htmlFor="feedback" className="text-base text-ink-2">
          Spotted an error, or have an idea for the dashboard? Tell us here.
        </label>
        <textarea
          id="feedback"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded border border-seq-2 bg-surface p-3 text-base text-ink placeholder:text-ink-3"
        />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="rounded bg-ink px-5 py-2 font-medium text-white hover:bg-seq-4">
            Submit
          </button>
          <p role="status" className="text-sm text-ink-2">
            {opened && (
              <>
                Your email app should open with the message ready. Press Send there. If nothing opened, contact us at{" "}
                <a href="https://www.thuantruong.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Thuan Truong
                </a>{" "}
                and{" "}
                <a href="https://www.thinhlang.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Thinh Lang
                </a>
                .
              </>
            )}
          </p>
        </div>
      </form>
    </footer>
  );
}
