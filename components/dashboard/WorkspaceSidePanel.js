"use client";

import { useEffect, useRef, useState } from "react";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import { Sparkles } from "lucide-react";

const renderSlot = (slot, props) =>
  typeof slot === "function" ? slot(props) : slot;

export default function WorkspaceSidePanel({
  title,
  subtitle,
  icon: IconComponent = Sparkles,
  collapsedLabel = "Panel",
  children,
  footer,
  defaultExpandedDesktop = true,
  defaultExpandedMobile = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultExpandedDesktop);
  const [isDesktop, setIsDesktop] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const determineViewport = () => {
      if (typeof window === "undefined") {
        return;
      }

      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);

      if (!initialized.current) {
        setIsOpen(desktop ? defaultExpandedDesktop : defaultExpandedMobile);
        initialized.current = true;
      }
    };

    determineViewport();
    window.addEventListener("resize", determineViewport);
    return () => window.removeEventListener("resize", determineViewport);
  }, [defaultExpandedDesktop, defaultExpandedMobile]);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const slotProps = {
    isOpen,
    toggle: handleToggle,
    open: handleOpen,
    close: handleClose,
  };

  const panelClassName = `${
    isOpen
      ? "fixed inset-4 z-50 flex flex-col w-auto max-w-full md:relative md:inset-auto md:z-auto md:w-80"
      : "hidden md:flex md:w-16 md:flex-col"
  } h-full rounded-[28px] border border-white/10 bg-[#0E1322]/95 backdrop-blur-xl shadow-[0_25px_80px_rgba(6,8,20,0.55)] transition-all duration-300 ease-in-out overflow-hidden ${className}`;

  return (
    <>
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}

      <aside className={panelClassName} aria-label={`${title} panel`}>
        <div className="flex items-center justify-between gap-3 p-4 pb-2">
          <div
            className={`space-y-1 text-left transition-all duration-200 ${
              isOpen
                ? "opacity-100 translate-y-0"
                : "md:opacity-0 md:-translate-y-1 md:pointer-events-none opacity-0"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.45em] text-gold/70">
              {subtitle || "Workspace"}
            </p>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-2xl border border-white/15 bg-white/[0.04] p-2 text-white transition-all duration-200 hover:border-gold/60 hover:bg-gold/10"
            aria-label={isOpen ? "Collapse side panel" : "Expand side panel"}
          >
            <BiSolidRightArrow
              className={`h-4 w-4 text-gold transition-transform duration-300 ${
                isOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        <div className="flex-1 p-4 pt-0">
          {isOpen ? (
            <div className="flex h-full flex-col overflow-hidden">
              {renderSlot(children, slotProps)}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpen}
              className="hidden h-full w-full flex-col items-center justify-center gap-6 rounded-2xl border border-transparent px-2 py-6 text-gold/80 transition-all duration-300 hover:border-gold/40 hover:bg-gold/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex"
              aria-label="Expand workspace panel"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/15 to-transparent shadow-inner shadow-gold/10">
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/60 [writing-mode:vertical-rl]">
                {collapsedLabel}
              </span>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            </button>
          )}
        </div>

        {isOpen && footer && (
          <div className="border-t border-white/10 p-4">
            {renderSlot(footer, slotProps)}
          </div>
        )}
      </aside>

      {!isDesktop && !isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed right-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur shadow-lg shadow-black/40"
        >
          <HiMenu className="h-4 w-4 text-gold" />
          {title}
        </button>
      )}
    </>
  );
}
