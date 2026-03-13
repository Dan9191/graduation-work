import { useState } from 'react';
import { getApi } from '../api/api';
import { getKeycloak } from '../auth/keycloak';
import ReactMarkdown from 'react-markdown';

export default function VectorSearchPage() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const keycloak = getKeycloak();

    if (!keycloak?.authenticated) {
        return (
            <div className="p-[30px] text-center text-[18px] border-2 border-black bg-white">
                Необходимо авторизоваться для доступа к этой странице.
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
            await keycloak.updateToken(30).catch(() => { /* silent */ });

            const api = getApi();

            const res = await api.post('/embedding/api/v1/rag/answer', {
                query: query.trim(),
            });

            // Предполагаем, что ответ приходит в поле response (как в вашем примере)
            setResponse(res.data.response || res.data.answer || '');
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Ошибка при выполнении векторного поиска'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Векторный поиск</h1>
            </div>

            <form onSubmit={handleSubmit} className="mb-[30px]">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите ваш вопрос..."
                    rows={5}
                    className="
                        w-full
                        p-[14px]
                        border-2 border-black
                        bg-white
                        text-[16px]
                        font-medium
                        resize-y
                        min-h-[120px]
                        focus:bg-[#f8f8f8]
                        transition-colors
                    "
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-4
                        px-8 py-3
                        border-2 border-black
                        bg-black text-white
                        font-medium
                        text-[15px]
                        hover:bg-[#222]
                        active:bg-[#000]
                        disabled:bg-[#888]
                        disabled:text-[#ccc]
                        disabled:cursor-not-allowed
                        transition-colors
                    "
                >
                    {loading ? 'ОБРАБОТКА...' : 'ЗАДАТЬ ВОПРОС'}
                </button>
            </form>

            {loading && (
                <div className="
                    py-16 px-8
                    font-mono text-[15px] leading-6
                    text-black bg-white
                    border-2 border-black
                    max-w-2xl mx-auto
                    flex flex-col items-start
                ">
                    <div className="mb-3 opacity-70">{"> INITIALIZING VECTOR QUERY ENGINE..."}</div>
                    <div className="mb-1 opacity-70">{"> TOKEN VALIDATED"}</div>
                    <div className="mb-4 text-black font-medium flex items-center">
                        {"> SENDING QUERY"}
                        <span className="loading-dots ml-1">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    </div>
                </div>
            )}

            {error && (
                <div className="
                    p-[18px]
                    border-2 border-black
                    bg-white
                    text-[#c00]
                    font-medium
                ">
                    Ошибка: {error}
                </div>
            )}

            {response && (
                <div className="
                    border-2 border-black
                    bg-white
                    p-[24px]
                    prose
                    prose-lg
                    max-w-none
                    [&_*]:!text-black
                    [&_a]:underline
                    [&_pre]:bg-[#f8f8f8]
                    [&_pre]:p-4
                    [&_pre]:border-2
                    [&_pre]:border-black
                    [&_code]:bg-[#f0f0f0]
                ">
                    <ReactMarkdown>{response}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}