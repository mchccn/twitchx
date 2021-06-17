import Fuse from "fuse.js";
import hljs from "highlight.js";
import markdown from "markdown-it";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import data from "../data.json";
import docs from "../docs.json";
import Class from "./Class";
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

    const md = new markdown({
        html: true,
        linkify: true,
        xhtmlOut: true,
    });

    useEffect(() => {
        const NATIVE = {
            string: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
            boolean: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean",
            number: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number",
            object: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
            function: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function",
            Array: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
            Promise: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
            undefined: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined",
        } as const;

        const NODEJS = {
            EventEmitter: "https://nodejs.org/api/all.html#events_class_eventemitter",
        } as const;

        const REGEX = {
            IDENTIFIER: new RegExp(
                `(${[...catalog]
                    .sort((a, b) => b.name.length - a.name.length)
                    .map(({ name }) => name)
                    .join("|")})`,
                "g"
            ),
            NODEJS: new RegExp(
                `(${Object.keys(NODEJS)
                    .sort((a, b) => b.length - a.length)
                    .join("|")})`,
                "g"
            ),
            NATIVE: new RegExp(
                `(${Object.keys(NATIVE)
                    .sort((a, b) => b.length - a.length)
                    .join("|")})`,
                "g"
            ),
        } as const;

        const resolveType = (type: string[][][], removeUndefined?: boolean) => type.flat(2).join("");

        const applyStyles = (string: string) =>
            md.renderInline(
                string
                    .replace(
                        REGEX.IDENTIFIER,
                        (match) => `[${match}](#/docs/${catalog.find(({ name }) => name === match)!.category}/${match})`
                    )
                    .replace(REGEX.NODEJS, (match) => `[${match}](${NODEJS[match as keyof typeof NODEJS]})`)
                    .replace(REGEX.NATIVE, (match) => `[${match}](${NATIVE[match as keyof typeof NATIVE]})`)
            );

        setDocumentation(
            // ! Implement scrollTo query parameter.

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
                    return <Class info={info} applyStyles={applyStyles} resolveType={resolveType} md={md} />;
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

    if (!route && typeof search === "undefined") return <Redirect to="/docs/general/welcome" />;

    if (!route && !search) return null;

    return (
        <div className="flex flex-1">
            <Sidebar active={route} />
            <main
                className="docs flex-1 pl-6 pr-4 py-3 lg:px-4 dark:text-white overflow-y-scroll"
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
                                                    interfaces: "🄸",
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
