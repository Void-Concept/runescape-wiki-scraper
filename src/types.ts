export type ChildQuest = {
    name: string
    href: string | null
}

export type ChildQuestList = ChildQuest[]

export type QuestDifficulty = 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster' | 'Special'

export type QuestAge = 'Fifth Age' | 'Sixth Age' | 'Ambiguous'

export type Quest = {
    name: string
    href: string
    members: boolean
    difficulty: QuestDifficulty
    length: string
    age: QuestAge
    questPoints: number
    series: string
}

export type QuestListWithReqs = Quest & {
    questRequirements: ChildQuestList
}