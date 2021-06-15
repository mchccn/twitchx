import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Docs from "./components/Docs";
import Header from "./components/Header";
import Home from "./components/Home";

export default function App() {
    return (
        <div className="app flex flex-col min-h-screen dark:bg-dark">
            <Header />
            <div className="content flex flex-1 justify-center">
                <main className="flex w-full max-w-4xl">
                    <HashRouter basename={process.env.PUBLIC_URL}>
                        <Switch>
                            <Route path="/" exact component={Home} />
                            <Route path="/docs" exact component={Docs} />
                            <Route path="/docs/:route+" component={Docs} />
                        </Switch>
                    </HashRouter>
                </main>
            </div>
        </div>
    );
}
