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

        const resolveType = (type: string[][][], removeUndefined?: boolean) => {
            const stack = [] as boolean[];

            return type
                .flat(2)
                .filter((t) => (removeUndefined ? t !== "undefined" : true))
                .reduce((result, type, index, array) => {
                    const next = array[index + 1] ?? "";

                    if (next.endsWith(">")) {
                        if (typeof stack.pop() === "undefined") throw new Error(`improper generic`);

                        return result + type;
                    }

                    if (next.startsWith("<")) {
                        stack.push(true);

                        return result + type;
                    }

                    if (stack.length || !result) return result + type;

                    return result + " | " + type;
                }, "")
                .replace(/\)>/g, ">")
                .replace(/<\(/g, "<")
                .replace(/(?<!\s)\|(?!\s)/g, " | ")
                .replace(/>(\w)/g, "> | $1")
                .replace(/\s*\|\s*>/, ">");
        };

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
                    ? ({ ...data.classes.find((cls) => cls.name === name)!, docType: "class" } as const)
                    : data.typedefs.find((t) => t.name === name)
                    ? ({ ...data.typedefs.find((t) => t.name === name)!, docType: "typedef" } as const)
                    : data.externals.find((ext) => ext.name === name)
                    ? ({ ...data.externals.find((ext) => ext.name === name), docType: "external" } as const)
                    : undefined;

                if (!info) {
                    console.error(`error`);

                    return;
                }

                if (info.docType === "class") {
                    return <Class info={info} applyStyles={applyStyles} resolveType={resolveType} md={md} />;
                }

                if (info.docType === "typedef") {
                    return (
                        <div className="markdown">
                            <h1 className="flex flex-col justify-between">
                                <span>{info.name}</span>
                                {resolveType(info.type).toLowerCase() !== "object" && (
                                    <span
                                        className="text-base"
                                        dangerouslySetInnerHTML={{
                                            __html: `extends ${applyStyles(resolveType(info.type))}`,
                                        }}
                                    ></span>
                                )}
                            </h1>
                            <p>{info.description}</p>
                            <div className="flex flex-col border border-gray-300 dark:border-gray-700 my-2">
                                <div className="flex">
                                    <div className="bg-purple text-white text-sm w-32 sm:w-40 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                        Parameter
                                    </div>
                                    <div className="bg-purple text-white text-sm w-40 sm:w-52 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                        Type
                                    </div>
                                    <div className="bg-purple text-white text-sm flex-1 py-1 px-1.5 flex items-center border border-gray-300 dark:border-gray-700">
                                        Description
                                    </div>
                                </div>
                                {(
                                    info.props as {
                                        name: string;
                                        description: string;
                                        type: string[][][];
                                    }[]
                                ).map((prop) => (
                                    <div className="flex" key={prop.name}>
                                        <div className="w-32 sm:w-40 py-1 px-1.5 flex items-center font-mono text-sm flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                            {prop.name}
                                        </div>
                                        <div
                                            className="w-40 sm:w-52 py-1 px-1.5 flex text-sm items-center flex-shrink-0 border border-gray-300 dark:border-gray-700"
                                            dangerouslySetInnerHTML={{
                                                __html: applyStyles(resolveType(prop.type, true)),
                                            }}
                                        ></div>
                                        <div className="flex-1 py-1 px-1.5 text-sm flex items-center border border-gray-300 dark:border-gray-700">
                                            {prop.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (info.docType === "external") {
                    return (
                        <div className="markdown">
                            <h1>{info.name}</h1>
                            <p>{info.description}</p>
                            {info.see && <a href={info.see[0]}>External definition</a>}
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

    if (!route && !search && window.location.hash === localStorage.getItem("twitchx-last")) return null;

    if (!route && !search) return <Redirect to="/docs/general/welcome" />;

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
                                .map(({ item }, i) => (
                                    <li className="flex items-center gap-2" key={i}>
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
