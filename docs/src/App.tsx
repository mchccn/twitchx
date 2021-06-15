import React from "react";
import data from "./data.json";

export default function App() {
    return (
        <div>
            <pre>{JSON.stringify(data, undefined, 4)}</pre>
        </div>
    );
}
