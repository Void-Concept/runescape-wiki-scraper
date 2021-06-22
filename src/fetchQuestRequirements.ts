import { fetchDocument, isLiHtmlElement, isUlHtmlElement } from "./helpers"
import { HTMLElement } from 'node-html-parser';
import { ChildQuestList, Quest, QuestListWithReqs } from "./types";

const scrapeQuestRequirements = (document: HTMLElement): ChildQuestList => {
    const questReq = document.querySelector(".questreq")
    if (!questReq) return []

    const trTd = questReq.querySelector("tr td")
    const htmlElement = trTd.querySelector("ul li")

    const children = htmlElement.childNodes
        .filter(isUlHtmlElement)
        .map(child => child.childNodes.filter(isLiHtmlElement))
        .reduce((acc, val) => acc.concat(val), [])

    return children.map(child => {
        //remove ul elements to not pollute names
        child.childNodes.filter(isUlHtmlElement).map(nestedChild => child.removeChild(nestedChild))

        const link = child.querySelector("a")
        return {
            name: child.innerText,
            href: link && link.getAttribute("href")
        }
    })
}

export const fetchQuestRequirements = async (quest: Quest): Promise<QuestListWithReqs> => {
    const document = await fetchDocument(`https://runescape.wiki${quest.href}`)

    const questRequirements = scrapeQuestRequirements(document)
    return {
        ...quest,
        questRequirements
    }
}