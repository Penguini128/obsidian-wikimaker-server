const articleStyles = {
    '@global' : {
        '.article' : {
            width : '100%',
            textAlign : 'left',
            fontSize : '16px',
            boxSizing : 'border-box',
            padding : '2rem',
            maxWidth : '47rem'
        },
        '.title' : {
            fontSize : '1.9rem',
            fontWeight : '700',
            margin : '1rem 0rem 2rem 0rem'
        },
        '.header-1' : {
            fontSize : '1.9rem',
            fontWeight : '700',
            margin : '1rem 0rem 0rem 0rem'
        },
        '.header-2' : {
            fontSize : '1.7rem',
            fontWeight : '600',
            margin : '1rem 0rem 0rem 0rem'
        },
        '.header-3' : {
            fontSize : '1.45rem',
            fontWeight : '600',
            margin : '1rem 0rem 0rem 0rem'
        },
        '.header-4' : {
            fontSize : '1.3rem',
            fontWeight : '600',
             margin : '1rem 0rem 0rem 0rem'
        },
        '.header-5' : {
            fontSize : '1.15rem',
            fontWeight : '600',
             margin : '1rem 0rem 0rem 0rem'
        },
        '.header-6' : {
            fontSize : '1.05rem',
            fontWeight : '600',
             margin : '1rem 0rem 0rem 0rem'
        },
        '.newline' : {
            margin : 0,
            height : 0
        },
        '.horizontal-break' : {
            margin : '0.75rem 0rem 1.5rem 0rem',
            borderBottom : '2px solid #333333'
        },
        '.line' : {
            fontSize : '1rem',
            margin : '0.15rem 0rem',
        },
        '.text' : {
            whiteSpace : 'pre-wrap'
        },
        '.block-quote' : {
            display : "flex",
            borderLeft : '2px solid #8B5CF6',
            margin : 0,
            alignItems : 'center',
            boxSizing : 'border-box',
            paddingLeft : '1rem'

        },
        '.block-quote .line' : {
            margin : 0,
            padding : "0.15rem 0rem"
        },
        '.block-quote .block-quote' : {
            height : '100%',
            boxSizing : 'content-box',
            paddingLeft : '1rem'
        },
        '.bold' : {
            fontWeight : '600'
        },
        '.italic' : {
            fontStyle : 'italic'
        },
        '.strikethrough' : {
            textDecoration : 'line-through'
        },
        '.unordered-list' : {
            listStyle : 'disc',
            paddingLeft : '2rem',
            margin : '0.25rem 0rem'
        },
        '.ordered-list' : {
            paddingLeft : '2rem',
            margin : '0.25rem 0rem'
        },
        '.list-item::marker' : {
            color: '#666666'
        },
        '.inline-code' : {
            display : 'inline-block',
            fontSize : '90%',
            backgroundColor : '#242424',
            borderRadius : '4px',
            padding : '0.1rem 0.25rem',
            margin : '0.3rem 0rem',
            fontWeight : 500
        },
        '.code-block' : {
            display : 'block',
            boxSizing : 'border-box',
            fontSize : '90%',
            lineHeight : '1.25rem',
            backgroundColor : '#242424',
            borderRadius : '4px',
            padding : '1.5rem 1rem',
            width : '100%',
            fontWeight : 500
        },
        '.table' : {
            borderCollapse : 'collapse',
            margin : 0
        },
        '.table-row' : {
            margin : 0
        },
        '.table-header-cell' : {
            border : '1px solid #333333',
            fontWeight : '600',
            padding : '.25rem 0.5rem',
            minWidth : '2.25rem',
            margin : 0
        },
        '.table-data-cell' : {
            border : '1px solid #333333',
            padding : '.25rem 0.5rem',
            minWidth : '2.25rem',
            margin : 0
        },
        '.image' : {
            display : 'block',
            maxWidth : '100%'
        },
        '.hyperlink' : {
            color : '#a98ee8'
        },
        '.hyperlink:hover' : {
            color : '#d2c0fa'
        },
        '.wikilink' : {
            color : '#a98ee8',
            textDecoration: 'underline'
        },
        '.wikilink:hover' : {
            color : '#d2c0fa',
            cursor : "pointer",
            textDecoration: 'underline'
        },
        '.external-link-icon' : {
            display : 'inline-block',
            width : '1rem',
            height : '1rem',
            transform : 'scale(.6) translate(-4px, -2px)',
            fill : "none",
            stroke : 'gray',
            strokeWidth : "2",
            strokeLinecap : "round",
            strokeLinejoin : "round",
            overflow : 'visible'
        },
        image : {
            display : 'block',
            maxWidth : '100%'
        }
    }
}
export default articleStyles;