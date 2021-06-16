import Fuse from "fuse.js";
import hljs from "highlight.js";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import data from "../data.json";
import docs from "../docs.json";
import Sidebar from "./Sidebar";

export default function Docs({ search, setSearch }: { search: string; setSearch: Dispatch<SetStateAction<string>> }) {
    const { route } = useParams<{ route: string }>();

    const [documentation, setDocumentation] = useState<ReactNode | undefined>();

    const pages = docs.categories.flatMap(({ name, pages }) => pages.map((page) => ({ category: name, ...page })));

    const catalog = [
        ...data.classes.map(({ name }) => ({
            category: "classes",
            name,
            slug: name.toLowerCase(),
        })),
        ...data.typedefs.map(({ name }) => ({
            category: "typedefs",
            name,
            slug: name.toLowerCase(),
        })),
        ...data.externals.map(({ name }) => ({
            category: "externals",
            name,
            slug: name.toLowerCase(),
        })),
    ];

    useEffect(() => {
        setDocumentation(
            (() => {
                if (
                    !route ||
                    !catalog.find(({ category, slug }) => route.toLowerCase() === `${category}/${slug}`.toLowerCase())
                )
                    return;

                const name = catalog.find(
                    ({ category, slug }) => route.toLowerCase() === `${category}/${slug}`.toLowerCase()
                )!.name;

                const info = data.classes.find((cls) => cls.name === name)
                    ? ({ ...data.classes.find((cls) => cls.name === name)!, type: "class" } as const)
                    : data.typedefs.find((t) => t.name === name)
                    ? ({ ...data.typedefs.find((t) => t.name === name)!, type: "typedef" } as const)
                    : data.externals.find((ext) => ext.name === name)
                    ? ({ ...data.externals.find((ext) => ext.name === name), type: "external" } as const)
                    : undefined;

                if (!info) {
                    console.error(`error`);

                    return;
                }

                if (info.type === "class") {
                    return (
                        <div className="markdown">
                            <h1>{info.name}</h1>

                            <pre>
                                <code className="hljs code-javascript">{`new Twitch.${info.name}()`}</code>
                            </pre>
                        </div>
                    );
                }

                if (info.type === "typedef") {
                    return (
                        <div className="markdown">
                            <h1>{info.name}</h1>
                        </div>
                    );
                }

                if (info.type === "external") {
                    return (
                        <div className="markdown">
                            <h1>{info.name}</h1>
                        </div>
                    );
                }

                return;
            })()
        );

        setImmediate(() => {
            hljs.configure({
                languages: ["typescript"],
            });

            document.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        });
    }, [route]);

    if (!route && !search) return <Redirect to="/docs/general/welcome" />;

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
                            {new Fuse(catalog, {
                                keys: ["name"],
                            })
                                .search(search)
                                .map(({ item }) => (
                                    <li className="flex items-center gap-2">
                                        <span className="text-xl text-purple dark:text-lightPurple select-none">
                                            {
                                                {
                                                    classes: "🄲",
                                                    typedefs: "🅃",
                                                    externals: "🄴",
                                                    interfaces: "🅸",
                                                    meta: "",
                                                }[item.category as keyof typeof data]
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
                ) : pages
                      .map(({ category, slug }) => ({ category, slug }))
                      .some(
                          ({ category, slug }) =>
                              route.toLowerCase() === `${category.toLowerCase()}/${slug}`.toLowerCase()
                      ) ? (
                    <div
                        className="markdown"
                        dangerouslySetInnerHTML={{
                            __html: pages.find(
                                ({ category, slug }) =>
                                    route.toLowerCase() === `${category.toLowerCase()}/${slug}`.toLowerCase()
                            )!.content,
                        }}
                    ></div>
                ) : catalog.some(
                      ({ category, slug }) => route.toLowerCase() === `${category}/${slug}`.toLowerCase()
                  ) ? (
                    documentation
                ) : (
                    <Redirect to="/docs/general/welcome" />
                )}
            </main>
        </div>
    );
}
