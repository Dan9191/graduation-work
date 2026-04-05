import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ArticlesPage from "./pages/ArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import CreateArticlePage from "./pages/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import TagsPage from "./pages/TagsPage";
import SectionsPage from "./pages/SectionsPage";
import VectorSearchPage from "./pages/VectorSearchPage";

function VisualizationPage() { return <div className="p-10">Визуализация — в разработке</div>; }

export default function App() {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
            <Navigation />

            <Routes>
                <Route path="/" element={<ArticlesPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:id" element={<ArticlePage />} />
                <Route path="/articles/:id/edit" element={<EditArticlePage />} />
                <Route path="/articles/new" element={<CreateArticlePage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/sections" element={<SectionsPage />} />
                <Route path="/vector-search" element={<VectorSearchPage />} />
                <Route path="/visualization" element={<VisualizationPage />} />

                <Route path="*" element={<div className="p-10">404 — страница не найдена</div>} />
            </Routes>
        </div>
    );
}