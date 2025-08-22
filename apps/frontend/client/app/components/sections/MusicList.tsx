// app/components/sections/MusicList.tsx
// - lib/api/musics.ts의 fetchMusics만 사용
// - nextCursor 기반 페이지네이션
// - 서버엔 단일 category만 전송( ?category > ?categories[0] )
// - 필터는 아코디언(한 번에 하나만 열림), 체크박스 → 칩 토글
// - 검색 UI: 상단 MusicSearch (+ ?q= 연동)

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  startTransition,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MusicDetailModal, { MusicDetail } from "./MusicDetailModal";
import { fetchMusics } from "@/lib/api/musics";
import type { Music as ApiMusic } from "@/lib/types/music";
import MusicSearch from "./MusicSearch";
import { LuChevronDown } from "react-icons/lu"; // ▼ 드롭다운 아이콘

/* ---------------- Types ---------------- */

type Music = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  amount?: number;
  reward_amount?: number;
  reward_total?: number;
  reward_remaining?: number;
  /** ▼ UI용: 서버에 없으면 아래서 임시 생성 */
  category?: string;
  tags?: string[];
};

type Playlist = { id: number; name: string };
type Page<T> = { items: T[]; nextCursor: number | null };

/* ---------------- Filters ---------------- */
const MOODS = ["잔잔한", "신나는", "감성적인", "몽환적인", "파워풀", "여유로운"] as const;
const CATEGORIES = [
  "Pop",
  "발라드",
  "댄스",
  "힙합",
  "R&B",
  "락",
  "클래식",
  "재즈",
  "트로트",
  "OST",
  "인디",
  "포크",
  "뉴에이지",
  "EDM",
  "랩",
] as const;

/* ---------------- Sort ---------------- */
type SortKey = "popular" | "latest" | "perReward" | "totalReward" | "remainderReward";
const SORT_LABELS: Record<SortKey, string> = {
  popular: "인기순",
  latest: "최신순",
  perReward: "1회 리워드 높은순",
  totalReward: "총 리워드 많은순",
  remainderReward: "남은 리워드 많은순"
  
};

function sortByKey<T extends Partial<Music>>(list: T[], key: SortKey): T[] {
  const copy = [...list];
  switch (key) {
    case "popular":
      // views → 없으면 likes 기준
      return copy.sort(
        (a: any, b: any) => (b.views ?? b.likes ?? 0) - (a.views ?? a.likes ?? 0)
      );
    case "latest":
      return copy.sort(
        (a: any, b: any) =>
          new Date(b.date ?? b.createdAt ?? 0).getTime() -
          new Date(a.date ?? a.createdAt ?? 0).getTime()
      );
    case "perReward":
      return copy.sort(
        (a: any, b: any) => (b.reward_amount ?? 0) - (a.reward_amount ?? 0)
      );
    case "totalReward":
      return copy.sort(
        (a: any, b: any) => (b.reward_total ?? 0) - (a.reward_total ?? 0)
      );
    case "remainderReward":
      return copy.sort(
        (a: any, b: any) => (b.reward_total ?? 0) - (a.reward_total ?? 0)
      )
    default:
      return copy;
  }
}

/* ---------------- Query utils ---------------- */

function parseCSV(value: string | null): string[] {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}
function toCSV(values: string[]): string {
  return values.join(",");
}

/** 서버로 전달할 단일 category 계산 */
function categoryForServer(sp: URLSearchParams): string | undefined {
  const single = sp.get("category");
  if (single) return single;
  const multi = parseCSV(sp.get("categories"));
  return multi[0];
}

/* ---------------- Reward fallback ---------------- */
function withMockRewards<T extends Partial<Music> & { amount?: number }>(
  m: T,
  seed = 0
): T &
  Required<Pick<Music, "reward_amount" | "reward_total" | "reward_remaining">> {
  const already =
    m.reward_amount !== undefined &&
    m.reward_total !== undefined &&
    m.reward_remaining !== undefined;
  if (already) {
    return m as T & Required<Pick<Music, "reward_amount" | "reward_total" | "reward_remaining">>;
  }

  const price = Math.max(0, Math.round(Number(m.amount) || 0));
  const reward_amount = Math.max(1, Math.round(price * 0.01));
  const cap = 200 + ((seed * 13) % 150);
  const used = Math.min(cap, Math.floor((seed * 7) % cap));
  const reward_total = reward_amount * cap;
  const reward_remaining = Math.max(0, reward_total - reward_amount * used);
  return { ...m, reward_amount, reward_total, reward_remaining };
}

