import React, { useEffect, useRef } from "react";

export default function withTitle(WrappedComponent, pageTitle) {
    return (props) => {
        const defaultTitle = useRef(document.title);

        useEffect(() => {
            document.title = pageTitle;
        }, [pageTitle]);

        useEffect(() => () => {
            document.title = defaultTitle.current;
        }, []);

        return <WrappedComponent {...props} />;
    }
}
