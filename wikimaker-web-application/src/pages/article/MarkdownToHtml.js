// const newStringConsumer = (string) => {
//     return {
//         string : string,
//         startOfLine : true,
//         bold : false,
//         italic : false,
//         strikethrough : false,
//         code : false
//     }
// }

export default async function jsonToHtml(json) {
    return objectsToHtml(json)
}

function objectsToHtml(parseObjects) {
    switch (parseObjects.type) {
        case 'empty' :
            return null
        case 'div' :
            return <div className={'article'}>{parseObjects.children.map(element => objectsToHtml(element))}</div>
        case 'title' :
            return <h1 className={'title'}>{parseObjects.children.map(element => objectsToHtml(element))}</h1>
        case 'h1' :
            return <h1 className={'header-1'}>{parseObjects.children.map(element => objectsToHtml(element))}</h1>
        case 'h2' :
            return <h2 className={'header-2'}>{parseObjects.children.map(element => objectsToHtml(element))}</h2>
        case 'h3' :
            return <h3 className={'header-3'}>{parseObjects.children.map(element => objectsToHtml(element))}</h3>
        case 'h4' :
            return <h4 className={'header-4'}>{parseObjects.children.map(element => objectsToHtml(element))}</h4>
        case 'h5' :
            return <h5 className={'header-5'}>{parseObjects.children.map(element => objectsToHtml(element))}</h5>
        case 'h6' :
            return <h6 className={'header-6'}>{parseObjects.children.map(element => objectsToHtml(element))}</h6>
        case 'inline-break' :
            return <div className={'inline-break'}/>
        case 'container' :
            return <div>{parseObjects.children.map(element => objectsToHtml(element))}</div>
        case 'new-line' :
            return <br className={'new-line'}/>
        case 'text-line' :
            return <p className={'line'}>{parseObjects.children.map(element => objectsToHtml(element))}</p>
        case 'italic' :
            return <span className={'italic'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'bold' :
            return <span className={'bold'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'strikethrough' :
            return <span
                className={'strikethrough'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'blockquote-container' :
            return <div className={'block-quote-container'}>{parseObjects.children.map(element => objectsToHtml(element))}</div>
        case 'blockquote' :
            return <blockquote
                className={'block-quote'}>{parseObjects.children.map(element => objectsToHtml(element))}</blockquote>
        case 'p' :
            return <span className={'text'}>{parseObjects.content}</span>
        case 'ul' :
            return <ul className={'unordered-list'}>{parseObjects.children.map(element => objectsToHtml(element))}</ul>
        case 'ol' :
            return <ol start={parseObjects.start} className={'ordered-list'}>{parseObjects.children.map(element => objectsToHtml(element))}</ol>
        case 'li' :
            return <li className={'list-item'}>{parseObjects.children.map(element => objectsToHtml(element))}</li>
        case 'code' :
            return <code className={'inline-code'}>{parseObjects.children.map(element => objectsToHtml(element))}</code>
        case 'code-block' :
            return <code className={'code-block'}>{parseObjects.children.map(element => objectsToHtml(element))}</code>
        case 'table' :
            return <table className={'table'}>{parseObjects.children.map(element => objectsToHtml(element))}</table>
        case 'tr' :
            return <tr className={'table-row'}>{parseObjects.children.map(element => objectsToHtml(element))}</tr>
        case 'th' :
            return <th className={'table-header-cell'}>{parseObjects.children.map(element => objectsToHtml(element))}</th>
        case 'td' :
            return <td className={'table-data-cell'}>{parseObjects.children.map(element => objectsToHtml(element))}</td>
        case 'external-link':
            return <a className={'hyperlink'} href={parseObjects.content.url}>{parseObjects.content.text}
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="lucide lucide-external-link external-link-icon"><path d="M15 3h6v6"/><path
                        d="M10 14 21 3"/><path
                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    </svg>
            </a>
        case 'image-link' :
            return <img className={'image'} style={{width: parseObjects.content.width, height: parseObjects.content.height}} alt={parseObjects.content.text} src={parseObjects.content.url}/>
        case 'internal-image':
            return <img className={'image'} style={{width: parseObjects.content.width, height: parseObjects.content.height}} alt={parseObjects.content.path} src={`${process.env.REACT_APP_WIKI_API_PATH}/image/${parseObjects.content.path}`}/>
        case 'internal-link' :
            return <a className={'wikilink'} href={`/locate/${parseObjects.content.url}`}>{parseObjects.content.text}</a>
        default :
            return null
    }
}
