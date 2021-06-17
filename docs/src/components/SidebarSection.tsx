import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SidebarSection({
    name,
    pages,
    active,
    close,
}: typeof import("../docs.json")["categories"][number] & { active: string; close: () => void }) {
    const [open, setOpen] = useState(true);
    const [hidden, setHidden] = useState(!open);

    useEffect(() => {
        if (open) setTimeout(() => setHidden(false), 150);
        else setHidden(true);
    }, [open]);

    return (
        <div>
            <div className="flex items-center gap-2">
                <button
                    className={`text-sm text-gray-700 dark:text-gray-100 transform ${
                        open ? "" : "-rotate-90"
                    } transition-transform outline-none focus:outline-none`}
                    onClick={() => setOpen(!open)}
                >
                    ▼
                </button>
                <h2 className="text-purple dark:text-lightestPurple select-none">{name}</h2>
            </div>
            <ul
                className="pl-1"
                style={{
                    overflow: hidden ? "hidden" : "",
                    height: !open ? 0 : pages.length * 20,
                    transition: "0.15s ease height",
                }}
            >
                {pages.map((page) => (
                    <li
                        key={`${name.toLowerCase()}/${page.slug}`}
                        className={`pl-5 flex border-l-2 hover:border-lightPurple ${
                            active === `${name.toLowerCase()}/${page.slug}`
                                ? "border-lightPurple"
                                : "dark:border-gray-600"
                        }`}
                    >
                        <Link
                            className={`block flex-1 text-sm ${
                                active === `${name.toLowerCase()}/${page.slug}`
                                    ? "text-gray-900 dark:text-gray-100"
                                    : "text-gray-700 dark:text-gray-500"
                            }`}
                            to={{ pathname: `/docs/${name.toLowerCase()}/${page.slug}` }}
                            onClick={close}
                        >
                            {page.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
