import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenText,
  House,
  ListTodo,
  Megaphone,
  Palette,
  Plus,
  Search,
  Shapes,
  Star,
  Video,
} from "lucide-react";
import { PLATFORMS } from "@/social/registry";
import { useScheduleState } from "@/social/schedule";
import { BRANDS } from "@/branding/brands";
import { BrandMark } from "@/components/brand-mark";
import { AddMentorshipDialog } from "@/components/add-mentorship-dialog";
import { MentorAvatar } from "@/components/mentor-avatar";
import { mentorColor, mentorships, sessionWhen } from "@/content";
import { cn } from "@/lib/utils";

const groupLabel =
  "mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45";

/** onNavigate closes the mobile drawer after a link is followed */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname =
    useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "") ||
    "/";
  const [, , activeMentorship, activeSession] = pathname.split("/");
  const inMentorships = pathname.startsWith("/mentorships/");
  const { today, liveToday } = useScheduleState();

  return (
    <div className="sidebar-surface flex h-full flex-col text-sidebar-foreground">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 pb-5 pt-6"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[oklch(0.5_0.14_280)] shadow-lg shadow-black/20">
          <BookOpenText className="h-5 w-5 text-white" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight">
            Mentor Notes
          </span>
          <span className="block text-[11px] text-sidebar-foreground/55">
            Trading mentorships
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          <NavItem
            to="/"
            active={pathname === "/"}
            icon={<House className="h-4 w-4" />}
            onClick={onNavigate}
          >
            Home
          </NavItem>
          <NavItem
            to="/search"
            active={pathname === "/search"}
            icon={<Search className="h-4 w-4" />}
            onClick={onNavigate}
          >
            <span className="flex-1">Search</span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 font-mono text-[10px] text-sidebar-foreground/50">
              Ctrl K
            </kbd>
          </NavItem>
          <NavItem
            to="/key-points"
            active={pathname === "/key-points"}
            icon={<Star className="h-4 w-4" />}
            onClick={onNavigate}
          >
            All key points
          </NavItem>
          <NavItem
            to="/note-kit"
            active={pathname === "/note-kit"}
            icon={<Shapes className="h-4 w-4" />}
            onClick={onNavigate}
          >
            Note kit
          </NavItem>
        </div>

        <div>
          <div className="flex items-center justify-between pr-2">
            <p className={cn(groupLabel, "mb-0")}>Mentorships</p>
            <AddMentorshipDialog
              trigger={
                <button
                  type="button"
                  className="rounded-md p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  aria-label="New mentorship"
                  title="New mentorship"
                >
                  <Plus className="h-4 w-4" />
                </button>
              }
            />
          </div>

          <div className="mt-2 space-y-1">
            {mentorships.map((m) => {
              const open = inMentorships && activeMentorship === m.slug;
              const color = mentorColor(m);
              return (
                <div
                  key={m.slug}
                  className={cn(
                    "rounded-xl transition-colors",
                    open && "bg-white/[0.06] ring-1 ring-white/10",
                  )}
                >
                  <Link
                    to="/mentorships/$mentorship"
                    params={{ mentorship: m.slug }}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-sidebar-accent",
                      open && !activeSession && "bg-sidebar-accent",
                    )}
                  >
                    <MentorAvatar
                      m={m}
                      className="h-8 w-8 rounded-lg text-xs"
                    />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-sm font-medium">
                        {m.name}
                      </span>
                      <span className="block truncate text-[11px] text-sidebar-foreground/55">
                        {m.mentor}
                      </span>
                    </span>
                    <span className="rounded-full bg-white/10 px-1.5 py-px font-mono text-[10px] text-sidebar-foreground/70">
                      {m.sessions.length}
                    </span>
                  </Link>

                  {open && (
                    <div className="relative mb-2 ml-6 mt-1 space-y-0.5 pl-4">
                      <span className="absolute bottom-2 left-0 top-2 w-px bg-white/12" />
                      {m.sessions.length === 0 && (
                        <p className="py-1.5 text-xs text-sidebar-foreground/50">
                          No sessions yet
                        </p>
                      )}
                      {m.sessions.map((s) => {
                        const on = activeSession === s.slug;
                        return (
                          <Link
                            key={s.slug}
                            to="/mentorships/$mentorship/$session"
                            params={{ mentorship: m.slug, session: s.slug }}
                            onClick={onNavigate}
                            className={cn(
                              "relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                              on &&
                                "bg-sidebar-accent font-medium text-sidebar-foreground",
                            )}
                          >
                            <span
                              className="absolute -left-[19px] h-2 w-2 rounded-full ring-2 ring-sidebar"
                              style={{
                                backgroundColor: on
                                  ? color
                                  : "oklch(1 0 0 / 0.3)",
                              }}
                            />
                            <span className="min-w-0 flex-1 leading-tight">
                              <span className="block">Session {s.number}</span>
                              <span className="block truncate text-[11px] font-normal text-sidebar-foreground/50">
                                {s.title}
                              </span>
                            </span>
                            {s.date ? (
                              <span className="font-mono text-[10px] text-sidebar-foreground/45">
                                {sessionWhen(s, "short")}
                              </span>
                            ) : (
                              s.kind === "recorded" && (
                                <Video
                                  className="h-3.5 w-3.5 text-sidebar-foreground/45"
                                  aria-label="Recorded"
                                />
                              )
                            )}
                          </Link>
                        );
                      })}
                      <Link
                        to="/mentorships/$mentorship/to-check"
                        params={{ mentorship: m.slug }}
                        onClick={onNavigate}
                        className={cn(
                          "relative mt-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-amber-200/85 transition-colors hover:bg-sidebar-accent hover:text-amber-100",
                          activeSession === "to-check" &&
                            "bg-sidebar-accent font-medium text-amber-100",
                        )}
                      >
                        <span className="absolute -left-[19px] h-2 w-2 rounded-full bg-amber-400 ring-2 ring-sidebar" />
                        <ListTodo className="h-3.5 w-3.5" />
                        <span className="flex-1">To be checked</span>
                        {m.toCheck.filter((c) => c.status === "open").length >
                          0 && (
                          <span className="rounded-full bg-amber-400/20 px-1.5 font-mono text-[10px] text-amber-200">
                            {
                              m.toCheck.filter((c) => c.status === "open")
                                .length
                            }
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <AddMentorshipDialog
              trigger={
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 px-2.5 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:border-white/30 hover:text-sidebar-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Plus className="h-4 w-4" />
                  </span>
                  New mentorship
                </button>
              }
            />
          </div>
        </div>

        <div>
          <p className={groupLabel}>Social Media</p>
          <div className="space-y-0.5">
            <Link
              to="/social"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                pathname === "/social" &&
                  "bg-sidebar-accent font-medium text-sidebar-foreground",
              )}
            >
              <Megaphone className="h-4 w-4" /> All platforms
            </Link>
            {PLATFORMS.filter((p) => p.available).map((p) => {
              const Icon = p.icon;
              const on = pathname.startsWith(`/social/${p.id}`);
              return (
                <div key={p.id}>
                  <Link
                    to="/social/$platform"
                    params={{ platform: p.id }}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      on &&
                        "bg-sidebar-accent font-medium text-sidebar-foreground",
                    )}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                      style={{ background: p.gradient }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{p.name}</span>
                    {today !== null &&
                      p.templates.some((t) =>
                        liveToday(t.id),
                      ) && (
                        <span
                          title="Posts scheduled today"
                          className="rounded-full bg-emerald-500 px-1.5 py-px text-[10px] font-bold text-white"
                        >
                          {
                            p.templates.filter((t) =>
                              liveToday(t.id),
                            ).length
                          }{" "}
                          today
                        </span>
                      )}
                    <span className="rounded-full bg-white/10 px-1.5 py-px font-mono text-[10px] text-sidebar-foreground/70">
                      {p.templates.length}
                    </span>
                  </Link>
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
                    {BRANDS.map((b) => (
                      <Link
                        key={b.id}
                        to="/social/$platform"
                        params={{ platform: p.id }}
                        search={{ brand: b.id }}
                        onClick={onNavigate}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      >
                        <BrandMark brand={b} className="h-5 w-5" />
                        <span className="flex-1 truncate">{b.name}</span>
                        <span className="font-mono text-[10px] text-sidebar-foreground/50">
                          {p.templates.filter((t) => t.brand === b.id).length}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className={groupLabel}>Branding</p>
          <div className="space-y-0.5">
            <Link
              to="/branding"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                pathname === "/branding" &&
                  "bg-sidebar-accent font-medium text-sidebar-foreground",
              )}
            >
              <Palette className="h-4 w-4" /> Brand kit
            </Link>
            {BRANDS.map((b) => (
              <Link
                key={b.id}
                to={b.page}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  pathname === b.page &&
                    "bg-sidebar-accent font-medium text-sidebar-foreground",
                )}
              >
                <BrandMark brand={b} className="h-7 w-7" />
                <span className="flex-1">{b.name}</span>
                {!b.logo && (
                  <span className="text-[10px] text-sidebar-foreground/45">
                    logo soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-sidebar-foreground/45">
        Notes are stored as files in this project.
      </div>
    </div>
  );
}

function NavItem(props: {
  to: "/" | "/key-points" | "/note-kit" | "/search";
  active: boolean;
  icon: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={props.to}
      onClick={props.onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
        props.active && "bg-sidebar-accent font-medium text-sidebar-foreground",
      )}
    >
      {props.active && (
        <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />
      )}
      {props.icon}
      {props.children}
    </Link>
  );
}
