import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useWindowWidth from "../lib/useWindowWidth";

export default function Header({ search, setSearch }: { search: string; setSearch: Dispatch<SetStateAction<string>> }) {
    const width = useWindowWidth(25);

    const [dark, setDark] = useState(localStorage.getItem("twitchx-theme") === "dark");

    useEffect(() => {
        localStorage.setItem("twitchx-theme", dark ? "dark" : "light");
    }, [dark]);

    return (
        <div className="h-12 px-4 py-2 grid place-items-center shadow dark:bg-purple z-50">
            <header className="flex items-center justify-between w-full max-w-6xl">
                <nav className="flex items-center gap-4 sm:gap-8">
                    {width > 440 ? (
                        <h1
                            className="text-xl sm:text-2xl text-purple select-none cursor-pointer dark:text-white"
                            role="link"
                            onClick={() => (window.location.hash = "#/")}
                        >
                            twitchx
                        </h1>
                    ) : undefined}
                    <div className="flex items-center gap-4 sm:-mb-0.5 mr-4">
                        <a className="cursor-pointer text-gray-700 dark:text-gray-50" href="#/docs">
                            {width > 640 ? (
                                "documentation"
                            ) : (
                                <svg
                                    className="fill-current text-gray-400 hover:text-gray-500 dark:text-gray-50 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 26 26"
                                >
                                    <path d="M 12.34375 1.09375 C 12.0625 1.109375 11.8125 1.21875 11.625 1.4375 L 1.28125 12.96875 C 1.066406 13.214844 0.535156 14.113281 0.28125 15.28125 C 0.105469 15.773438 0 16.34375 0 17 C 0 20.101563 2.59375 21.34375 2.59375 21.34375 C 2.632813 21.367188 2.675781 21.386719 2.71875 21.40625 L 14.71875 24.96875 C 15.109375 25.082031 15.53125 24.945313 15.78125 24.625 L 25.5625 12.84375 C 25.804688 12.542969 25.855469 12.128906 25.6875 11.78125 C 25.6875 11.78125 25.308594 10.90625 25.71875 9.90625 C 25.855469 9.574219 25.804688 9.195313 25.585938 8.910156 C 25.367188 8.625 25.011719 8.480469 24.65625 8.53125 C 24.304688 8.585938 24.003906 8.824219 23.875 9.15625 C 23.363281 10.410156 23.511719 11.363281 23.6875 11.96875 L 14.65625 22.84375 L 3.34375 19.5 L 3.28125 19.46875 C 3.09375 19.398438 2 18.90625 2 17 C 2 16.25 2.160156 15.851563 2.3125 15.625 C 2.464844 15.398438 2.625 15.289063 2.84375 15.21875 C 3.0625 15.148438 3.3125 15.148438 3.5 15.15625 L 3.53125 15.15625 L 13.96875 18.15625 C 14.058594 18.179688 14.160156 18.1875 14.25 18.1875 C 14.5625 18.1875 14.863281 18.027344 15.0625 17.78125 L 25.65625 5.5625 C 25.886719 5.28125 25.964844 4.90625 25.84375 4.5625 C 25.726563 4.214844 25.417969 3.953125 25.0625 3.875 L 12.625 1.09375 C 12.53125 1.074219 12.4375 1.089844 12.34375 1.09375 Z M 12.0625 5.0625 C 12.171875 5.058594 12.273438 5.070313 12.375 5.09375 L 19.8125 6.90625 C 20.21875 7.003906 20.375 7.269531 20.15625 7.53125 L 19.34375 8.5 C 19.121094 8.761719 18.597656 8.878906 18.1875 8.78125 L 10.78125 6.96875 C 10.371094 6.871094 10.21875 6.570313 10.4375 6.3125 L 11.21875 5.375 C 11.382813 5.179688 11.734375 5.070313 12.0625 5.0625 Z"></path>
                                </svg>
                            )}
                        </a>
                        <a
                            className="cursor-pointer text-gray-700 dark:text-gray-50"
                            href="https://github.com/cursorsdottsx/twitch"
                        >
                            {width > 640 ? (
                                "github"
                            ) : (
                                <svg
                                    className="fill-current text-gray-400 hover:text-gray-500 dark:text-gray-50 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            )}
                        </a>
                    </div>
                </nav>
                <nav className="flex items-center gap-4">
                    <button
                        aria-label="toggle theme"
                        className="outline-none focus:outline-none"
                        onClick={() => {
                            document.querySelector("html")?.classList.toggle("dark");
                            setDark(!dark);
                        }}
                    >
                        {!dark ? (
                            <svg
                                width="1.2em"
                                height="1.2em"
                                preserveAspectRatio="xMidYMid meet"
                                viewBox="0 0 24 24"
                                className="fill-current text-gray-300 hover:text-gray-400 h-6 w-6"
                                aria-hidden="true"
                            >
                                <g fill="none">
                                    <path
                                        d="M20.354 15.354A9 9 0 0 1 8.646 3.646A9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                </g>
                            </svg>
                        ) : (
                            <svg
                                width="1.2em"
                                height="1.2em"
                                preserveAspectRatio="xMidYMid meet"
                                viewBox="0 0 24 24"
                                className="fill-current text-gray-100 hover:text-white h-6 w-6"
                                aria-hidden="true"
                            >
                                <g fill="none">
                                    <path
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                </g>
                            </svg>
                        )}
                    </button>
                    <div className="relative flex items-center">
                        <svg
                            preserveAspectRatio="xMidYMid meet"
                            viewBox="0 0 24 24"
                            className="absolute left-1.5 h-5 w-5 text-gray-300 dark:text-gray-200"
                        >
                            <g fill="none">
                                <path
                                    d="M21 21l-6-6m2-5a7 7 0 1 1-14 0a7 7 0 0 1 14 0z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </g>
                        </svg>
                        <input
                            className="pl-8 pr-1.5 py-1 w-52 sm:w-64 lg:w-96 text-sm border border-gray-200 rounded-sm outline-none focus:outline-none focus:border-gray-300 dark:bg-lightPurple dark:border-transparent dark:text-white"
                            autoCapitalize="false"
                            autoComplete="off"
                            autoCorrect="off"
                            type="text"
                            name="search"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);

                                if (e.target.value && !window.location.hash.startsWith("#/search")) {
                                    localStorage.setItem("twitchx-last", window.location.hash);
                                } else if (!e.target.value) {
                                    window.location.hash = localStorage.getItem("twitchx-last") ?? "#/docs";

                                    return;
                                }

                                window.location.hash = `#/search?query=${e.target.value}`;

                                return;
                            }}
                        />
                        <label className="sr-only" htmlFor="search">
                            search documentation
                        </label>
                    </div>
                </nav>
            </header>
        </div>
    );
}