/* ---------------- UI helpers: mock category/tags ---------------- */
function withMockCategoryTags<T extends Partial<Music>>(m: T, seed = 0): T & Required<Pick<Music, "category" | "tags">> {
  const hasAll = !!m.category && Array.isArray(m.tags) && m.tags.length > 0;
  if (hasAll) return m as T & Required<Pick<Music, "category" | "tags">>;

  const cat = m.category ?? CATEGORIES[Math.abs(seed + (Number(m.id) || 0)) % CATEGORIES.length];
  const t1 = MOODS[(seed + 1) % MOODS.length];
  const t2 = MOODS[(seed + 3) % MOODS.length];
  const t3 = MOODS[(seed + 5) % MOODS.length];
  const tags = m.tags?.length ? m.tags : Array.from(new Set([t1, t2, t3])).slice(0, 3) as string[];

  return { ...(m as any), category: cat, tags };
}

/* ---------------- Component ---------------- */

export default function MusicList() {
  const sp = useSearchParams();
  const router = useRouter();

  // URL -> 현재 선택 상태
  const selectedMoods = useMemo(() => parseCSV(sp.get("moods")), [sp]);
  const selectedCategories = useMemo(() => {
    const multi = new Set(parseCSV(sp.get("categories")));
    const single = sp.get("category");
    if (single) multi.add(single);
    return Array.from(multi);
  }, [sp]);

  // 검색어 (?q=)
  const q = sp.get("q") ?? "";

  // ▼ 정렬 파라미터/드롭다운
  const sortParam = (sp.get("sort") as SortKey) ?? "popular";
  const [sortOpen, setSortOpen] = useState(false);
  const setSort = (v: SortKey) => {
    const qs = new URLSearchParams(sp.toString());
    qs.set("sort", v);
    startTransition(() => {
      router.replace("?" + qs.toString(), { scroll: false });
      setSortOpen(false);
    });
  };

  // 필터 변경 의존키 (q, sort 포함)
  const depsKey = useMemo(
    () =>
      JSON.stringify({
        category: sp.get("category"),
        categories: sp.get("categories"),
        q,
        sort: sortParam,
      }),
    [sp, q, sortParam]
  );

  // URL 업데이트
  const pushParams = useCallback(
    (patch: {
      moods?: string[];
      categories?: string[];
      clearCategorySingle?: boolean;
      q?: string;
    }) => {
      const next = new URLSearchParams(sp.toString());

      if (patch.moods) {
        patch.moods.length ? next.set("moods", toCSV(patch.moods)) : next.delete("moods");
      }
      if (patch.categories) {
        if (patch.categories.length) {
          next.set("categories", toCSV(patch.categories));
          if (patch.clearCategorySingle) next.delete("category");
        } else {
          next.delete("categories");
          if (patch.clearCategorySingle) next.delete("category");
        }
      }
      if (patch.q !== undefined) {
        const clean = (patch.q ?? "").trim();
        clean ? next.set("q", clean) : next.delete("q");
      }

      next.delete("cursor"); // 페이지네이션 초기화
      startTransition(() => {
        router.push(`?${next.toString()}`, { scroll: false });
      });
    },
    [router, sp]
  );

  // 아코디언 열림 상태(한 번에 하나만)
  const [open, setOpen] = useState<null | "moods" | "categories">(null);

  // 목록/페이지네이션
  const [items, setItems] = useState<Music[]>([]);
  const [err, setErr] = useState<string>("");

  const [cursor, setCursor] = useState<number | "first">("first");
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(true);

  const seenIdsRef = useRef<Set<number>>(new Set());
  const inflightRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const cursorRef = useRef<number | "first">(cursor);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 서버 -> UI 매핑 (카테/태그 & 리워드 mock도 포함)
  const mapApiMusic = (m: ApiMusic, i: number): Music => {
    const base: Partial<Music> = {
      id: m.id,
      title: m.title,
      artist: (m as any).artist ?? "",
      cover: (m as any).cover ?? (m as any).cover_image_url ?? "/placeholder.png",
      amount: (m as any).price ?? (m as any).amount,
      reward_amount: (m as any).reward_amount,
      reward_total: (m as any).reward_total,
      reward_remaining: (m as any).reward_remaining,
      category: (m as any).category ?? (m as any).category_name,
      tags: Array.isArray((m as any).tags) ? (m as any).tags.slice(0, 3) : undefined,
    };

    const withCT = withMockCategoryTags(base, i);
    const withRewards = withMockRewards(withCT, i);
    return withRewards as Music;
  };

  // 다음 페이지 로드
  const fetchNext = useCallback(async () => {
    if (inflightRef.current || !hasMoreRef.current) return;
    inflightRef.current = true;
    setErr("");
    try {
      const cat = categoryForServer(sp);

      const page = (await fetchMusics({
        cursor: cursorRef.current,
        limit,
        category: cat,
      })) as Page<ApiMusic>;

      const batchRaw = Array.isArray(page.items) ? page.items : [];
      const batch = batchRaw.map(mapApiMusic);

      // 중복 제거
      const seen = seenIdsRef.current;
      const deduped = batch.filter((m) => {
        if (!m || typeof m.id !== "number") return false;
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      // 클라 사이드 검색 필터 (제목/아티스트)
      const qLower = (q || "").toLowerCase();
      const filtered = qLower
        ? deduped.filter(
            (m) =>
              m.title?.toLowerCase().includes(qLower) ||
              m.artist?.toLowerCase().includes(qLower)
          )
        : deduped;

      if (filtered.length > 0) {
        // ▼ 정렬 유지하며 추가
        setItems((prev) => sortByKey([...prev, ...filtered], sortParam));
      }

      if (page.nextCursor !== null && page.nextCursor !== undefined) {
        setCursor(page.nextCursor as number);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (e: any) {
      setErr(e?.message || "목록을 불러오지 못했습니다.");
    } finally {
      inflightRef.current = false;
    }
  }, [sp, limit, q, sortParam]);

  // 필터/검색/정렬 변경 → 초기화 후 첫 로드
  useEffect(() => {
    setItems([]);
    setHasMore(true);
    setErr("");
    setCursor("first");
    seenIdsRef.current.clear();
    fetchNext();
  }, [depsKey, fetchNext]);

  // 무한 스크롤
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      const hit = entries.some((e) => e.isIntersecting);
      if (hit) fetchNext();
    });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [fetchNext]);

  // 초기 컨텐츠가 화면을 못 채우면 자동 추가 로드
  useEffect(() => {
    if (!hasMoreRef.current || inflightRef.current) return;
    if (document.body.scrollHeight <= window.innerHeight + 40) {
      fetchNext();
    }
  }, [items.length, fetchNext]);

  // 정렬 키만 바뀐 경우 현재 목록 재정렬 (리패치 없이)
  useEffect(() => {
    setItems((prev) => sortByKey(prev, sortParam));
  }, [sortParam]);

  // 상세 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<MusicDetail | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([{ id: 101, name: "내 첫 플레이리스트" }]);

  async function fetchMusicDetail(id: number): Promise<MusicDetail> {
    const base = items.find((t) => t.id === id);
    return {
      id,
      title: base?.title ?? "",
      artist: base?.artist ?? "",
      cover: base?.cover,
      lyrics: "가사/설명은 상세 API로 교체하세요.",
      company: { id: 1, name: "MPS Music", tier: "Business" },
      isSubscribed: false,
    };
  }

  const handleSelect = async (id: number) => {
    const d = await fetchMusicDetail(id);
    setDetail(d);
    setModalOpen(true);
  };

  const onSubscribe = async (_musicId: number) => {
    setDetail((prev) => (prev ? { ...prev, isSubscribed: true } : prev));
  };
  const onAddToPlaylist = async (musicId: number, playlistId: number) => {
    console.log("addToPlaylist", { musicId, playlistId });
  };
  const onCreatePlaylist = async (name: string) => {
    const pl = { id: Date.now(), name };
    setPlaylists((p) => [pl, ...p]);
    return pl;
  };

  /* -------- 로딩/빈 상태 -------- */
  if (!items.length && inflightRef.current) {
    return (
      <>
        {/* 🔎 검색바 */}
        <div className="mb-3 flex justify-center">
        <MusicSearch
            value={q}
            onChange={(next) => pushParams({ q: next })}
            onSearch={(next) => pushParams({ q: next })}
          />
        </div>

        {/* ▼ 정렬 드롭다운 */}
        <div className="mb-2 flex justify-end">
          <SortDropdown
            open={sortOpen}
            setOpen={setSortOpen}
            sortKey={sortParam}
            onSelect={setSort}
          />
        </div>

        <FilterBar
          selectedMoods={selectedMoods}
          selectedCategories={selectedCategories}
          open={open}
          setOpen={setOpen}
          pushParams={pushParams}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
            >
              <div className="h-40 w-full animate-pulse bg-zinc-200/60 dark:bg-white/10" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-2/3 animate-pulse bg-zinc-200/60 dark:bg-white/10" />
                <div className="h-3 w-1/3 animate-pulse bg-zinc-200/60 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!items.length && !inflightRef.current) {
    return (
      <>
        {/* 🔎 검색바 */}
        <div className="mb-3 flex justify-center">
          <MusicSearch value={q} onChange={(next) => pushParams({ q: next })} />
        </div>

        {/* ▼ 정렬 드롭다운 */}
        <div className="mb-2 flex justify-end">
          <SortDropdown
            open={sortOpen}
            setOpen={setSortOpen}
            sortKey={sortParam}
            onSelect={setSort}
          />
        </div>

        <FilterBar
          selectedMoods={selectedMoods}
          selectedCategories={selectedCategories}
          open={open}
          setOpen={setOpen}
          pushParams={pushParams}
        />
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          {err || "조건에 맞는 음악이 없습니다."}
        </div>
      </>
    );
  }

  /* -------- 기본 렌더 -------- */
  return (
    <>
      {/* 🔎 검색바 */}
      <div className="mb-3 flex justify-center">
        <MusicSearch value={q} onChange={(next) => pushParams({ q: next })} />
      </div>

      {/* ▼ 정렬 드롭다운 */}
      <div className="mb-2 flex justify-end">
        <SortDropdown
          open={sortOpen}
          setOpen={setSortOpen}
          sortKey={sortParam}
          onSelect={setSort}
        />
      </div>

      <FilterBar
        selectedMoods={selectedMoods}
        selectedCategories={selectedCategories}
        open={open}
        setOpen={setOpen}
        pushParams={pushParams}
      />

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((m, i) => (
          <div
            key={m.id}
            className="cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white/70 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            onClick={() => handleSelect(m.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cover} alt={m.title} className="h-40 w-full object-cover" />
            <div className="p-3">
              <div className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {m.title}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 dark:text-white/60">{m.artist}</div>

              {/* 리워드 배지 */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {(() => {
                  const r = withMockRewards(m, i);
                  return (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-sm ring-1 ring-black/10">
                        1회 {r.reward_amount}
                      </span>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-300">
                        월총 {r.reward_total}
                      </span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                        남음 {r.reward_remaining}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* ▼ 카테고리 & 태그 칩 (하단) */}
              {(() => {
                const t = withMockCategoryTags(m, i);
                return (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.category && (
                      <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-[11px] text-zinc-800 dark:border-white/10 dark:bg:white/10 dark:text-zinc-100 dark:bg-white/10">
                        {t.category}
                      </span>
                    )}
                    {t.tags?.slice(0, 3).map((tg) => (
                      <span
                        key={tg}
                        className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {hasMoreRef.current && !inflightRef.current && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchNext}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
          >
            더보기
          </button>
        </div>
      )}

      <div ref={sentinelRef} className="h-6 w-full" />

      <MusicDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={detail}
        myPlaylists={playlists}
        onSubscribe={onSubscribe}
        onAddToPlaylist={onAddToPlaylist}
        onCreatePlaylist={onCreatePlaylist}
      />
    </>
  );
}

/** ▼ 정렬 드롭다운 버튼 + 메뉴 */
function SortDropdown({
  open,
  setOpen,
  sortKey,
  onSelect,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sortKey: SortKey;
  onSelect: (v: SortKey) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-sm dark:border-white/20"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {SORT_LABELS[sortKey]}
        <LuChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md dark:border-white/10 dark:bg-zinc-800"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => onSelect(k)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-white/10 ${
                sortKey === k ? "font-semibold text-teal-600 dark:text-teal-400" : ""
              }`}
              role="menuitem"
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 상단 필터 바 (무드/카테고리만) */
function FilterBar({
  selectedMoods,
  selectedCategories,
  open,
  setOpen,
  pushParams,
}: {
  selectedMoods: string[];
  selectedCategories: string[];
  open: null | "moods" | "categories";
  setOpen: React.Dispatch<React.SetStateAction<null | "moods" | "categories">>;
  pushParams: (patch: { moods?: string[]; categories?: string[]; clearCategorySingle?: boolean; q?: string }) => void;
}) {
  const toggleValue = (arr: string[], value: string) => {
    const set = new Set(arr);
    set.has(value) ? set.delete(value) : set.add(value);
    return Array.from(set);
  };

  return (
    <section className="rounded-xl ">
      {/* 상단 버튼 */}
      <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2">
        <button
          className={`h-10 rounded-lg text-sm ${
            open === "moods"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-white/90"
          }`}
          onClick={() => setOpen(open === "moods" ? null : "moods")}
        >
          분위기
        </button>

        <button
          className={`h-10 rounded-lg text-sm ${
            open === "categories"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-white/90"
          }`}
          onClick={() => setOpen(open === "categories" ? null : "categories")}
        >
          카테고리
        </button>
      </div>

      {/* 아코디언 패널 */}
      <div className="mt-2 space-y-2">
        <Accordion open={open === "moods"}>
          <TagGrid
            items={MOODS as unknown as string[]}
            selected={selectedMoods}
            onToggle={(m) => pushParams({ moods: toggleValue(selectedMoods, m) })}
            onClear={() => pushParams({ moods: [] })}
          />
        </Accordion>

        <Accordion open={open === "categories"}>
          <TagGrid
            items={CATEGORIES as unknown as string[]}
            selected={selectedCategories}
            onToggle={(c) =>
              pushParams({
                categories: toggleValue(selectedCategories, c),
                clearCategorySingle: true, // 단일 ?category 비우기
              })
            }
            onClear={() => pushParams({ categories: [], clearCategorySingle: true })}
          />
        </Accordion>
      </div>

      {/* 선택 칩 */}
      {(selectedMoods.length > 0 || selectedCategories.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {selectedMoods.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs text-teal-700 dark:text-teal-300"
            >
              {m}
              <button
                className="ml-1 rounded px-1 hover:bg-teal-500/20"
                onClick={() => {
                  const next = selectedMoods.filter((v) => v !== m);
                  pushParams({ moods: next });
                }}
                aria-label={`${m} 제거`}
              >
                ✕
              </button>
            </span>
          ))}

          {selectedCategories.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-1 text-xs text-zinc-800 dark:bg-white/10 dark:text-zinc-200"
            >
              {c}
              <button
                className="ml-1 rounded px-1 hover:bg-zinc-300 dark:hover:bg-white/15"
                onClick={() => {
                  const next = selectedCategories.filter((v) => v !== c);
                  pushParams({ categories: next, clearCategorySingle: true });
                }}
                aria-label={`${c} 제거`}
              >
                ✕
              </button>
            </span>
          ))}

          <button
            className="ml-1 inline-flex items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            onClick={() => {
              pushParams({ moods: [], categories: [], clearCategorySingle: true });
            }}
          >
            모두 지우기
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------------- Sub components ---------------- */

function Accordion({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-2 dark:border-white/10 dark:bg-white/5">
        {children}
      </div>
    </div>
  );
}

function TagGrid({
  items,
  selected,
  onToggle,
  onClear,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <>
      <ul className="flex flex-wrap gap-2 p-1">
        {items.map((it) => {
          const active = selected.includes(it);
          return (
            <li key={it}>
              <button
                type="button"
                onClick={() => onToggle(it)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  active
                    ? "bg-teal-500 text-black shadow-sm"
                    : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                }`}
              >
                {it}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex justify-end px-1">
        <button
          onClick={onClear}
          className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
        >
          전체 해제
        </button>
      </div>
    </>
  );
}
