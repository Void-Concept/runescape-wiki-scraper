import { HTMLElement } from "node-html-parser"
import { fetchDocument } from "./helpers"
import { Quest, QuestAge, QuestDifficulty } from "./types"

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

export const fetchAllQuests = async (): Promise<Quest[]> => {
    const document = await fetchDocument("https://runescape.wiki/w/List_of_quests")

    return scrapeQuestList(document)
}

export const fetchAllMiniQuests = async (): Promise<Quest[]> => {
    const document = await fetchDocument("https://runescape.wiki/w/Miniquests")

    return scrapeMiniQuestList(document)
}