import hljs from "highlight.js";
import { useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
import docs from "../docs.json";
import Sidebar from "./Sidebar";

export default function Docs() {
    useEffect(() => {
        hljs.configure({
            languages: ["typescript"],
        });

        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, []);

    const { route } = useParams<{ route: string }>();

    if (!route) return <Redirect to="/docs/general/welcome" />;

    console.log(route);

    const pages = docs.categories.flatMap(({ name, pages }) => pages.map((page) => ({ category: name, ...page })));

    return (
        <div className="flex flex-1">
            <Sidebar active={route} />
            <main
                className="docs flex-1 px-4 lg:pr-0 py-3 dark:text-white overflow-y-scroll"
                style={{ maxHeight: "calc(100vh - 3rem)" }}
            >
                {docs.categories.some(({ name }) => route.startsWith(name.toLowerCase())) &&
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
                ) : (
                    <div className="markdown"></div>
                )}
            </main>
        </div>
    );
}
