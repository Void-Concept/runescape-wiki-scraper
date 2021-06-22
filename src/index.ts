import { HTMLElement, parse, Node, NodeType } from 'node-html-parser';
import fetch from 'node-fetch';

const isHtmlElement = (child: Node): child is HTMLElement => {
    return (child as HTMLElement).nodeType === NodeType.ELEMENT_NODE
}

const getNested = (htmlElement: HTMLElement) => {
    const link = htmlElement.querySelector("a")

    const children = htmlElement.childNodes
        .filter(isHtmlElement)
        .filter(child => {
            return child.rawTagName === 'ul'
        })
        .map(child => child.childNodes.filter(isHtmlElement).filter(child => child.rawTagName === 'li'))
        .reduce((acc, val) => acc.concat(val), [])
        .map(elem => getNested(elem));

    return {
        questName: link.innerText,
        link: link.getAttribute("href"),
        children: children
    }
}

const run = async () => {
    const response = await fetch("https://runescape.wiki/w/While_Guthix_Sleeps")
    const htmlText = await response.text()

    const document = await parse(htmlText)

    const questReq = document.querySelector(".questreq")
    const trTd = questReq.querySelector("tr td")

    const list = getNested(trTd.querySelector("ul li"))

    console.log(JSON.stringify(list))
}


run().catch(console.error)
