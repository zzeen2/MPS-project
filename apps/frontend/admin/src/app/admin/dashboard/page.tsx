'use client';

export default function DashboardPage() {
    async function logout() {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/admin';
    }
    return (
    <main className="p-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2">로그인 성공!</p>
        <button onClick={logout} className="mt-4 rounded bg-gray-900 px-3 py-2 text-white">
            로그아웃
        </button>
    </main>
    );
}