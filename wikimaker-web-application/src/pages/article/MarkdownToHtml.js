export default async function markdownToHtml(path, markdown) {
    let stringConsumer = {
        string : markdown,
        startOfLine : true,
        tokens : [],
        tokenIndex : 0,
        html : [],
        bold : false,
        italic : false,
        strikethrough : false,
        code : false
    }
    const parseObjects = await parseIntoObjects(stringConsumer, path)
    console.log(parseObjects)
    return objectsToHtml(parseObjects)
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
        case 'horizontalBreak' :
            return <div className={'horizontal-break'}/>
        case 'br' :
            return <br className={'newline'}/>
        case 'p' :
            return <p className={'line'}>{parseObjects.children.map(element => objectsToHtml(element))}</p>
        case 'italic' :
            return <span className={'italic'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'bold' :
            return <span className={'bold'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'bolditalic' :
            return <span className={'bold italic'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'strike' :
            return <span
                className={'strikethrough'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'boldstrike' :
            return <span
                className={'bold strikethrough'}>{parseObjects.children.map(element => objectsToHtml(element))}</span>
        case 'blockquote' :
            return <blockquote
                className={'block-quote'}>{parseObjects.children.map(element => objectsToHtml(element))}</blockquote>
        case 'plaintext' :
            return <span className={'text'}>{parseObjects.content}</span>
        case 'ul' :
            return <ul className={'unordered-list'}>{parseObjects.children.map(element => objectsToHtml(element))}</ul>
        case 'ol' :
            return <ol start={parseObjects.start} className={'ordered-list'}>{parseObjects.children.map(element => objectsToHtml(element))}</ol>
        case 'li' :
            return <li className={'list-item'}>{parseObjects.children.map(element => objectsToHtml(element))}</li>
        case 'code' :
            return <code className={'inline-code'}>{parseObjects.children.map(element => objectsToHtml(element))}</code>
        case 'codeBlock' :
            return <code className={'code-block'}>{parseObjects.children.map(element => objectsToHtml(element))}</code>
        case 'table' :
            return <table className={'table'}>{parseObjects.children.map(element => objectsToHtml(element))}</table>
        case 'tr' :
            return <tr className={'table-row'}>{parseObjects.children.map(element => objectsToHtml(element))}</tr>
        case 'th' :
            return <th className={'table-header-cell'}>{parseObjects.children.map(element => objectsToHtml(element))}</th>
        case 'td' :
            return <td className={'table-data-cell'}>{parseObjects.children.map(element => objectsToHtml(element))}</td>
        case 'hyperlink':
            return <a className={'hyperlink'} href={parseObjects.content.url}>{parseObjects.content.text}
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="lucide lucide-external-link external-link-icon"><path d="M15 3h6v6"/><path
                        d="M10 14 21 3"/><path
                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    </svg>
            </a>
        case 'image' :
            return <img className={'image'} alt={parseObjects.content.text} src={parseObjects.content.url}/>
        case 'wikilink' :
            return <a className={'wikilink'} href={`/locate?article=${parseObjects.content.url}`}>{parseObjects.content.text}</a>
        default :
            return null
    }
}

function firstRegexMatch(stringConsumer, regex) {
    const match = regex.exec(stringConsumer.string);
    if (match === null) return 0
    if (match.index !== 0) return 0
    return match[0].length;
}

function consumeMatch(stringConsumer, matchLength) {
    stringConsumer.startOfLine = false
    stringConsumer.string.substring(0, matchLength)
    stringConsumer.string = stringConsumer.string.substring(matchLength)
}

async function parseIntoObjects(stringConsumer, path) {
    const object = {
        type : 'div',
        children : [{
            type : 'title',
            children : [{
                type : 'plaintext',
                content : path.substring(path.lastIndexOf('/') + 1)
            }]
        }]
    }
    while (stringConsumer.startOfLine) {
        object.children.push(newlineObject(stringConsumer));
    }
    return object
}

function newlineObject(stringConsumer) {
    let returnObject = {
        type : 'empty',
        children : []
    }

    if (!stringConsumer.startOfLine)
        return returnObject

    stringConsumer.startOfLine = false;
    let orderedListNumber = -1

    let objectType = 'p'
    let matchLength;
    if ((matchLength = firstRegexMatch(stringConsumer, /# /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h1'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /## /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h2'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /### /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h3'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /#### /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h4'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /##### /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h5'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /###### /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'h6'
    } else if ((matchLength = firstRegexMatch(stringConsumer, />[\t ]*/)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'blockquote'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /(---+|\*\*\*+|___+)\s*\n/)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        stringConsumer.startOfLine = true;
        objectType = 'horizontalBreak'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /\n/)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        stringConsumer.startOfLine = true;
        objectType = 'br'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /[\t ]*([*\-+]) /)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'ul'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /\s*([0-9]+\.) /)) > 0) {
        const orderedListNumber = stringConsumer.string.substring(0, matchLength).trim()
        returnObject.start = orderedListNumber.substring(0, orderedListNumber.length - 1)
        consumeMatch(stringConsumer, matchLength)
        objectType = 'ol'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /```(.|\n)*?\n```\n/)) > 0) {
        const contents = stringConsumer.string.substring(0, matchLength)
        const firstLineLength = contents.indexOf('\n')
        returnObject.codeContents = contents.substring(firstLineLength + 1, contents.length - 4)
        consumeMatch(stringConsumer, matchLength)
        stringConsumer.startOfLine = true;
        objectType = 'codeBlock'
    } else if ((matchLength = firstRegexMatch(stringConsumer, /\|(?:[^|\n]*\|)+[\t ]*\n(?:\| *:?-+:? *)+(?:\|[\t ]*\n(?:\|[^|\n]+)+)+\|\n/)) > 0) {
        returnObject.tableContents = stringConsumer.string.substring(0, matchLength)
        consumeMatch(stringConsumer, matchLength)
        stringConsumer.startOfLine = true;
        objectType = 'table'
    }


    let objectChildren = []
    if (objectType === 'blockquote') {
        objectChildren = [blockquote(stringConsumer)];
    } else if (objectType === 'ul') {
        objectChildren = [unorderedList(stringConsumer, matchLength - 2)]
    } else if (objectType === 'ol') {
        objectChildren = [orderedList(stringConsumer, matchLength - 2 - orderedListNumber.length, orderedListNumber)]
    } else if (objectType === 'table') {
        objectChildren = table(stringConsumer, returnObject.tableContents)
    }else if (objectType === 'codeBlock') {
        objectChildren = [{
            type : 'plaintext',
            content : returnObject.codeContents
        }]
    } else if (objectType === 'horizontalBreak' || objectType === 'br') {
        stringConsumer.bold = false
        stringConsumer.code = false
        stringConsumer.strikethrough = false
        stringConsumer.italic = false
    } else {
        objectChildren = inlineObject(stringConsumer)
    }
    returnObject.type = objectType
    returnObject.children = objectChildren
    return returnObject
}

