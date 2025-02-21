import logo from "./penguini-transparent.png";
import {createUseStyles} from "react-jss";

const styles = {
    '@global' : {
        ".App": {textAlign: "center"},
        ".App-logo": {height: "40vmin", pointerEvents: "none"},
        "@media (prefers-reduced-motion: no-preference)": {
            ".App-logo": {animation: "App-logo-spin infinite 20s linear"}
        },
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
        "@keyframes App-logo-spin": {
            from: {transform: "rotate(0deg)"},
            to: {transform: "rotate(360deg)"}
        }
    }
}
const useStyle = createUseStyles(styles);

function Home() {
    useStyle();
    return <div className="App">
        <header className="App-header">
            <p>This website is a work in progress. Please pardon our dust!</p>
        </header>
    </div>
}

export default Home;
