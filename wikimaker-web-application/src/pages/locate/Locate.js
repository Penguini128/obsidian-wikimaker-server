import {createUseStyles} from "react-jss";
import {useNavigate, useParams} from "react-router-dom";
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
            fontSize: "calc(10px + 2vmin)"
        },
    }
}
const useStyle = createUseStyles(styles);

export default function Locate() {
    useStyle();

    const params = useParams();
    const   = params.name
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_WIKI_API_PATH}/locate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: searchArticle + '.json'})
        })
        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else {
                return {}
            }
        })
        .then((json) => {
            if (json.path) {
                const finalPath = json.path.replace(/\.json$/, '')
                navigate(`/article/${finalPath}`, {replace:true});
            } else {
                navigate('/page-not-found', {replace:true});
            }
        })
    }, [])

    return <div className="App">
        <header className="App-header">
            <p>Searching...</p>
            <p>{searchArticle}</p>
        </header>
    </div>
}

