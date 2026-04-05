import { useState } from 'react';
import { getApi } from '../api/api';
import { getKeycloak } from '../auth/keycloak';
import ReactMarkdown from 'react-markdown';

function TerminalWindow({ children, title = "bash" }) {
    return (
        <div style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            overflow: "hidden",
            fontFamily: "var(--mono)",
            fontSize: "0.875rem",
            lineHeight: "1.6",
        }}>
            {/* Titlebar */}
            <div style={{
                background: "#1e293b",
                padding: "10px 16px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "6px",
                borderBottom: "1px solid #334155",
            }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", flexShrink: 0, display: "inline-block" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b", flexShrink: 0, display: "inline-block" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e", flexShrink: 0, display: "inline-block" }} />
                <span style={{ marginLeft: "12px", fontSize: "0.75rem", color: "#64748b" }}>
                    {title}
                </span>
            </div>
            {/* Body */}
            <div style={{ padding: "20px 24px", color: "#94a3b8" }}>
                {children}
            </div>
        </div>
    );
}

export default function VectorSearchPage() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const keycloak = getKeycloak();

    if (!keycloak?.authenticated) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-16">
                <TerminalWindow title="access denied">
                    <div className="terminal-line terminal-prompt">&gt; checking auth status...</div>
                    <div className="terminal-line" style={{ color: "#ef4444" }}>&gt; ERROR: unauthenticated</div>
                    <div className="terminal-line mt-2" style={{ color: "#94a3b8" }}>
                        Необходимо авторизоваться для доступа к этой странице.
                    </div>
                </TerminalWindow>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResponse('');

        try {
            await keycloak.updateToken(30).catch(() => {});
            const api = getApi();
            const res = await api.post('/embedding/api/v1/rag/answer', { query: query.trim() });
            setResponse(res.data.response || res.data.answer || '');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Ошибка при выполнении запроса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Векторный поиск</h1>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Полоска-хедер формы */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                        <span className="text-xs" style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                            &gt; enter query
                        </span>
                        <span className="cursor-blink" style={{ display: "inline-block" }} />
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Что хотите найти?"
                        rows={5}
                        className="w-full px-4 py-3 text-sm bg-white text-slate-900 resize-y min-h-[120px] focus:outline-none"
                        style={{ fontFamily: "var(--mono)", borderBottom: "none" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        fontFamily: "var(--mono)",
                        background: "var(--accent)",
                        color: "white",
                        border: "none",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--accent-hover)"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "var(--accent)"; }}
                >
                    {loading ? '$ executing...' : '$ run query'}
                </button>
            </form>

            {/* Загрузка */}
            {loading && (
                <TerminalWindow title="rag-engine — running">
                    <div style={{ marginBottom: "6px", color: "var(--nav-accent)" }}>&gt; INIT VECTOR QUERY ENGINE</div>
                    <div style={{ marginBottom: "6px", color: "var(--nav-accent)" }}>&gt; TOKEN OK</div>
                    <div style={{ marginTop: "4px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>&gt; SEARCHING</span>
                        <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                    </div>
                </TerminalWindow>
            )}

            {/* Ошибка */}
            {error && (
                <TerminalWindow title="stderr">
                    <div style={{ color: "#ef4444" }}>
                        ERR: {error}
                    </div>
                </TerminalWindow>
            )}

            {/* Ответ */}
            {response && (
                <div>
                    {/* Заголовок ответа */}
                    <div className="flex items-center gap-2 mb-3 text-xs"
                        style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                        <span style={{ color: "var(--accent)" }}>&gt;</span>
                        <span>response received</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm prose prose-slate prose-base max-w-none"
                        style={{ borderLeft: "3px solid var(--accent)" }}>
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
