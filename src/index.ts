import { HTMLElement, parse, Node, NodeType } from 'node-html-parser';
import fetch from 'node-fetch';

const isHtmlElement = (child: Node): child is HTMLElement => {
    return (child as HTMLElement).nodeType === NodeType.ELEMENT_NODE
}

const isUlHtmlElement = (child: Node): child is HTMLElement => {
    return isHtmlElement(child) && child.rawTagName === "ul"
}

const isLiHtmlElement = (child: Node): child is HTMLElement => {
    return isHtmlElement(child) && child.rawTagName === "li"
}

type ChildQuest = {
    name: string
    href: string | null
}
type ChildQuestList = ChildQuest[]

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

const fetchDocument = async (url: string): Promise<HTMLElement> => {
    const response = await fetch(url)
    const htmlText = await response.text()
    return await parse(htmlText)
}

const fetchQuestRequirements = async (quest: Quest): Promise<QuestListWithReqs> => {
    const document = await fetchDocument(`https://runescape.wiki${quest.href}`)

    const questRequirements = scrapeQuestRequirements(document)
    return {
        ...quest,
        questRequirements
    }
}

type QuestDifficulty = 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster' | 'Special'

type QuestAge = 'Fifth Age' | 'Sixth Age' | 'Ambiguous'

type Quest = {
    name: string
    href: string
    members: boolean
    difficulty: QuestDifficulty
    length: string
    age: QuestAge
    questPoints: number
    series: string
}

type GetCellFn = (cell: HTMLElement[]) => HTMLElement[]

const getQuestListCells: GetCellFn = (cells) => cells
const getMiniQuestListCells: GetCellFn = (cells) => {
    const [nameCell, _, membersCell, difficultCell, lengthCell, ageCell, seriesCell] = cells
    return [nameCell, membersCell, difficultCell, lengthCell, ageCell, null, seriesCell]
}

const scrapeQuestListImpl = (getCells: GetCellFn) => (document: HTMLElement): Quest[] => {
    const getText = (cell: HTMLElement): string => {
        return cell.innerText.replace("\n", '').trim()
    }

    const tableBody = document.querySelector("table.wikitable.sortable tbody")
    const rowsWithHeader = tableBody.querySelectorAll("tr")
    const rows = rowsWithHeader.slice(1)
    const quests = rows.map(row => {
        const cells = row.querySelectorAll("td")

        const [nameCell, membersCell, difficultCell, lengthCell, ageCell, questPointsCell, seriesCell] = getCells(cells)

        return {
            name: getText(nameCell),
            href: nameCell.querySelector("a").getAttribute("href"),
            members: !!membersCell.innerText.match(/.*Yes.*/),
            difficulty: getText(difficultCell) as QuestDifficulty,
            length: getText(lengthCell),
            age: getText(ageCell) as QuestAge,
            questPoints: questPointsCell ? parseInt(getText(questPointsCell)) : 0,
            series: getText(seriesCell)
        }
    })
    return quests
}
const scrapeQuestList = scrapeQuestListImpl(getQuestListCells)
const scrapeMiniQuestList = scrapeQuestListImpl(getMiniQuestListCells)

type QuestListWithReqs = Quest & {
    questRequirements: ChildQuestList
}

const fetchAllQuests = async (): Promise<Quest[]> => {
    const document = await fetchDocument("https://runescape.wiki/w/List_of_quests")

    return scrapeQuestList(document)
}

const fetchAllMiniQuests = async (): Promise<Quest[]> => {
    const document = await fetchDocument("https://runescape.wiki/w/Miniquests")

    return scrapeMiniQuestList(document)
}

const run = async () => {
    const quests = await fetchAllQuests()
    const miniQuests = await fetchAllMiniQuests()

    const questsWithReqsPromises = quests.concat(miniQuests).map(async quest => {
        return await fetchQuestRequirements(quest)
    })

    const questsWithReqs = await Promise.all(questsWithReqsPromises)


    console.log(JSON.stringify(questsWithReqs))
}


run().catch(console.error)
