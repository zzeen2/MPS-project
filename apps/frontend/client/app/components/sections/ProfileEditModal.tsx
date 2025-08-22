"use client";
import { useEffect, useRef, useState } from "react";

export type ProfileEditValues = {
  name: string;
  bio?: string;
  avatarUrl?: string;
};

export default function ProfileEditModal({
  open,
  onClose,
  initial,
  onSave,
  uploadEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/upload/profile-image`,
}: {
  open: boolean;
  onClose: () => void;
  initial: ProfileEditValues;
  onSave: (values: ProfileEditValues) => void;
  uploadEndpoint?: string;
}) {
  const [v, setV] = useState<ProfileEditValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) setV(initial);
  }, [open, initial]);

  // ESC 닫기 + 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  const openPicker = () => fileRef.current?.click();

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedFile(file);
    void upload(file);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: fd });

      let text = "";
      try { text = await res.text(); } catch {}
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        throw new Error(
          data?.message || `Upload failed (HTTP ${res.status})${text ? " | " + text : ""}`
        );
      }

      const url = data.url || data.location || data.secure_url;
      if (!url) throw new Error("서버 응답에 url 필드가 없습니다.");
      setV((p) => ({ ...p, avatarUrl: url }));
    } catch (e: any) {
      setErr(e.message || "이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!v.name.trim()) {
      setErr("이름을 입력해 주세요.");
      return;
    }
    onSave(v);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-[1001] w-[92vw] max-w-xl rounded-2xl border border-white/10 bg-white text-zinc-900 shadow-xl outline-none dark:bg-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-base font-semibold">프로필 편집</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800">
                {pickedFile || v.avatarUrl ? (
                  <img
                    alt="avatar"
                    src={pickedFile ? URL.createObjectURL(pickedFile) : v.avatarUrl}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-zinc-400">
                    No Image
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePick}
                className="hidden"
              />
              <button
                type="button"
                onClick={openPicker}
                disabled={uploading}
                className="mt-2 h-8 w-full rounded-lg border border-zinc-300 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/10"
              >
                {uploading ? "업로드 중…" : (pickedFile || v.avatarUrl ? "이미지 변경" : "이미지 선택")}
              </button>
            </div>

            {/* Fields */}
            <div className="grow space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  이름
                </label>
                <input
                  value={v.name}
                  onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="이름"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  이메일
                </label>
                <input
                  value={v.name}
                  onChange={(e) => setV((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="이메일"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  전화번호 
                </label>
                <input
                  value={v.name}
                  onChange={(e) => setV((p) => ({ ...p, companyNumber: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="전화번호"
                />
              </div>

              {/* <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  소개
                </label>
                <textarea
                  rows={4}
                  value={v.bio ?? ""}
                  onChange={(e) => setV((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="간단한 소개를 작성하세요"
                />
              </div> */}
            </div>
          </div>

          {err && <p className="mt-3 text-xs text-red-400">{err}</p>}

          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border px-4 text-sm font-medium border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
