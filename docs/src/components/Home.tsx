import hljs from "highlight.js";
import { useEffect } from "react";
import docs from "../docs.json";

export default function Home() {
    useEffect(() => {
        hljs.configure({
            languages: ["typescript"],
        });

        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, []);

    return (
        <div
            className="dark:text-white markdown w-full px-4 lg:px-0 py-3"
            dangerouslySetInnerHTML={{ __html: docs.index }}
        ></div>
    );
}
