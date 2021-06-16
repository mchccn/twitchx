import data from "../data.json";
import docs from "../docs.json";
import SidebarSection from "./SidebarSection";

export default function Sidebar({ active }: { active: string }) {
    return (
        <aside
            className="sidebar transform -translate-x-full absolute sm:static sm:transform-none px-4 lg:px-0 py-3 w-60 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 overflow-y-scroll"
            style={{ maxHeight: "calc(100vh - 3rem)" }}
        >
            <div>
                {docs.categories.map(({ name, pages }) => (
                    <SidebarSection key={name} name={name} pages={pages} active={active} />
                ))}
                <SidebarSection
                    name={"Classes"}
                    pages={data.classes.map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                    active={active}
                />
                <SidebarSection
                    name={"Typedefs"}
                    pages={data.typedefs.map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                    active={active}
                />
                <SidebarSection
                    name={"Externals"}
                    pages={data.externals.map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                    active={active}
                />
            </div>
            <div className="fixed bg-lightPurple h-full"></div>
        </aside>
    );
}
