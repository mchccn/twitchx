import docs from "../docs.json";

export default function Home() {
    return (
        <div
            className="dark:text-white markdown w-full px-4 lg:px-0 py-3"
            dangerouslySetInnerHTML={{ __html: docs.index }}
        ></div>
    );
}
