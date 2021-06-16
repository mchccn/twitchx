module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                codeDark: "var(--code-dark)",
                dark: "var(--dark)",
                purple: "var(--purple)",
                lightPurple: "var(--light-purple)",
                lightestPurple: "var(--lightest-purple)",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
