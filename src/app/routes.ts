import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./pages/Home";
import Phonics from "./pages/Phonics";
import Numbers from "./pages/Numbers";
import Words from "./pages/Words";
import Tracing from "./pages/Tracing";

/** `/` → Root layout; index route → Home (first screen). */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "phonics", Component: Phonics },
      { path: "numbers", Component: Numbers },
      { path: "words", Component: Words },
      { path: "tracing", Component: Tracing },
    ],
  },
]);
