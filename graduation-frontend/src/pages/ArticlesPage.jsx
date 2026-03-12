import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApi } from "../api/api";

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

    // Получаем параметры фильтрации из URL
    const tagId = queryParams.get('tagId');
    const sectionId = queryParams.get('sectionId');

    // Для отображения текущего фильтра
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
                console.error('Не удалось загрузить информацию о фильтре', err);
            }
        };

        fetchFilterInfo();
    }, [tagId, sectionId]);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const api = getApi();
                const params = {
                    page: currentPage,
                    size: PAGE_SIZE,
                    sortBy: "createdAt",
                    direction: "DESC",
                };

                // Добавляем фильтры, если они есть
                if (tagId) params.tagId = tagId;
                if (sectionId) params.sectionId = sectionId;

                const res = await api.get("/knowledge/api/v1/articles/all", { params });

                setArticles(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            } catch (err) {
                setError("Не удалось загрузить статьи");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [currentPage, tagId, sectionId]);

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

    const clearFilters = () => {
        navigate('/articles');
        setCurrentPage(0);
    };

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;

    return (
        <div className="container px-8 py-10">
            {/* Информация о фильтрах */}
            {(currentTag || currentSection) && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black">
                    <span className="text-sm font-medium">Фильтр:</span>
                    {currentTag && (
                        <span className="border-2 border-black px-3 py-1 text-sm bg-gray-100">
                            Тег: #{currentTag.name}
                        </span>
                    )}
                    {currentSection && (
                        <span className="border-2 border-black px-3 py-1 text-sm bg-gray-100">
                            Секция: {currentSection.name}
                        </span>
                    )}
                    <button
                        onClick={clearFilters}
                        className="border-2 border-black px-3 py-1 text-sm hover:bg-black hover:text-white transition ml-auto"
                    >
                        ✕ Сбросить
                    </button>
                </div>
            )}

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

            {/* Счетчик результатов */}
            <div className="text-sm text-gray-600 mb-4">
                Найдено статей: {totalElements}
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

                {/* Если статей нет */}
                {articles.length === 0 && !loading && (
                    <div className="col-span-4 text-center py-20 border-2 border-black">
                        <p className="text-gray-500">Статьи не найдены</p>
                        {(currentTag || currentSection) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition"
                            >
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Панель пагинации снизу */}
            {totalPages > 1 && (
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
            )}
        </div>
    );
}