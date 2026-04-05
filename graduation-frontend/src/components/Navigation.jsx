import { useLocation, Link } from "react-router-dom";
import { getKeycloak } from "../auth/keycloak";

const baseMenuItems = [
    { label: "articles", path: "/articles" },
    { label: "tags",     path: "/tags"     },
    { label: "sections", path: "/sections" },
];

const authMenuItems = [
    { label: "vector-search",  path: "/vector-search"  },
    { label: "visualization",  path: "/visualization"  },
];

export default function Navigation() {
    const location = useLocation();
    const keycloak = getKeycloak();
    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");
    const showAuthItems = keycloak?.authenticated;

    return (
        <header>
            <div className="max-w-6xl mx-auto px-6 py-0 flex items-stretch">
                {/* Brand */}
                <Link
                    to="/articles"
                    className="flex items-center gap-1.5 pr-6 mr-2 border-r border-slate-700 py-3.5 shrink-0"
                    style={{ textDecoration: "none" }}
                >
                    <span style={{
                        fontFamily: "var(--mono)",
                        color: "var(--nav-accent)",
                        fontWeight: 600,
                        fontSize: "1rem",
                        letterSpacing: "-0.02em",
                    }}>
                        &gt;_
                    </span>
                    <span style={{
                        fontFamily: "var(--mono)",
                        color: "#f1f5f9",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                    }}>
                        knowledge-base
                    </span>
                </Link>

                {/* Nav links */}
                <nav className="flex items-stretch gap-1 px-4">
                    {baseMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-3 text-sm transition-colors"
                            style={{
                                fontFamily: "var(--mono)",
                                textDecoration: "none",
                                borderBottom: isActive(item.path)
                                    ? "2px solid var(--nav-accent)"
                                    : "2px solid transparent",
                                color: isActive(item.path)
                                    ? "var(--nav-accent)"
                                    : "var(--nav-text)",
                                paddingTop: "0.875rem",
                                paddingBottom: "0.875rem",
                            }}
                            onMouseEnter={e => {
                                if (!isActive(item.path))
                                    e.currentTarget.style.color = "#f1f5f9";
                            }}
                            onMouseLeave={e => {
                                if (!isActive(item.path))
                                    e.currentTarget.style.color = "var(--nav-text)";
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {showAuthItems && authMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-3 text-sm transition-colors"
                            style={{
                                fontFamily: "var(--mono)",
                                textDecoration: "none",
                                borderBottom: isActive(item.path)
                                    ? "2px solid var(--nav-accent)"
                                    : "2px solid transparent",
                                color: isActive(item.path)
                                    ? "var(--nav-accent)"
                                    : "var(--nav-text)",
                                paddingTop: "0.875rem",
                                paddingBottom: "0.875rem",
                            }}
                            onMouseEnter={e => {
                                if (!isActive(item.path))
                                    e.currentTarget.style.color = "#f1f5f9";
                            }}
                            onMouseLeave={e => {
                                if (!isActive(item.path))
                                    e.currentTarget.style.color = "var(--nav-text)";
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth button */}
                <div className="ml-auto flex items-center">
                    {!keycloak?.authenticated ? (
                        <button
                            onClick={() => keycloak?.login()}
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.8rem",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                padding: "6px 16px",
                                background: "transparent",
                                color: "var(--nav-text)",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "var(--nav-accent)";
                                e.currentTarget.style.color = "var(--nav-accent)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#334155";
                                e.currentTarget.style.color = "var(--nav-text)";
                            }}
                        >
                            $ login
                        </button>
                    ) : (
                        <button
                            onClick={() => keycloak?.logout()}
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.8rem",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                padding: "6px 16px",
                                background: "transparent",
                                color: "#f87171",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#f87171";
                                e.currentTarget.style.background = "rgba(248,113,113,0.08)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#334155";
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            $ logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
