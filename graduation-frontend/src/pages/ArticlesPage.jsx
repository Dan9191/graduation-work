import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApi } from "../api/api";

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const api = getApi();
                const res = await api.get("/knowledge/api/v1/articles/all", {
                    params: {
                        page: 0,
                        size: 12,           // TODO потом сделаю пагинацию
                        sortBy: "createdAt",
                        direction: "DESC",
                    },
                });
                setArticles(res.data.content || []);
            } catch (err) {
                setError("Не удалось загрузить статьи");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;

    return (
        <div className="container px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        to={`/articles/${article.id}`}
                        className="card border-2 border-black p-5 bg-white hover:bg-gray-50 transition"
                    >
                        <div className="title font-semibold text-lg mb-2">{article.title || "Без названия"}</div>
                        <div className="meta text-sm text-gray-600">
                            {article.section?.name || "—"} •{" "}
                            {article.tags?.map((t) => t.name).join(", ") || "без тегов"} •{" "}
                            {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                        {article.description && (
                            <div className="description mt-3 text-sm text-gray-700 line-clamp-3">
                                {article.description}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}