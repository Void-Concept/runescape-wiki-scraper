import { HTMLElement, parse, Node, NodeType } from 'node-html-parser';
import fetch from 'node-fetch'

export const isHtmlElement = (child: Node): child is HTMLElement => {
    return (child as HTMLElement).nodeType === NodeType.ELEMENT_NODE
}

export const isUlHtmlElement = (child: Node): child is HTMLElement => {
    return isHtmlElement(child) && child.rawTagName === "ul"
}

export const isLiHtmlElement = (child: Node): child is HTMLElement => {
    return isHtmlElement(child) && child.rawTagName === "li"
}


export const fetchDocument = async (url: string): Promise<HTMLElement> => {
    const response = await fetch(url)
    const htmlText = await response.text()
    return await parse(htmlText)
}
