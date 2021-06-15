import docs from "../docs.json";

export default function Home() {
    return <div dangerouslySetInnerHTML={{ __html: docs.index }}></div>;
}
