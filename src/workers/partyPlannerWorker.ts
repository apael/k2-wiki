import type { PartyPlanCreature } from '@/types'
import { planPartyLevelingPath } from '@/utils/partyPlanner'

self.onmessage = (e: MessageEvent<PartyPlanCreature[]>) => {
  const result = planPartyLevelingPath(e.data)
  self.postMessage(result)
}
