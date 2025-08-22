"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

type FormState = {
  name: string;
  business_number: string;
  email: string;
  password: string;
  phone: string;
  ceo_name: string;
  profile_image_url: string; // 업로드 완료 후 서버 URL 저장
  homepage_url: string;
};

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [f, setF] = useState<FormState>({
    name: "",
    business_number: "",
    email: "",
    password: "",
    phone: "",
    ceo_name: "",
    profile_image_url: "",
    homepage_url: "",
  });

  // ===== 배경 비디오 자동재생 안정화 =====
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.play().catch(() => {});
  }, []);

  // ===== 진입 시 스크롤 잠그기 =====
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ===== validators =====
  const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const isBizNo = (v: string) => /^\d{3}-\d{2}-\d{5}$/.test(v);

  const step1Valid = useMemo(
    () =>
      f.name.trim().length > 0 &&
      isBizNo(f.business_number) &&
      isEmail(f.email) &&
      f.password.length >= 8,
    [f]
  );

  const step2Valid = useMemo(
    () =>
      f.phone.trim().length > 0 &&
      f.ceo_name.trim().length > 0 &&
      (f.profile_image_url.trim() === "" ||
        /^https?:\/\//.test(f.profile_image_url)) &&
      (f.homepage_url.trim() === "" || /^https?:\/\//.test(f.homepage_url)),
    [f]
  );

  // ===== 사업자번호 자동 포맷: 000-00-00000 =====
  const formatBizNo = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 5);
    const c = digits.slice(5, 10);
    let out = a;
    if (b) out += "-" + b;
    if (c) out += "-" + c;
    return out;
  };

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (key === "business_number") v = formatBizNo(v);
      setF((p) => ({ ...p, [key]: v }));
    };

  const goNext = () => {
    setErr("");
    if (step === 1 && !step1Valid) {
      setErr("1단계 필수 항목을 올바르게 입력해 주세요.");
      return;
    }
    setStep(2);
  };

  const goPrev = () => {
    setErr("");
    setStep(1);
  };

  // ===== 프로필 이미지 업로드 =====
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileRef.current?.click();

  const handleProfilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    uploadProfileImage(file);
  };

  const uploadProfileImage = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      // 서버에서 기대하는 필드명으로 맞춰주세요 (예: "file" / "image")
      fd.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/profile-image`,
        { method: "POST", body: fd }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "이미지 업로드에 실패했습니다.");

      // 서버가 { url: "https://..." } 형태로 응답한다고 가정
      setF((p) => ({ ...p, profile_image_url: data.url }));
    } catch (e: any) {
      setErr(e.message || "이미지 업로드 에러");
    } finally {
      setUploading(false);
    }
  };

  // ===== 제출 =====
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");

    if (step === 1) {
      goNext();
      return;
    }
    if (!step2Valid) {
      setErr("2단계 항목을 확인해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "회원가입에 실패했습니다.");
      }
      window.location.href = "/login";
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-1 py-1 text-white overflow-hidden">
      {/* ===== 배경 비디오 (전체 고정) ===== */}
      <video
        ref={videoRef}
        className="fixed inset-0 h-full w-full object-cover z-0"
        src="/videos/blockchain.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      {/* 가독성 오버레이 */}
      <div className="fixed inset-0 bg-black/40 z-10 pointer-events-none" />

      {/* ===== 콘텐츠 ===== */}
      {/* <div className="relative z-20 w-[min(920px,92vw)] h-[620px] rounded-2xl bg-black/30 shadow-[0_10px_40px_rgba(0,0,0,.45)] overflow-hidden mb-[50px]"> */}
      <div className="relative z-20 w-[min(920px,92vw)] h-[620px] rounded-2xl overflow-hidden mb-[50px]">
        {/* 내부: 중앙 배치 */}
        <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
          <h1
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-3"
            style={{ textShadow: "0 6px 24px rgba(0,0,0,.5)" }}
          >
            회원가입
          </h1>

          <div
            className="rounded-2xl p-5 md:p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.04))",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.06) inset, 0 12px 40px rgba(0,0,0,.45)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* 단계 표시 */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>기본 정보</span>
                <span>기업 정보</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-white/60">
                {step}/2 단계
              </div>
            </div>

            {/* 폼 */}
            <form onSubmit={onSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <Field label="회사명">
                    <input
                      name="name"
                      value={f.name}
                      onChange={handleChange("name")}
                      required
                      placeholder="회사명"
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>

                  <Field label="사업자번호('-' 포함)">
                    <input
                      name="business_number"
                      value={f.business_number}
                      onChange={handleChange("business_number")}
                      required
                      inputMode="numeric"
                      placeholder="000-00-00000"
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>

                  <Field label="로그인 이메일">
                    <input
                      name="email"
                      type="email"
                      value={f.email}
                      onChange={handleChange("email")}
                      required
                      placeholder="you@example.com"
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>

                  <Field label="비밀번호 (8자 이상)">
                    <input
                      name="password"
                      type="password"
                      value={f.password}
                      onChange={handleChange("password")}
                      required
                      minLength={8}
                      placeholder="8자 이상"
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="대표 전화번호">
                    <input
                      name="phone"
                      value={f.phone}
                      onChange={handleChange("phone")}
                      placeholder="02-1234-5678"
                      required
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>

                  <Field label="대표자명">
                    <input
                      name="ceo_name"
                      value={f.ceo_name}
                      onChange={handleChange("ceo_name")}
                      placeholder="홍길동"
                      required
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>

                  {/* ===== 여기부터 업로드 방식으로 교체됨 ===== */}
                  <Field label="프로필 이미지 (선택)">
                    {/* 숨겨진 파일 인풋 */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePick}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="h-10 px-4 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50"
                        disabled={uploading}
                      >
                        {uploading
                          ? "업로드 중…"
                          : profileFile || f.profile_image_url
                          ? "이미지 변경"
                          : "이미지 선택"}
                      </button>

                      <div className="text-xs text-white/70 truncate">
                        {uploading && "이미지 업로드 중입니다…"}
                        {!uploading && f.profile_image_url && (
                          <span className="break-all">
                            업로드 완료: {f.profile_image_url}
                          </span>
                        )}
                        {!uploading && !f.profile_image_url && profileFile && (
                          <span className="truncate">{profileFile.name}</span>
                        )}
                        {!uploading &&
                          !profileFile &&
                          !f.profile_image_url && (
                            <span className="text-white/40">
                              이미지를 선택하세요
                            </span>
                          )}
                      </div>
                    </div>

                    {(profileFile || f.profile_image_url) && (
                      <div className="mt-3">
                        <img
                          src={
                            profileFile
                              ? URL.createObjectURL(profileFile)
                              : f.profile_image_url
                          }
                          alt="프로필 미리보기"
                          className="h-24 w-24 rounded-lg object-cover border border-white/10"
                        />
                      </div>
                    )}
                  </Field>
                  {/* ===== 업로드 UI 끝 ===== */}

                  <Field label="홈페이지 URL (선택)">
                    <input
                      name="homepage_url"
                      value={f.homepage_url}
                      onChange={handleChange("homepage_url")}
                      placeholder="https://..."
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-sm placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[.07] transition"
                    />
                  </Field>
                </>
              )}

              {err && <p className="text-xs text-red-300">{err}</p>}

              {/* 액션 */}
              <div className="pt-2 flex gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="h-12 flex-1 rounded-lg border border-white/15 text-white/90 hover:bg-white/5 transition"
                  >
                    이전
                  </button>
                )}

                {step === 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!step1Valid}
                    className="h-12 flex-1 rounded-lg bg-white text-black text-base font-semibold disabled:opacity-50 hover:bg-white/90 transition"
                  >
                    다음
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="submit"
                    disabled={loading || !step2Valid}
                    className="h-12 flex-1 rounded-lg bg-white text-black text-base font-semibold disabled:opacity-50 hover:bg-white/90 transition"
                  >
                    {loading ? "회원가입 중…" : "회원가입"}
                  </button>
                )}
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/login#top"
                  className="text-xs text-white/60 hover:text-white/90 underline underline-offset-4"
                >
                  이미 계정이 있으신가요? 로그인
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/** 공통 필드 래퍼 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] mb-1 tracking-wider text-white/70">
        {label}
      </span>
      {children}
    </label>
  );
}
