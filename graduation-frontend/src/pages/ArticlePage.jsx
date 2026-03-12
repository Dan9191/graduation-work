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
    const isAdmin = keycloak?.authenticated &&
        keycloak.hasRealmRole?.('graduation.admin');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const api = getApi();
                const res = await api.get(`/knowledge/api/v1/articles/${id}`);
                setArticle(res.data);
            } catch (err) {
                setError("Не удалось загрузить статью");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) {
            return;
        }

        try {
            const api = getApi();
            await api.delete(`/knowledge/api/v1/articles/${id}`);
            navigate('/articles');
        } catch (err) {
            alert('Не удалось удалить статью');
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;
    if (!article) return <div className="p-10">Статья не найдена</div>;

    return (
        <div className="container mx-auto px-8 py-10 max-w-4xl">
            {/* Админская панель */}
            {isAdmin && (
                <div className="flex gap-3 mb-8 pb-6 border-b-2 border-black">
                    <Link
                        to={`/articles/${id}/edit`}
                        className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition"
                    >
                        ✎ Редактировать
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition"
                    >
                        × Удалить
                    </button>
                </div>
            )}

            {/* Метаданные */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b-2 border-black pb-4">
                    {article.section && (
                        <Link
                            to={`/articles?sectionId=${article.section.id}`}
                            className="border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition"
                        >
                            {article.section.name}
                        </Link>
                    )}

                    <div className="flex gap-2">
                        {article.tags?.map(tag => (
                            <Link
                                key={tag.id}
                                to={`/articles?tagId=${tag.id}`}
                                className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>

                    <div className="ml-auto flex gap-4">
                        <span>👁 {article.viewCount || 0}</span>
                        <span> {new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                </div>
            </div>

            {/* Основное содержание */}
            {article.mainPicture && (
                <div className="mb-8 border-2 border-black p-1">
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

            {article.description && (
                <div className="mb-8 p-4 border-2 border-black bg-gray-50">
                    <p className="text-gray-700 italic">{article.description}</p>
                </div>
            )}
            {article.source && (
                <div className="mb-8 p-4 border-2 border-black bg-gray-50">
                    <p className="text-gray-700 italic">Источник : {article.source}</p>
                </div>
            )}

            <div className="article-body prose prose-lg max-w-none border-t-2 border-black pt-8">
                <ReactMarkdown>
                    {article.body || "*Текст статьи отсутствует*"}
                </ReactMarkdown>
            </div>
        </div>
    );
}