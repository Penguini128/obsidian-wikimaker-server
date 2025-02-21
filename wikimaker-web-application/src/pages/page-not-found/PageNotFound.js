import {createUseStyles} from "react-jss";
import {useEffect} from "react";

const styles = {
    '@global' : {
        ".App": {textAlign: "center"},
        ".App-header": {
            backgroundColor: '#1C1C1C',
            color: '#DDDDDD',
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "calc(10px + 2vmin)",
        },
    }
}
const useStyle = createUseStyles(styles);

export default function PageNotFound() {
    useStyle();

    useEffect(() => {
        let title = document.querySelector("#page-title");
        if (!title) {
            title = document.createElement('title');
            document.getElementsByTagName('head')[0].appendChild(title);
        }
        title.innerText = 'Page Not Found';
    }, []);


    return <div className="App">
        <header className="App-header">
            <p>The page you are looking either is not published or does not exist.</p>
        </header>
    </div>
}

