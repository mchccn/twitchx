import Fuse from "fuse.js";
import hljs from "highlight.js";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import data from "../data.json";
import docs from "../docs.json";
import Sidebar from "./Sidebar";

export default function Docs({ search, setSearch }: { search: string; setSearch: Dispatch<SetStateAction<string>> }) {
    useEffect(() => {
        hljs.configure({
            languages: ["typescript"],
        });

        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, []);

    const { route } = useParams<{ route: string }>();

    if (!route && !search) return <Redirect to="/docs/general/welcome" />;

    const pages = docs.categories.flatMap(({ name, pages }) => pages.map((page) => ({ category: name, ...page })));

    const catalog = [
        ...data.classes.map(({ name }) => ({
            category: "classes",
            name,
            slug: name.toLowerCase(),
            content: "",
        })),
        ...data.typedefs.map(({ name }) => ({
            category: "typedefs",
            name,
            slug: name.toLowerCase(),
            content: "",
        })),
        ...data.externals.map(({ name }) => ({
            category: "externals",
            name,
            slug: name.toLowerCase(),
            content: "",
        })),
    ];

    const fuse = new Fuse(catalog, {
        keys: ["name"],
    });

    return (
        <div className="flex flex-1">
            <Sidebar active={route} />
            <main
                className="docs flex-1 px-4 lg:pr-0 py-3 dark:text-white overflow-y-scroll"
                style={{ maxHeight: "calc(100vh - 3rem)" }}
            >
                {search ? (
                    <div>
                        <h2 className="font-light text-2xl py-1 border-b border-gray-300 dark:border-gray-400 mb-2">
                            Search results
                        </h2>
                        <ul className="flex flex-col gap-1">
                            {fuse.search(search).map(({ item }) => (
                                <li className="flex items-center gap-2">
                                    <span className="text-xl text-purple dark:text-lightPurple select-none">
                                        {
                                            { classes: "🄲", typedefs: "🅃", externals: "🄴", interfaces: "🅸", meta: "" }[
                                                item.category as keyof typeof data
                                            ]
                                        }
                                    </span>
                                    <Link
                                        className="dark:text-gray-100"
                                        to={`/docs/${item.category.toLowerCase()}/${item.slug}`}
                                        onClick={() => setSearch("")}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : docs.categories.some(({ name }) => route.startsWith(name.toLowerCase())) &&
                  pages
                      .map(({ category, slug }) => ({ category, slug }))
                      .some(({ category, slug }) => route.startsWith(`${category.toLowerCase()}/${slug}`)) ? (
                    <div
                        className="markdown"
                        dangerouslySetInnerHTML={{
                            __html: pages.find(({ category, slug }) =>
                                route.startsWith(`${category.toLowerCase()}/${slug}`)
                            )!.content,
                        }}
                    ></div>
                ) : catalog.some(({ category, slug }) => route.startsWith(`${category.toLowerCase()}/${slug}`)) ? (
                    <div
                        className="markdown"
                        dangerouslySetInnerHTML={{
                            __html: catalog.find(({ category, slug }) =>
                                route.startsWith(`${category.toLowerCase()}/${slug}`)
                            )!.content,
                        }}
                    ></div>
                ) : (
                    <Redirect to="/docs/general/welcome" />
                )}
            </main>
        </div>
    );
}
