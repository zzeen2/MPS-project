"use client";

import { useEffect, useState } from "react";
import PlaylistModal, { Track } from "../components/sections/playlistmodal";
import ProfileEditModal, { ProfileEditValues } from "../components/sections/ProfileEditModal";
import CompanyDetailModal, { Company } from "../components/sections/CompanyDetailModal";

/* ---------------- Types ---------------- */
type TabKey = "using" | "playlist";

// 서버에서 내려올 “사용중인 음원” 데이터 타입
type UsingTrackApi = {
  id: number | string;
  title: string;
  cover?: string;
  artist?: string;
  category?: string;
  leadersEarned?: number;     // 누적 리워드(있으면 뱃지로만 표시)
  lastUsedAt?: string;        // 최근 사용일시
  monthlyRewards?: number[];  // 길이 12
  startedAt?: string;         // 사용 시작일
  monthReward?: number;       // 하루 리워드(서버 제공 시)
};

type Playlist = {
  id: number;
  name: string;
  cover: string;
  count: number;
};

/* ---------------- Page ---------------- */
export default function MyPage() {
  const [tab, setTab] = useState<TabKey>("using");

  // 플레이리스트 모달
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  // 프로필 편집 모달
  const [profileOpen, setProfileOpen] = useState(false);

  // 상세(모달)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  // 👇 엔드포인트 (server.js 라우트에 맞게 경로만 바꿔줘)
  const USING_API = "/api/using-tracks";

  // 서버 데이터 상태 (+ 실패 시 mock fallback)
  const [usingDataApi, setUsingDataApi] = useState<UsingTrackApi[] | null>(null);

  // ⭐ 임시 데이터 (서버 대신, 실패 시 사용)
  const usingDataMock: UsingTrackApi[] = [
    {
      id: 1,
      title: "Midnight Drive",
      artist: "DJ Aurora",
      category: "EDM",
      cover: "https://picsum.photos/seed/midnight/600/600",
      leadersEarned: 2450,
      lastUsedAt: "2025-08-19 14:22",
      startedAt: "2025-05-01",
      monthReward: 95,
      monthlyRewards: [800, 900, 1000, 1100, 1200, 1500, 1600, 1700, 1650, 1750, 1900, 2100],
    },
    {
      id: 2,
      title: "Ocean Breeze",
      artist: "Wavey",
      category: "Pop",
      cover: "https://picsum.photos/seed/ocean/600/600",
      leadersEarned: 1780,
      lastUsedAt: "2025-08-18 21:05",
      startedAt: "2025-06-10",
      monthlyRewards: [600, 700, 780, 860, 940, 1100, 1180, 1240, 1220, 1300, 1400, 1500],
    },
    {
      id: 3,
      title: "City Lights",
      artist: "Neon Kid",
      category: "Hip-Hop",
      cover: "https://picsum.photos/seed/city/600/600",
      leadersEarned: 1320,
      lastUsedAt: "2025-08-17 10:12",
      startedAt: "2025-04-20",
      monthlyRewards: [420, 520, 600, 680, 760, 820, 900, 920, 980, 1040, 1100, 1180],
    },
  ];

  // 실제로 사용할 데이터 (서버 성공 시 서버 데이터, 아니면 mock)
  const usingData: UsingTrackApi[] = usingDataApi ?? usingDataMock;

  // 엔드포인트 fetch (실패해도 콘솔 경고만, UI는 mock으로 동작)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(USING_API, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: UsingTrackApi[] = await res.json();
        if (!cancelled) setUsingDataApi(json);
      } catch (e) {
        console.warn("Using tracks fetch failed, fallback to mock:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 최근 n일 리워드 목록 만들기 (서버가 하루 리워드를 줄 수도 있으니 보정)
  function calcDailyRewardBase(t: UsingTrackApi): number {
    if (typeof t.monthReward === "number") return t.monthReward;  // 서버가 하루 리워드를 주면 그대로 사용
    const lastMonthly = t.monthlyRewards?.[t.monthlyRewards.length - 1] ?? 0;
    return Math.round(lastMonthly / 30); // 단순 평균
  }

  // ✅ 월 총 리워드(표시용): monthlyRewards 최신값 > monthReward*30 > 일평균*30
  function calcMonthlyRewardTotal(t: UsingTrackApi): number {
    if (Array.isArray(t.monthlyRewards) && t.monthlyRewards.length > 0) {
      const last = t.monthlyRewards[t.monthlyRewards.length - 1];
      return Math.max(0, Number(last) || 0);
    }
    if (typeof t.monthReward === "number") {
      return Math.max(0, Math.round(t.monthReward * 30));
    }
    return Math.max(0, Math.round(calcDailyRewardBase(t) * 30));
  }

  function buildRecentDaily(t: UsingTrackApi, days = 7) {
    const amount = Math.max(0, calcDailyRewardBase(t));
    const list = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = d.toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
      }); // 예: 8.20. (수)
      return { label, amount };
    });
    return list;
  }

  // 아코디언 열림 상태 (Set으로 관리)
  const [openIds, setOpenIds] = useState<Set<string | number>>(new Set());
  const toggleId = (id: string | number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 모달로 매핑: 트랙 -> Company
  function trackToCompany(t: UsingTrackApi): Company {
    const months12 = new Array(12).fill(0);
    return {
      id: String(t.id),
      name: t.title || "알 수 없는 음원",
      tier: "Standard",
      totalTokens: (t.leadersEarned ?? 0) * 10,                          // 대충 환산
      monthlyEarned: calcMonthlyRewardTotal(t),                           // ✅ 월 총 리워드 사용
      monthlyUsed: 0,
      usageRate: 60,
      activeTracks: 1,
      status: "active",
      lastActivity: t.lastUsedAt ?? new Date().toLocaleString("ko-KR"),
      joinedDate: t.startedAt ?? "2025-01-01",
      contactEmail: "noreply@example.com",
      contactPhone: "02-0000-0000",
      subscriptionStart: t.startedAt ?? "2025-01-01",
      subscriptionEnd: "2025-12-31",
      monthlyUsage: months12,                                            // 모달 형식에 맞춰 비워둠
      monthlyRewards: t.monthlyRewards ?? months12,
      topTracks: [{ title: t.title ?? "Unknown", usage: 0, category: t.category ?? "기타" }],
    };
  }

  // 더미(프로필/플레이리스트)
  const initial: ProfileEditValues = {
    name: "홍길동",
    bio: "한 줄 소개",
    avatarUrl: "",
  };
  const playlists: Playlist[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Playlist ${i + 1}`,
    cover: `https://picsum.photos/seed/pl${i}/800/800`,
    count: 12 + i,
  }));
  const openPlaylistModal = (pl: Playlist, startIndex = 0) => {
    const SAMPLE_MP3 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    const tracks: Track[] = Array.from({ length: pl.count }).map((_, i) => ({
      id: i + 1,
      title: `${pl.name} - Track ${i + 1}`,
      artist: "Various",
      coverUrl: `https://picsum.photos/seed/${pl.id}-${i}/600/600`,
      audioUrl: SAMPLE_MP3,
      durationSec: undefined,
    }));
    setPlaylistTracks(tracks);
    setPlaylistIndex(Math.min(startIndex, tracks.length - 1));
    setPlaylistOpen(true);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
      {/* 상단 프로필 */}
      <section className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
        <div className="flex min-h-[112px] items-start gap-5">
          <img
            src="https://picsum.photos/seed/profile_fixed/400/400"
            alt="프로필 이미지"
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-[22px] font-bold leading-none text-zinc-900 dark:text-white">
              구이김 뮤직스
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold
                              bg-zinc-900/95 text-white ring-1 ring-white/10 shadow-sm
                              dark:bg:white dark:text-zinc-900 dark:ring-zinc-900/10"
              >
                Business
              </span>
            </h1>
        

            {/* 배지 */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                보유 중인 총 3,456 리워드
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-[12px] font-medium text-amber-600 dark:text-amber-400">
                사용 중인 총 음원 : {usingData.length}개
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[12px] font-medium text-blue-600 dark:text-blue-400">
                구독 남은 기간 18일
              </span>
            </div>
          </div>

          {/* 버튼 (동일 라인, 살짝 아래 정렬) */}
          <div className="ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                const target = usingData[0]; // 첫 번째 트랙 기준(원하면 선택한 트랙으로 바꿔도 됨)
                if (!target) return;
                setDetailCompany(trackToCompany(target));
                setDetailOpen(true);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium
                        bg-teal-500 text-white hover:bg-teal-400
                        dark:bg-teal-600 dark:hover:bg-teal-500
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                        dark:focus:ring-offset-neutral-900 transition-colors"
            >
              상세 보기
            </button>

            <button
              onClick={() => setProfileOpen(true)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50
                         dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              프로필 편집
            </button>
          </div>
        </div>
      </section>

      {/* 탭 헤더 */}
      <div className="mt-8 border-b border-zinc-200 dark:border-white/10">
        <div className="flex gap-6">
          <TabButton active={tab === "using"} onClick={() => setTab("using")}>
            사용중인 음원
          </TabButton>
          <TabButton active={tab === "playlist"} onClick={() => setTab("playlist")}>
            플레이리스트
          </TabButton>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="mt-6">
        {tab === "using" ? (
          <section className="space-y-3">
            <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white/70 dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900/60">
              {usingData.map((t) => {
                const open = openIds.has(t.id);
                const recent = buildRecentDaily(t, 7);
                const trackEndpoint = `${USING_API}/${t.id}`;
                const dailyEndpoint = `${USING_API}/${t.id}/rewards/daily?days=7`;

                return (
                  <div key={t.id} className="group">
                    {/* 아코디언 헤더 */}
                    <button
                      type="button"
                      onClick={() => toggleId(t.id)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <img
                        src={t.cover ?? `https://picsum.photos/seed/track-${t.id}/200/200`}
                        alt={t.title}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{t.title}</div>
                        <div className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500 dark:text-zinc-400">
                          {t.artist ?? "Various"} · {t.category ?? "카테고리 미지정"}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {typeof t.leadersEarned === "number" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-600 dark:text-emerald-400">
                            +{t.leadersEarned.toLocaleString()} 리워드
                          </span>
                        )}
                        {t.lastUsedAt && (
                          <span className="hidden md:inline text-zinc-500 dark:text-zinc-400">최근 사용: {t.lastUsedAt}</span>
                        )}
                      </div>
                      <svg
                        className={`h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 아코디언 본문 (그래프/탭/버튼 없이 “날짜 — 금액” 리스트만) */}
                    {open && (
                      <div className="px-4 pb-4">
                        {/* 엔드포인트 안내 (트랙별) */}
                        <div className="flex flex-wrap gap-2">
                          <span className="sm:ml-2 inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-mono text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                           음원 EndPoint: GET&nbsp;{trackEndpoint}
                          </span>
                          <span className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-mono text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                           가사 EndPoint: GET&nbsp;{dailyEndpoint}
                          </span>
                        </div>

                        {/* 상단 요약 3칸 */}
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <InfoCell label="사용 시작일" value={t.startedAt ?? "-"} />
                          {/* ✅ 여기 변경: 월 총 리워드 */}
                          <InfoCell
                            label="월 총 리워드"
                            value={`+${calcMonthlyRewardTotal(t).toLocaleString()}`}
                            badgeClass="text-emerald-600 dark:text-emerald-400"
                          />
                          <InfoCell label="최근 사용" value={t.lastUsedAt ?? "-"} />
                        </div>

                        {/* 최근 N일 — 금액 리스트 */}
                        <div className="mt-3 rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5">
                          <div className="border-b border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                            최근 7일 리워드
                          </div>
                          <ul className="divide-y divide-zinc-200 dark:divide-white/10">
                            {recent.map((r, i) => (
                              <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                                <span className="text-zinc-700 dark:text-zinc-300">{r.label}</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{r.amount.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <CardGrid>
            {playlists.map((p) => (
              <Card
                key={p.id}
                title={p.name}
                img={p.cover}
                meta={`${p.count}곡`}
                onOpenDetail={() => openPlaylistModal(p, 0)}
              />
            ))}
          </CardGrid>
        )}
      </div>

      {/* 모달들 */}
      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        tracks={playlistTracks}
        initialIndex={playlistIndex}
      />
      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initial={initial}
        onSave={(v) => console.log("SAVE PROFILE", v)}
      />
      <CompanyDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        company={detailCompany}
      />
    </main>
  );
}

/* ---------------- UI Bits ---------------- */
function TabButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px pb-3 text-sm font-medium leading-none transition-colors
        ${
          active
            ? "text-zinc-900 dark:text-white"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
      <span
        className={`pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full transition-opacity
          ${active ? "opacity-100 bg-red-500" : "opacity-0"}`}
      />
    </button>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">{children}</div>;
}

function Card({
  title,
  img,
  meta,
  onOpenDetail,
}: {
  title: string;
  img: string;
  meta?: string;
  onOpenDetail?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
      <div className="group relative h-48 w-full overflow-hidden bg-zinc-100 md:h-56 lg:h-60 dark:bg-zinc-800">
        <button type="button" onClick={onOpenDetail} className="h-full w-full" aria-label={`${title} 상세 보기`}>
          <img src={img} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        </button>
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{title}</div>
        {meta ? <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{meta}</div> : null}
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  badgeClass,
}: {
  label: string;
  value: string | number;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className={`mt-0.5 font-semibold text-zinc-900 dark:text-white ${badgeClass ?? ""}`}>{value}</div>
    </div>
  );
}
