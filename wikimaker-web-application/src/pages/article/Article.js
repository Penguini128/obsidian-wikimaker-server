import {createUseStyles} from "react-jss";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import jsonToHtml from "./MarkdownToHtml";
import {mergeJson} from "../../template/MergeJson";
import articleStyles from "./ArticleStyles";

const styles = {
    '@global': {
        ".page": {
            textAlign: "center",
            backgroundColor: '#1C1C1C',
            color: '#DDDDDD',
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "calc(10px + 2vmin)",
        },
    }
}



async function handleSearch(path) {
    return fetch(`${process.env.REACT_APP_WIKI_API_PATH}/retrieve-article`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({path: path + '.json'})
    })
        .then(response => response.status === 200 ? response.blob() : null)
        .then(blob => blob ? blob.text() : null)
}


const useStyle = createUseStyles(mergeJson(styles, articleStyles));

export default function Article() {

    const style = useStyle();
    const {'*': path} = useParams();
    const [articleContents, setArticleContents] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!articleContents) {
            handleSearch(path)
                .then((contents) => {
                    if (!contents) {
                        navigate('/page-not-found', {replace: true});
                    }
                    const json = JSON.parse(contents);
                    setArticleContents(contents ? jsonToHtml(json) : null)
                });
        }
    }, [])

    useEffect(() => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = '';
        let title = document.querySelector("#page-title");
        title.innerText = path.substring(path.lastIndexOf('/') + 1);
    }, []);

    return <div className="page">
        {
            articleContents ? articleContents :
                <p>Loading article...</p>
        }
    </div>
}

