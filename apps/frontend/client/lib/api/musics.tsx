// lib/api/musics.ts
import type { Music, Page } from "@/lib/types/music"; 

// (카테고리 타입이 필요하면 간단히 로컬 정의하거나 별도 파일로 분리)
export type Category = { category_id: number; category_name: string };

// BASE: rewrites 쓰면 "/_api", 아니면 백엔드 풀 주소
const BASE =
  process.env.NEXT_PUBLIC_API_BASE
  ?? (process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/v1`
      : "http://localhost:4000/api/v1");

// qs 헬퍼
const qs = (o: Record<string, any>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

// (선택) cover 통일: cover_image_url → cover
const normalize = (m: Music): Music => ({
  ...m,
  cover: m.cover ?? m.cover_image_url ?? "",
});

export async function fetchCategories(): Promise<Category[]> {
  const r = await fetch(`${BASE}/categories`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${BASE}/categories ${r.status}`);
  const j = await r.json();
  return j.items as Category[];
}

export async function fetchPopular(params: { category?: string | number; limit?: number } = {}) {
  const r = await fetch(`${BASE}/musics/popular${qs(params)}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${BASE}/musics/popular ${r.status}`);
  const j = await r.json();
  return (j.items as Music[]).map(normalize);
}

export async function fetchMusics(params: {
  category?: string | number;
  cursor?: number | "first";
  limit?: number;
  sort?: "new" | "popular";
}): Promise<Page<Music>> {
  const r = await fetch(`${BASE}/musics${qs(params)}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${BASE}/musics ${r.status}`);
  const j = (await r.json()) as Page<Music>;
  return { ...j, items: j.items.map(normalize) };
}

export async function fetchMusic(id: number | string): Promise<Music> {
  const r = await fetch(`${BASE}/musics/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${BASE}/musics/${id} ${r.status}`);
  return normalize(await r.json());
}
