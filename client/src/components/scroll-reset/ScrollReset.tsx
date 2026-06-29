import { useEffect } from "react";
import { useLocation } from "react-router";

// Resets scroll to the top of the document whenever the route pathname
// changes. React Router v7's <Routes> does not do this by default, so
// navigating from a scrolled page lands mid-content on the next route.
export default function ScrollReset() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
