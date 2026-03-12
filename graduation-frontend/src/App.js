import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ArticlesPage from "./pages/ArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import TagsPage from "./pages/TagsPage";

function SectionsPage() { return <div className="p-10">Секции — в разработке</div>; }
function VectorSearchPage() { return <div className="p-10">Векторный поиск — в разработке</div>; }
function VisualizationPage() { return <div className="p-10">Визуализация — в разработке</div>; }

export default function App() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Navigation />

            <Routes>
                <Route path="/" element={<ArticlesPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:id" element={<ArticlePage />} />
                <Route path="/articles/:id/edit" element={<EditArticlePage />} />

                <Route path="/tags" element={<TagsPage />} /> {/* Обновленный маршрут */}
                <Route path="/sections" element={<SectionsPage />} />
                <Route path="/vector-search" element={<VectorSearchPage />} />
                <Route path="/visualization" element={<VisualizationPage />} />

                <Route path="*" element={<div className="p-10">404 — страница не найдена</div>} />
            </Routes>
        </div>
    );
}