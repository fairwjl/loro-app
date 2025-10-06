import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const DISCLAIMER_TEXT =
  "Loro is a wellness tool, not therapy or medical care. If you are in crisis, call or text 988 in the U.S., or dial 911 (or your local emergency number).";

export default function DisclaimerManager() {
  // 1) Kill any floating disclaimer bubble on every page (regardless of class names)
  useEffect(() => {
    const killFloating = () => {
      const all = document.querySelectorAll("body *");
      for (const el of all) {
        const text = (el.textContent || "").trim();
        if (!text) continue;
        const hasDisclaimer = /loro is a wellness tool/i.test(text);
        if (hasDisclaimer) {
          const styles = window.getComputedStyle(el);
          const isFloating =
            styles.position === "fixed" || styles.position === "sticky";
          // Only hide floating versions; leave our footer alone.
          if (isFloating) {
            el.style.display = "none";
          }
        }
      }
    };
    killFloating();
    // Also watch for route/page changes that inject it back in
    const obs = new MutationObserver(killFloating);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // 2) Render a single centered footer at the end of <body> so it's consistent across all pages
  const footer = (
    <footer className="app-footer" role="contentinfo" aria-live="off">
      <p className="legal-disclaimer">
        {DISCLAIMER_TEXT}
      </p>
    </footer>
  );

  return createPortal(footer, document.body);
}