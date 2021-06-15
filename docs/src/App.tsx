import React, { useEffect, useState } from "react";

interface Meta {
    line: number;
    file: string;
    path: string;
}

type Type = string[][];

interface Param {
    name: string;
    description: string;
    type: Type;
}

interface Data {
    classes: {
        abstract?: boolean;
        name: string;
        description: string;
        construct: {
            name: string;
            description: string;
            params?: Param[];
        };
        props?: {
            name: string;
            description: string;
            type: Type;
            readonly?: boolean;
            meta: Meta;
        }[];
        methods?: {
            name: string;
            description: string;
            meta: Meta;
            params?: Param[];
            access?: string;
            examples?: string[];
            returns?: Type;
        }[];
        events?: {
            name: string;
            description: string;
            params?: Param[];
            meta: Meta;
        }[];
        meta: Meta;
    }[];
    externals: {
        name: string;
        description: string;
        meta: Meta;
        see: string;
    }[];
    interfaces: [];
    typedefs: {
        name: string;
        description: string;
        meta: Meta;
        type: Type;
        props: {
            name: string;
            description: string;
            type: Type;
        }[];
    }[];
    meta: {
        generator: string;
        format: number;
        date: number;
    };
}

export default function App() {
    const [data, setData] = useState<Data | undefined>();

    useEffect(() => {
        (async () => {
            const json = await (await fetch("/data.json")).json();

            setData(json);
        })();
    }, []);

    console.log(data);

    return <div></div>;
}