function table(stringConsumer, tableContents) {
    let rows = tableContents.split('\n')
    const justifications = tableContents[1]
    rows = [rows[0]].concat(rows.slice(2))
    return rows.map((row, index) => ({
        type : 'tr',
        children : tableRow(row, index)
    }))
}

function tableRow(rowContent, index) {
    const cells = rowContent.split(/(?<!\\)\|/).slice(1, -1)

    return cells.map(cell => ({
        type : index === 0 ? 'th' : 'td',
        children : [tableCell(cell)]
    }))
}

function tableCell(rowContent) {
    const content = rowContent.trim()
    return {
        type : 'plaintext',
        content : content.length > 0 ? content : ' '
    }
}

function unorderedList(stringConsumer, indentAmount) {
    if (indentAmount === 0) {
        return {
            type : 'li',
            children : inlineObject(stringConsumer)
        }
    } else {
        return {
            type : 'ul',
            children : [unorderedList(stringConsumer, indentAmount - 1)]
        }
    }
}

function orderedList(stringConsumer, indentAmount, orderedListNumber) {
    if (indentAmount === 0) {
        return {
            type : 'li',
            children : inlineObject(stringConsumer)
        }
    } else {
        return {
            type : 'ol',
            children : [orderedList(stringConsumer, indentAmount - 1)],
            start : orderedListNumber
        }
    }
}

function blockquote(stringConsumer) {
    let objectType = 'p'
    let objectChildren
    let matchLength;
    if ((matchLength = firstRegexMatch(stringConsumer, />[\t ]*/)) > 0) {
        consumeMatch(stringConsumer, matchLength)
        objectType = 'blockquote'
    }
    if (objectType === 'blockquote') {
        objectChildren = [blockquote(stringConsumer)]
    } else {
        objectChildren = inlineObject(stringConsumer)
    }
    return {
        type : objectType,
        children : objectChildren
    }

}

