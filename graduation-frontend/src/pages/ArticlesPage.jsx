import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApi } from "../api/api";

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const PAGE_SIZE = 12;

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const api = getApi();
                const res = await api.get("/knowledge/api/v1/articles/all", {
                    params: {
                        page: currentPage,
                        size: PAGE_SIZE,
                        sortBy: "createdAt",
                        direction: "DESC",
                    },
                });

                setArticles(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                setError("Не удалось загрузить статьи");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;

    return (
        <div className="container px-8 py-10">
            {/* Панель пагинации сверху */}
            <div className="flex justify-center items-center gap-4 mb-8">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`border-2 border-black px-4 py-1.5 text-sm transition ${
                        currentPage === 0
                            ? 'opacity-30 cursor-default'
                            : 'hover:bg-black hover:text-white cursor-pointer'
                    }`}
                >
                    ←
                </button>

                <div className="border-2 border-black px-4 py-1.5 text-sm font-medium min-w-[80px] text-center">
                    {currentPage + 1} / {totalPages}
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`border-2 border-black px-4 py-1.5 text-sm transition ${
                        currentPage === totalPages - 1
                            ? 'opacity-30 cursor-default'
                            : 'hover:bg-black hover:text-white cursor-pointer'
                    }`}
                >
                    →
                </button>
            </div>

            {/* Сетка статей */}
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

            {/* Панель пагинации снизу */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`border-2 border-black px-4 py-1.5 text-sm transition ${
                        currentPage === 0
                            ? 'opacity-30 cursor-default'
                            : 'hover:bg-black hover:text-white cursor-pointer'
                    }`}
                >
                    ←
                </button>

                <div className="border-2 border-black px-4 py-1.5 text-sm font-medium min-w-[80px] text-center">
                    {currentPage + 1} / {totalPages}
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`border-2 border-black px-4 py-1.5 text-sm transition ${
                        currentPage === totalPages - 1
                            ? 'opacity-30 cursor-default'
                            : 'hover:bg-black hover:text-white cursor-pointer'
                    }`}
                >
                    →
                </button>
            </div>
        </div>
    );
}