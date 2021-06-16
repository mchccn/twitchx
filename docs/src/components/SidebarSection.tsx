import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SidebarSection({
    name,
    pages,
    active,
}: typeof import("../docs.json")["categories"][number] & { active: string }) {
    const [open, setOpen] = useState(true);

    return (
        <div>
            <div className="flex items-center gap-2">
                <button
                    className={`text-sm text-gray-700 dark:text-gray-100 transform ${
                        open ? "" : "-rotate-90"
                    } outline-none focus:outline-none`}
                    onClick={() => setOpen(!open)}
                >
                    ▼
                </button>
                <h2 className="text-purple dark:text-lightPurple select-none">{name}</h2>
            </div>
            <ul className={`pl-1 ${open ? "" : "h-0 overflow-hidden"}`}>
                {pages.map((page) => (
                    <li
                        key={`${name.toLowerCase()}/${page.slug}`}
                        className={`pl-5 flex border-l-2 ${
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
                        >
                            {page.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