function inlineObject(stringConsumer) {

    const inlines = []
    const patterns = {
        newline : /\n/,
        italic : /[_*]/,
        bold : /__|\*\*/,
        strikethrough : /~~/,
        code : /`/,
        hyperlink : /\[[^\[]*?]\(.+?\)/,
        wikilink : /\[\[.+?]]/,
        image : /!\[.*?]\(.+?\)/,
        otherText : /([^*_\n`!~\[]|\\[*_`\[]|~(?!~)|!(?!\[)|\[(?!\[).*](?!\())+/,
    }

    while (!stringConsumer.startOfLine) {
        if (stringConsumer.string.length === 0) return inlines

        const bestMatch = {
            regex: null,
            text: null
        }


        Object.keys(patterns).forEach(key => {
            const regex = patterns[key]
            const match = regex.exec(stringConsumer.string);
            if (!match) return
            if (match.index !== 0) return
            if (bestMatch.regex === null || bestMatch.text.length < match[0].length) {
                bestMatch.regex = regex
                bestMatch.text = match[0]
            }
        })

        if (bestMatch.text) {
            consumeMatch(stringConsumer, bestMatch.text.length)
            switch (bestMatch.regex) {
                case patterns.newline:
                    stringConsumer.startOfLine = true
                    if (inlines.length === 0) inlines.push({ type : 'plaintext', content : ' ' })
                    break
                case patterns.italic:
                    stringConsumer.italic = !stringConsumer.italic
                    if (stringConsumer.italic) {
                        inlines.push({
                            type : (stringConsumer.bold ? 'bold' : '') + (stringConsumer.italic ? 'italic' : '') + (stringConsumer.strikethrough ? 'strike' : '') + (stringConsumer.code ? 'code' : ''),
                            children : inlineObject(stringConsumer)
                        })
                    } else return inlines
                    break
                case patterns.bold:
                    stringConsumer.bold = !stringConsumer.bold
                    if (stringConsumer.bold) {
                        inlines.push({
                            type : (stringConsumer.bold ? 'bold' : '') + (stringConsumer.italic ? 'italic' : '') + (stringConsumer.strikethrough ? 'strike' : '') + (stringConsumer.code ? 'code' : ''),
                            children : inlineObject(stringConsumer)
                        })
                    } else return inlines
                    break
                case patterns.strikethrough:
                    stringConsumer.strikethrough = !stringConsumer.strikethrough
                    if (stringConsumer.strikethrough) {
                        inlines.push({
                            type : (stringConsumer.bold ? 'bold' : '') + (stringConsumer.italic ? 'italic' : '') + (stringConsumer.strikethrough ? 'strike' : '') + (stringConsumer.code ? 'code' : ''),
                            children : inlineObject(stringConsumer)
                        })
                    } else return inlines
                    break
                case patterns.code:
                    stringConsumer.code = !stringConsumer.code
                    if (stringConsumer.code) {
                        inlines.push({
                            type : (stringConsumer.bold ? 'bold' : '') + (stringConsumer.italic ? 'italic' : '') + (stringConsumer.strikethrough ? 'strike' : '') + (stringConsumer.code ? 'code' : ''),
                            children : [inlineCode(stringConsumer)]
                        })
                    } else return inlines.concat(inlineObject(stringConsumer))
                    break
                case patterns.otherText:
                    inlines.push({ type: 'plaintext', content: bestMatch.text })
                    break
                case patterns.hyperlink:
                    inlines.push({ type: 'hyperlink', content: hyperlinkInfo(bestMatch.text) })
                    break
                case patterns.image:
                    inlines.push({ type: 'image', content: imageInfo(bestMatch.text) })
                    break
                case patterns.wikilink:
                    inlines.push({ type: 'wikilink', content: wikilinkInfo(bestMatch.text) })
                    break

            }
        } else {
            const final = stringConsumer.string
            consumeMatch(stringConsumer, stringConsumer.string.length)
            stringConsumer.startOfLine = false
            inlines.push({
                type : 'plaintext',
                content : final
            })
        }
    }
    return inlines
}

function wikilinkInfo(wikilinkMarkdown) {
    const wikilinkPattern = /(?<=\[\[).+?(?=]])/
    let wikilinkParts = wikilinkMarkdown.match(wikilinkPattern)[0].split(/(?<!\\)\|/)
    return {
        'text' : wikilinkParts.length > 1 ? wikilinkParts[1] : wikilinkParts[0],
        'url' : wikilinkParts[0]
    }
}

function imageInfo(imageMarkdown) {
    const imageTextPattern = /(?<=\[).*?(?=])/
    const imageUrlPattern = /(?<=\().*?(?=\))/
    let imageText = imageMarkdown.match(imageTextPattern)
    imageText = imageText[0].replace('\\<', '<').replace('\\[', '[')
    let imageUrl = imageMarkdown.match(imageUrlPattern)[0].split(' ')[0]
    if (imageUrl && imageText) {
        return {
            'text' : imageText,
            'url' : imageUrl
        }
    }
}

function hyperlinkInfo(hyperlinkMarkdown) {
    const hyperlinkTextPattern = /(?<=\[).*?(?=])/
    const hyperlinkUrlPattern = /(?<=\().*?(?=\))/
    let hyperlinkText = hyperlinkMarkdown.match(hyperlinkTextPattern)
    hyperlinkText = hyperlinkText[0].replace('\\<', '<').replace('\\[', '[')
    let hyperlinkUrl = hyperlinkMarkdown.match(hyperlinkUrlPattern)[0]
    if (hyperlinkUrl && hyperlinkText) {
        return {
            'text' : hyperlinkText,
            'url' : hyperlinkUrl
        }
    }
}

function inlineCode(stringConsumer) {
    const pattern = /[^`\n]*/
    let matchLength
    let matchString = ''
    if ((matchLength = firstRegexMatch(stringConsumer, pattern)) > 0)
        matchString = stringConsumer.string.substring(0, matchLength)
        consumeMatch(stringConsumer, matchLength)
    return {
        type : 'plaintext',
        content : matchString
    }
}