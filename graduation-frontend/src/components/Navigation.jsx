import { useLocation, Link } from "react-router-dom";
import { getKeycloak } from "../auth/keycloak";

const baseMenuItems = [
    { label: "Статьи", path: "/articles" },
    { label: "Теги", path: "/tags" },
    { label: "Секции", path: "/sections" },
];

const authMenuItems = [
    { label: "Векторный поиск", path: "/vector-search" },
    { label: "Визуализация", path: "/visualization" },
];

export default function Navigation() {
    const location = useLocation();
    const keycloak = getKeycloak();
    const isActive = (path) => location.pathname === path;
    const showAuthItems = keycloak?.authenticated;

    return (
        <header className="border-b-2 border-black px-5 py-3.5">
            <div className="menu flex gap-8 font-medium text-base">
                {baseMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`cursor-pointer transition-all ${
                            isActive(item.path)
                                ? "border-b-4 border-black pb-1"
                                : "hover:border-b-2 hover:border-black hover:pb-0.5"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}

                {showAuthItems && authMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`cursor-pointer transition-all ${
                            isActive(item.path)
                                ? "border-b-4 border-black pb-1"
                                : "hover:border-b-2 hover:border-black hover:pb-0.5"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}

                <div className="ml-auto">
                    {!keycloak?.authenticated ? (
                        <button
                            onClick={() => keycloak?.login()}
                            className="border-2 border-black px-4 py-1 hover:bg-gray-100 transition"
                        >
                            Логин
                        </button>
                    ) : (
                        <button
                            onClick={() => keycloak?.logout()}
                            className="border-2 border-black px-4 py-1 text-red-800 hover:bg-gray-100 transition"
                        >
                            Выйти
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}