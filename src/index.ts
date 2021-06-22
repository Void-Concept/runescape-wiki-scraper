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

type Quest = {
    questName: string
    href: string
}
type QuestList = Quest[]

const scrapeQuestRequirements = (document: HTMLElement): QuestList => {
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
            questName: child.innerText,
            href: link.getAttribute("href")
        }
    })
}

type FetchedQuest = {
    questName: string,
    href: string,
    questRequirements: QuestList
}

const fetchDocument = async (url: string): Promise<HTMLElement> => {
    const response = await fetch(url)
    const htmlText = await response.text()
    return await parse(htmlText)
}

const fetchQuest = async (quest: Quest): Promise<FetchedQuest> => {
    const document = await fetchDocument(`https://runescape.wiki${quest.href}`)

    const questRequirements = scrapeQuestRequirements(document)
    return {
        ...quest,
        questRequirements
    }
}

type QuestDifficulty = 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster' | 'Special'

type QuestAge = 'Fifth Age' | 'Sixth Age' | 'Ambiguous'

type QuestListQuest = {
    name: string
    href: string
    members: boolean
    difficulty: QuestDifficulty
    length: string
    age: QuestAge
    questPoints: number
    series: string
}

const scrapeQuestList = (document: HTMLElement): QuestListQuest[] => {
    const getText = (cell: HTMLElement): string => {
        return cell.innerText.replace("\n", '')
    }

    const tableBody = document.querySelector("table.wikitable.sortable tbody")
    const rowsWithHeader = tableBody.querySelectorAll("tr")
    const rows = rowsWithHeader.slice(1)
    const quests = rows.map(row => {
        const cells = row.querySelectorAll("td")

        const [nameCell, membersCell, difficultCell, lengthCell, ageCell, questPointsCell, seriesCell] = cells

        return {
            name: getText(nameCell),
            href: nameCell.querySelector("a").getAttribute("href"),
            members: !!membersCell.innerText.match(/.*Yes.*/),
            difficulty: getText(difficultCell) as QuestDifficulty,
            length: getText(lengthCell),
            age: getText(ageCell) as QuestAge,
            questPoints: parseInt(getText(questPointsCell)),
            series: getText(seriesCell)
        }
    })
    return quests
}

const fetchAllQuests = async () => {
    const document = await fetchDocument("https://runescape.wiki/w/List_of_quests")

    return scrapeQuestList(document)
}

const run = async () => {
    // const fetchedQuest = await fetchQuest({
    //     questName: "Legend's Quest",
    //     href: "/w/Legends%27_Quest"
    // })

    // console.log(JSON.stringify(fetchedQuest))

    const quests = await fetchAllQuests()
    console.log(quests)
}


run().catch(console.error)
