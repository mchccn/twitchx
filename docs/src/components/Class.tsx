import goto from "../lib/goto";

export default function Class({
    info,
    applyStyles,
    resolveType,
    md,
}: {
    info: typeof import("../data.json")["classes"][number];
    applyStyles: (string: string) => string;
    resolveType: (type: string[][][], removeUndefined?: boolean) => string;
    md: import("markdown-it");
}) {
    return (
        <div className="markdown">
            <h1 className="flex flex-col justify-between">
                {info.abstract && <span className="text-sm">abstract</span>}
                <span>{info.name}</span>
                {info.extends && (
                    <span
                        className="text-base"
                        dangerouslySetInnerHTML={{
                            __html: `extends ${applyStyles(resolveType(info.extends))}`,
                        }}
                    ></span>
                )}
            </h1>

            <p>{info.description}</p>

            <h2>Constructor</h2>

            <pre>
                <code className="hljs code-javascript">{`new Twitch.${info.name}(${
                    info.construct.params
                        ? (
                              info.construct.params as {
                                  name: string;
                                  description: string;
                                  type: string[][][];
                              }[]
                          )
                              .map(({ name, type }) => (type.flat(2).includes("undefined") ? name + "?" : name))
                              .join(", ")
                        : ""
                })`}</code>
            </pre>

            <p>{info.construct.description}</p>

            {info.construct.params.length && (
                <div className="flex flex-col border border-gray-300 dark:border-gray-700">
                    <div className="flex">
                        <div className="bg-purple text-white text-sm sm:text-base w-32 sm:w-40 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                            Parameter
                        </div>
                        <div className="bg-purple text-white text-sm sm:text-base w-40 sm:w-52 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                            Type
                        </div>
                        <div className="bg-purple text-white text-sm sm:text-base flex-1 py-1 px-1.5 flex items-center border border-gray-300 dark:border-gray-700">
                            Description
                        </div>
                    </div>
                    {(
                        info.construct.params as {
                            name: string;
                            description: string;
                            type: string[][][];
                        }[]
                    ).map((param) => (
                        <div className="flex" key={param.name}>
                            <div className="w-32 sm:w-40 py-1 px-1.5 flex items-center font-mono text-xs sm:text-sm flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                {param.name}
                            </div>
                            <div
                                className="w-40 sm:w-52 py-1 px-1.5 flex text-sm sm:text-base items-center flex-shrink-0 border border-gray-300 dark:border-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: applyStyles(resolveType(param.type)),
                                }}
                            ></div>
                            <div className="flex-1 py-1 px-1.5 text-sm sm:text-base flex items-center border border-gray-300 dark:border-gray-700">
                                {param.description}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {info.props && (
                <div>
                    <h2>Properties</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {[
                            ...(info.props as {
                                name: string;
                                description: string;
                                readonly: boolean;
                                type: string[][][];
                                meta: {
                                    line: number;
                                    file: string;
                                    path: string;
                                };
                            }[]),
                        ]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map((prop) => (
                                <div key={prop.name}>
                                    <a className="cursor-pointer" onClick={() => goto(prop.name)}>
                                        {prop.name}
                                        {prop.readonly && " 🅁"}
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {info.methods && (
                <div>
                    <h2>Methods</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {[
                            ...(info.methods as {
                                name: string;
                                description: string;
                                params: {
                                    name: string;
                                    description: string;
                                    type: string[][][];
                                }[];
                                access?: "private";
                                returns: string[][][];
                                meta: {
                                    line: number;
                                    file: string;
                                    path: string;
                                };
                            }[]),
                        ]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map((meth) => (
                                <div key={meth.name}>
                                    <a className="cursor-pointer" onClick={() => goto(meth.name)}>
                                        {meth.name}
                                        {meth.access === "private" && " 🄿"}
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {info.events && (
                <div>
                    <h2>Events</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {[
                            ...(info.events as {
                                name: string;
                                description: string;
                                meta: {
                                    line: number;
                                    file: string;
                                    path: string;
                                };
                                params?: {
                                    name: string;
                                    description: string;
                                    type: string[][][];
                                }[];
                            }[]),
                        ]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map((evt) => (
                                <div key={evt.name}>
                                    <a className="cursor-pointer" onClick={() => goto(evt.name)}>
                                        {evt.name}
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {info.props && (
                <>
                    <h2>Properties</h2>
                    <div className="flex flex-col gap-8">
                        {[
                            ...(info.props as {
                                name: string;
                                description: string;
                                readonly: boolean;
                                type: string[][][];
                                meta: {
                                    line: number;
                                    file: string;
                                    path: string;
                                };
                            }[]),
                        ]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map((prop) => (
                                <div key={prop.name}>
                                    <p
                                        className="text-lg text-lightPurple dark:text-lightestPurple cursor-pointer"
                                        onClick={() => goto(prop.name)}
                                    >
                                        {prop.name}
                                        {prop.readonly && " 🅁"}
                                    </p>
                                    <p
                                        className="markdown markdown-p my-1"
                                        dangerouslySetInnerHTML={{
                                            __html: md.renderInline(prop.description),
                                        }}
                                    ></p>
                                    <p
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: `Type: ${applyStyles(resolveType(prop.type))}`,
                                        }}
                                    ></p>
                                </div>
                            ))}
                    </div>
                </>
            )}

            {info.methods && (
                <>
                    <h2>Methods</h2>
                    <div className="flex flex-col gap-8">
                        {[
                            ...(info.methods as {
                                name: string;
                                description: string;
                                params: {
                                    name: string;
                                    description: string;
                                    type: string[][][];
                                }[];
                                access?: "private";
                                returns:
                                    | string[][][]
                                    | {
                                          description: string;
                                          types: string[][][];
                                      };
                                meta: {
                                    line: number;
                                    file: string;
                                    path: string;
                                };
                            }[]),
                        ]
                            .sort((a, b) => (a.name > b.name ? 1 : -1))
                            .map((meth) => (
                                <div key={meth.name}>
                                    <p
                                        className="text-lg text-lightPurple dark:text-lightestPurple cursor-pointer"
                                        onClick={() => goto(meth.name)}
                                    >
                                        {meth.name}
                                        {meth.access === "private" && " 🄿"}
                                    </p>
                                    <p
                                        className="markdown markdown-p my-1"
                                        dangerouslySetInnerHTML={{
                                            __html: md.renderInline(meth.description),
                                        }}
                                    ></p>
                                    <pre>
                                        <code className="hljs language-typescript">{`client.${meth.name}(${
                                            meth.params
                                                ? meth.params
                                                      .map(({ name, type }) =>
                                                          type.flat(2).includes("undefined") ? name + "?" : name
                                                      )
                                                      .join(", ")
                                                : ""
                                        })`}</code>
                                    </pre>
                                    {meth.params && (
                                        <div className="flex flex-col border border-gray-300 dark:border-gray-700 my-2">
                                            <div className="flex">
                                                <div className="bg-purple text-white text-sm sm:text-base w-32 sm:w-40 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                                    Parameter
                                                </div>
                                                <div className="bg-purple text-white text-sm sm:text-base w-40 sm:w-52 py-1 px-1.5 flex items-center flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                                    Type
                                                </div>
                                                <div className="bg-purple text-white text-sm sm:text-base flex-1 py-1 px-1.5 flex items-center border border-gray-300 dark:border-gray-700">
                                                    Description
                                                </div>
                                            </div>
                                            {(
                                                meth.params as {
                                                    name: string;
                                                    description: string;
                                                    type: string[][][];
                                                }[]
                                            ).map((param) => (
                                                <div className="flex" key={param.name}>
                                                    <div className="w-32 sm:w-40 py-1 px-1.5 flex items-center font-mono text-xs sm:text-sm flex-shrink-0 border border-gray-300 dark:border-gray-700">
                                                        {param.name}
                                                    </div>
                                                    <div
                                                        className="w-40 sm:w-52 py-1 px-1.5 flex text-sm sm:text-base items-center flex-shrink-0 border border-gray-300 dark:border-gray-700"
                                                        dangerouslySetInnerHTML={{
                                                            __html: applyStyles(resolveType(param.type)),
                                                        }}
                                                    ></div>
                                                    <div className="flex-1 py-1 px-1.5 text-sm sm:text-base flex items-center border border-gray-300 dark:border-gray-700">
                                                        {param.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: md.renderInline(
                                                applyStyles(
                                                    `Returns: ${resolveType(
                                                        Array.isArray(meth.returns) ? meth.returns : meth.returns.types
                                                    )}${
                                                        Array.isArray(meth.returns)
                                                            ? ""
                                                            : ` ${meth.returns.description}`
                                                    }`
                                                )
                                            ),
                                        }}
                                    ></p>
                                </div>
                            ))}
                    </div>
                </>
            )}

            <div className="h-4"></div>
        </div>
    );
}
