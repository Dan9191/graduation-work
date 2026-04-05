import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getApi } from "../api/api";
import { getKeycloak } from "../auth/keycloak";

export default function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const keycloak = getKeycloak();
    const isAdmin = keycloak?.authenticated && keycloak.hasRealmRole?.('graduation.admin');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const api = getApi();
                const res = await api.get(`/knowledge/api/v1/articles/${id}`);
                setArticle(res.data);
            } catch (err) {
                setError("Не удалось загрузить статью");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) return;
        try {
            await getApi().delete(`/knowledge/api/v1/articles/${id}`);
            navigate('/articles');
        } catch (err) {
            alert('Не удалось удалить статью');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24 gap-2"
            style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: "0.85rem" }}>
            <span>&gt;</span>
            <span>loading article</span>
            <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-24 text-sm"
            style={{ fontFamily: "var(--mono)", color: "#ef4444" }}>
            ERR: {error}
        </div>
    );

    if (!article) return (
        <div className="flex items-center justify-center py-24 text-sm"
            style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
            &gt; 404: article not found
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Хлебная крошка */}
            <div className="flex items-center gap-2 mb-6 text-xs"
                style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                <Link to="/articles" className="hover:underline" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    ~/articles
                </Link>
                <span>/</span>
                <span className="text-slate-600 truncate max-w-xs">{article.title}</span>
            </div>

            {/* Заголовок */}
            <h1 className="text-3xl font-bold leading-tight mb-5" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                {article.title}
            </h1>

            {/* Метаданные */}
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-5 border-b border-slate-200">
                {article.section && (
                    <Link
                        to={`/articles?sectionId=${article.section.id}`}
                        className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium transition"
                        style={{ fontFamily: "var(--mono)", color: "var(--text)", textDecoration: "none" }}
                    >
                        §{article.section.name}
                    </Link>
                )}

                {article.tags?.map(tag => (
                    <Link
                        key={tag.id}
                        to={`/articles?tagId=${tag.id}`}
                        className="px-3 py-1 rounded text-xs font-medium transition"
                        style={{
                            fontFamily: "var(--mono)",
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            border: "1px solid var(--border-hover)",
                            textDecoration: "none",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--accent-glow)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--accent-dim)"}
                    >
                        #{tag.name}
                    </Link>
                ))}

                <div className="ml-auto flex items-center gap-4 text-xs"
                    style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                    <span>views:{article.viewCount || 0}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>

            {/* Админ-панель */}
            {isAdmin && (
                <div className="flex gap-3 mb-8 p-4 rounded-xl border"
                    style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                    <span className="text-xs self-center mr-2"
                        style={{ fontFamily: "var(--mono)", color: "#92400e" }}>
                        [admin]
                    </span>
                    <Link
                        to={`/articles/${id}/edit`}
                        className="text-xs font-medium px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                        style={{ fontFamily: "var(--mono)", textDecoration: "none" }}
                    >
                        edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="text-xs font-medium px-4 py-2 rounded-lg bg-white border hover:bg-red-50 transition"
                        style={{ fontFamily: "var(--mono)", borderColor: "#fca5a5", color: "#991b1b" }}
                    >
                        delete
                    </button>
                </div>
            )}

            {/* Изображение */}
            {article.mainPicture && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-200">
                    <img
                        src={article.mainPicture}
                        alt={article.title}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Описание */}
            {article.description && (
                <div className="mb-6 p-4 rounded-xl border-l-4 bg-slate-50 border border-slate-200 text-slate-600 italic text-sm leading-relaxed"
                    style={{ borderLeftColor: "var(--accent)" }}>
                    {article.description}
                </div>
            )}

            {/* Источник */}
            {article.source && (
                <div className="mb-6 p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                    style={{ fontFamily: "var(--mono)" }}>
                    <span style={{ color: "var(--muted)" }}>source: </span>
                    <span className="text-slate-700">{article.source}</span>
                </div>
            )}

            {/* Тело статьи */}
            <div className="article-body prose prose-slate prose-base max-w-none">
                <ReactMarkdown>{article.body || "*Текст статьи отсутствует*"}</ReactMarkdown>
            </div>
        </div>
    );
}
