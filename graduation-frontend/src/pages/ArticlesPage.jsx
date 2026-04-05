import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApi } from "../api/api";

function PaginationBar({ currentPage, totalPages, onPrev, onNext }) {
    return (
        <div className="flex justify-center items-center gap-3">
            <button
                onClick={onPrev}
                disabled={currentPage === 0}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition flex items-center justify-center ${
                    currentPage === 0
                        ? 'border-slate-200 text-slate-300 cursor-default'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
            >
                ←
            </button>

            <div
                className="px-4 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg min-w-[72px] text-center"
                style={{ fontFamily: "var(--mono)", color: "var(--accent)" }}
            >
                {currentPage + 1}/{totalPages}
            </div>

            <button
                onClick={onNext}
                disabled={currentPage === totalPages - 1}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition flex items-center justify-center ${
                    currentPage === totalPages - 1
                        ? 'border-slate-200 text-slate-300 cursor-default'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
            >
                →
            </button>
        </div>
    );
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const tagId = queryParams.get('tagId');
    const sectionId = queryParams.get('sectionId');

    const [currentTag, setCurrentTag] = useState(null);
    const [currentSection, setCurrentSection] = useState(null);

    const PAGE_SIZE = 12;

    useEffect(() => {
        const fetchFilterInfo = async () => {
            try {
                const api = getApi();
                if (tagId) {
                    const res = await api.get(`/knowledge/api/v1/tags/${tagId}`);
                    setCurrentTag(res.data);
                } else {
                    setCurrentTag(null);
                }
                if (sectionId) {
                    const res = await api.get(`/knowledge/api/v1/sections/${sectionId}`);
                    setCurrentSection(res.data);
                } else {
                    setCurrentSection(null);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchFilterInfo();
    }, [tagId, sectionId]);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const api = getApi();
                const params = { page: currentPage, size: PAGE_SIZE, sortBy: "createdAt", direction: "DESC" };
                if (tagId) params.tagId = tagId;
                if (sectionId) params.sectionId = sectionId;
                const res = await api.get("/knowledge/api/v1/articles/all", { params });
                setArticles(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            } catch (err) {
                setError("Не удалось загрузить статьи");
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [currentPage, tagId, sectionId]);

    const handlePrevPage = () => {
        if (currentPage > 0) { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };
    const clearFilters = () => { navigate('/articles'); setCurrentPage(0); };

    if (loading) return (
        <div className="flex items-center justify-center py-24 gap-2" style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: "0.85rem" }}>
            <span>&gt;</span>
            <span>loading articles</span>
            <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-24 text-red-500 text-sm" style={{ fontFamily: "var(--mono)" }}>
            ERR: {error}
        </div>
    );

    return (
        <div className="container">
            {/* Фильтры */}
            {(currentTag || currentSection) && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <span className="text-xs font-medium text-slate-400" style={{ fontFamily: "var(--mono)" }}>filter:</span>
                    {currentTag && (
                        <span className="border px-3 py-1 text-xs rounded font-medium"
                            style={{ fontFamily: "var(--mono)", borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-dim)" }}>
                            #{currentTag.name}
                        </span>
                    )}
                    {currentSection && (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs rounded font-medium"
                            style={{ fontFamily: "var(--mono)" }}>
                            §{currentSection.name}
                        </span>
                    )}
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-3 py-1 hover:bg-slate-100 transition"
                        style={{ fontFamily: "var(--mono)" }}
                    >
                        ✕ clear
                    </button>
                </div>
            )}

            {/* Пагинация сверху */}
            <div className="mb-8">
                <PaginationBar currentPage={currentPage} totalPages={totalPages} onPrev={handlePrevPage} onNext={handleNextPage} />
            </div>

            {/* Счётчик */}
            <div className="mb-5 text-xs text-slate-400" style={{ fontFamily: "var(--mono)" }}>
                <span style={{ color: "var(--accent)" }}>&gt;</span> found <span style={{ color: "var(--text)", fontWeight: 600 }}>{totalElements}</span> articles
            </div>

            {/* Сетка статей */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        to={`/articles/${article.id}`}
                        className="group flex flex-col bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-200"
                        style={{ textDecoration: "none", borderLeft: "3px solid transparent" }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderLeftColor = "var(--accent)";
                            e.currentTarget.style.boxShadow = "0 4px 18px var(--accent-glow)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderLeftColor = "transparent";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                        }}
                    >
                        <div className="font-semibold text-slate-900 text-sm mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {article.title || "Без названия"}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {article.section?.name && (
                                <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5 text-xs"
                                    style={{ fontFamily: "var(--mono)" }}>
                                    §{article.section.name}
                                </span>
                            )}
                            {article.tags?.slice(0, 2).map((t) => (
                                <span key={t.id} className="rounded px-2 py-0.5 text-xs"
                                    style={{ fontFamily: "var(--mono)", background: "var(--accent-dim)", color: "var(--accent)" }}>
                                    #{t.name}
                                </span>
                            ))}
                        </div>

                        {article.description && (
                            <div className="text-xs text-slate-500 line-clamp-3 flex-1 leading-relaxed">
                                {article.description}
                            </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400"
                            style={{ fontFamily: "var(--mono)" }}>
                            {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                    </Link>
                ))}

                {articles.length === 0 && (
                    <div className="col-span-4 text-center py-24"
                        style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: "0.85rem" }}>
                        <div className="mb-2" style={{ color: "var(--accent)" }}>&gt; query returned 0 results</div>
                        {(currentTag || currentSection) && (
                            <button onClick={clearFilters} className="mt-3 underline text-xs"
                                style={{ color: "var(--accent)", fontFamily: "var(--mono)", cursor: "pointer", background: "none", border: "none" }}>
                                clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Пагинация снизу */}
            {totalPages > 1 && (
                <div className="mt-10">
                    <PaginationBar currentPage={currentPage} totalPages={totalPages} onPrev={handlePrevPage} onNext={handleNextPage} />
                </div>
            )}
        </div>
    );
}
