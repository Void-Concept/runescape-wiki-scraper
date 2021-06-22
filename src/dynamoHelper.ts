import { DynamoDB } from 'aws-sdk'
import { QuestListWithReqs } from './types'

export const uploadQuests = async (questList: QuestListWithReqs[]) => {
    const dynamoDb = new DynamoDB()

    const promises = questList.map(quest => {
        const questRequirements = quest.questRequirements.map(quest => ({
            M: {
                name: {
                    S: quest.name
                },
                href: {
                    S: quest.href
                }
            }
        }))

        return dynamoDb.putItem({
            TableName: "???",
            Item: {
                name: {
                    S: quest.name
                },
                href: {
                    S: quest.href
                },
                members: {
                    BOOL: quest.members
                },
                difficulty: {
                    S: quest.difficulty
                },
                length: {
                    S: quest.length
                },
                age: {
                    S: quest.age
                },
                questPoints: {
                    N: `${quest.questPoints}`
                },
                series: {
                    S: quest.series
                },
                questRequirements: {
                    L: questRequirements
                }
            }
        })
    })
    await Promise.all(promises)
}