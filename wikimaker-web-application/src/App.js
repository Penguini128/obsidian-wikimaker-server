import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import history from "./History";
import Home from './pages/home/Home';
import {createUseStyles} from "react-jss";
import PageNotFound from "./pages/page-not-found/PageNotFound";
import Locate from "./pages/locate/Locate";
import Article from "./pages/article/Article";

const style = {
    '@global': {
        body: {
            fontSize : '16px',
            margin: 0,
            " font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            "-webkit-font-smoothing": "antialiased",
            "-moz-osx-font-smoothing": "grayscale"
        },
        code: {
            "font-family": "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
        },
        '@media (prefers-color-scheme: dark)' : {
            ':root' : {
                'scrollbar-color' : '#777 #444'
            }
        }
    }
}

const useStyle = createUseStyles(style);

export default function App() {

    useStyle();

    return <BrowserRouter history={history}>
        <Routes>
            <Route key='home' path="/" element={<Navigate to="/article/Home" replace={true} />} />
            <Route key='page-not-found' path="/page-not-found" element={<PageNotFound/>}/>
            <Route key='search' path='/locate/:name' element={<Locate/>}/>
            <Route key='article' path='/article/*' element={<Article/>}/>
            <Route path="*" element={<Navigate to="/page-not-found" replace={true}/>}/>
        </Routes>
    </BrowserRouter>
}


