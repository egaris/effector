//@flow

import {
  type Graph,
  type Graphite,
  type Cmd,
  getGraph,
  getOwners,
  getLinks,
} from './stdlib'
import {is} from './is'

const removeItem = (list, item) => {
  const pos = list.indexOf(item)
  if (pos !== -1) {
    list.splice(pos, 1)
  }
}
const removeFromNode = (currentNode, targetNode) => {
  removeItem(currentNode.next, targetNode)
  removeItem(getOwners(currentNode), targetNode)
  removeItem(getLinks(currentNode), targetNode)
}
const clearNodeNormalized = (
  targetNode: Graph,
  deep: boolean,
  isDomainUnit,
) => {
  targetNode.next.length = 0
  targetNode.seq.length = 0
  //$off
  targetNode.scope = null
  let currentNode
  let list = getLinks(targetNode)
  while ((currentNode = list.pop())) {
    removeFromNode(currentNode, targetNode)
    if (
      deep ||
      (isDomainUnit && !targetNode.meta.sample) ||
      currentNode.family.type === 'crosslink'
    ) {
      clearNodeNormalized(currentNode, deep, isDomainUnit)
    }
  }
  list = getOwners(targetNode)
  while ((currentNode = list.pop())) {
    removeFromNode(currentNode, targetNode)
    if (isDomainUnit && currentNode.family.type === 'crosslink') {
      clearNodeNormalized(currentNode, deep, isDomainUnit)
    }
  }
}
const clearMap = (map: any) => map.clear()
export const clearNode = (
  graphite: Graphite,
  {
    deep,
  }: {
    deep?: boolean,
    ...
  } = {},
) => {
  let isDomainUnit = false
  if (is.store(graphite)) {
    clearMap(graphite.subscribers)
  } else if (is.domain(graphite)) {
    isDomainUnit = true
    const history = graphite.history
    clearMap(history.events)
    clearMap(history.effects)
    clearMap(history.stores)
    clearMap(history.domains)
  }
  clearNodeNormalized(getGraph(graphite), !!deep, isDomainUnit)
}
