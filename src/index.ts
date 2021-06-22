import { fetchQuestRequirements } from './fetchQuestRequirements';
import { fetchAllMiniQuests, fetchAllQuests } from './fetchQuests';

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
