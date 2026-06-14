import { Fragment, useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  Search,
  X
} from "lucide-react";
import type { Capability } from "@signal-foundry/shared";
import { riskLabels, statusLabels } from "./data";
import { signOutUrl, type StaticWebAppUser } from "./auth";
import { relativeTime } from "./format";

export function LeftRail({
  activeView,
  onView,
  selectedRecord,
  isLive = false,
  refreshedAt
}: {
  activeView: string;
  onView: (view: string) => void;
  /** The currently-focused workflow; drives the live Active context panel. */
  selectedRecord?: Capability;
  isLive?: boolean;
  refreshedAt?: string;
}) {
  const groups = [
    ["Overview", [
      ["judge", "Guided Story"],
      ["deck", "Highlights"]
    ]],
    ["Workspace", [
      ["floor", "Foundry Floor"],
      ["review", "Review Queue"],
      ["mirror", "Copilot Mirror"]
    ]],
    ["Insight", [
      ["atlas", "Signal Atlas"],
      ["architecture", "Architecture"],
      ["pipeline", "Release Pipeline"],
      ["executive", "Light Executive"]
    ]]
  ] as const;

  return (
    <aside className="left-rail" aria-label="Foundry navigation">
      <div className="brand-lockup">
        <span className="forge-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="36" height="36" role="img" aria-label="Signal Foundry">
            <rect x="2.5" y="2.5" width="35" height="35" rx="11" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="M7 20 H13 l2.5 -6 4 12 3 -8 2 2 H33" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25.5" cy="20" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="25.5" cy="20" r="1.15" fill="currentColor" />
          </svg>
        </span>
        <div>
          <strong>Signal Foundry</strong>
          <small>Summarized | Forged | Approved</small>
        </div>
      </div>
      <nav>
        {groups.map(([section, items]) => (
          <Fragment key={section}>
            <p className="nav-section">{section}</p>
            {items.map(([key, label]) => (
              <button key={key} type="button" data-tour={`nav-${key}`} className={activeView === key ? "active" : ""} onClick={() => onView(key)}>
                <Activity size={16} />
                {label}
              </button>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="context-card">
        <span>Active context</span>
        {selectedRecord ? (
          <>
            <strong>{selectedRecord.title}</strong>
            <small>{selectedRecord.department} · {selectedRecord.role}</small>
            <small className="context-risk">
              <span className={`dot ${selectedRecord.riskLevel}`} />
              {riskLabels[selectedRecord.riskLevel]} risk · {statusLabels[selectedRecord.status]}
            </small>
          </>
        ) : (
          <>
            <strong>Customer Success Renewals</strong>
            <small>Production synthetic tenant</small>
            <small>SOC 2 + ISO 27001 controls</small>
          </>
        )}
        <small className="context-freshness">
          <span className={`context-live-dot ${isLive ? "is-live" : ""}`} aria-hidden="true" />
          {isLive ? "Live registry" : "Sample data"}{refreshedAt && relativeTime(refreshedAt) ? ` · updated ${relativeTime(refreshedAt)}` : ""}
        </small>
      </div>
    </aside>
  );
}

export function TopBar({
  user,
  searchQuery = "",
  onSearchChange,
  onStartTour,
  records = [],
  onJumpToRecord
}: {
  user?: StaticWebAppUser;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onStartTour?: () => void;
  records?: readonly Capability[];
  onJumpToRecord?: (id: string) => void;
}) {
  const displayName = user?.userDetails || "Avery M.";
  const initials = displayName
    .split(/[.@\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AM";

  // Global search: from any screen, find a workflow and jump to it. Matching is
  // over title / role / department / status so a judge can land on a record fast.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const trimmed = searchQuery.trim().toLowerCase();
  const matches = trimmed
    ? records.filter((record) =>
        record.title.toLowerCase().includes(trimmed) ||
        record.role.toLowerCase().includes(trimmed) ||
        record.department.toLowerCase().includes(trimmed) ||
        statusLabels[record.status].toLowerCase().includes(trimmed)
      ).slice(0, 7)
    : [];
  const showResults = searchOpen && trimmed.length > 0 && Boolean(onJumpToRecord);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    function onDocClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  function jumpTo(id: string) {
    onJumpToRecord?.(id);
    setSearchOpen(false);
  }

  // Account menu collapses How-to-use + Sign out behind the avatar.
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!accountOpen) {
      return;
    }
    function onDoc(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  return (
    <header className="top-bar">
      <div className="search-box-wrap" ref={searchRef}>
        <label className="search-box">
          <Search size={15} aria-hidden />
          <input
            value={searchQuery}
            onChange={(event) => {
              onSearchChange?.(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="renewals, risk gates, releases"
            aria-label="Search workflows"
            role="combobox"
            aria-expanded={showResults}
            aria-controls="search-results"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                onSearchChange?.("");
                setSearchOpen(false);
              }}
            >
              <X size={14} />
            </button>
          ) : null}
        </label>
        {showResults ? (
          <ul className="search-results" id="search-results" role="listbox" aria-label="Search results">
            {matches.length === 0 ? (
              <li className="search-empty">No workflows match “{searchQuery}”.</li>
            ) : (
              matches.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => jumpTo(record.id)}
                  >
                    <span className={`dot ${record.riskLevel}`} />
                    <span className="search-result-text">
                      <strong>{record.title}</strong>
                      <small>{statusLabels[record.status]} · {record.department} · {record.owner}</small>
                    </span>
                    <ChevronRight size={14} aria-hidden />
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <div className="top-bar-right">
        <div className="account-menu" ref={accountRef}>
          <button
            type="button"
            className="account-trigger"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((open) => !open)}
          >
            <span className="account-avatar">{initials}</span>
            <span className="account-id">
              <strong>{displayName}</strong>
              <small>{user ? "Microsoft authenticated" : "Release Manager"}</small>
            </span>
            <ChevronDown size={14} aria-hidden />
          </button>
          {accountOpen ? (
            <div className="account-dropdown" role="menu">
              {onStartTour ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onStartTour();
                    setAccountOpen(false);
                  }}
                >
                  <HelpCircle size={15} aria-hidden /> How to use
                </button>
              ) : null}
              <a role="menuitem" href={signOutUrl()}>
                <LogOut size={15} aria-hidden /> Sign out
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
