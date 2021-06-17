import { useEffect, useState } from "react";
import data from "../data.json";
import docs from "../docs.json";
import SidebarSection from "./SidebarSection";

export default function Sidebar({ active }: { active: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.addEventListener("click", (e) => {
            if (
                !(e.target as HTMLElement).closest(".sidebar") &&
                !(e.target as HTMLElement).closest(".sidebar-trigger") &&
                open
            )
                setOpen(false);
        });
    }, []);

    return (
        <>
            <div
                className="sidebar-trigger z-20 fixed w-2 bg-purple min-h-full lg:hidden"
                style={{ maxHeight: "calc(100vh - 3rem)" }}
                onClick={() => setOpen(!open)}
            ></div>
            <aside
                className={`sidebar transform ${
                    !open ? "-translate-x-full" : ""
                } transition-transform shadow absolute z-10 bg-white lg:shadow-none lg:static lg:transform-none px-4 xl:px-0 py-3 w-60 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 dark:bg-dark overflow-y-scroll min-h-full`}
                style={{ maxHeight: "calc(100vh - 3rem)" }}
            >
                <div>
                    {docs.categories.map(({ name, pages }) => (
                        <SidebarSection
                            key={name}
                            name={name}
                            pages={pages}
                            active={active}
                            close={() => setOpen(false)}
                        />
                    ))}
                    <SidebarSection
                        name={"Classes"}
                        pages={[...data.classes]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                        active={active}
                        close={() => setOpen(false)}
                    />
                    <SidebarSection
                        name={"Typedefs"}
                        pages={[...data.typedefs]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                        active={active}
                        close={() => setOpen(false)}
                    />
                    <SidebarSection
                        name={"Externals"}
                        pages={[...data.externals]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map(({ name }) => ({ name, slug: name.toLowerCase(), content: "" }))}
                        active={active}
                        close={() => setOpen(false)}
                    />
                </div>
                <div className="fixed bg-lightPurple h-full"></div>
            </aside>
        </>
    );
}
