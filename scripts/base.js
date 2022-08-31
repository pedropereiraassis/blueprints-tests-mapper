const { listConnections } = require('./connections');
const _ = require('lodash');

function getAllPaths(nodes) {
  const flows = getFlows(nodes);
  const allConnections = listConnections(nodes);
  let connectionsCoverage = [];
  let paths = [];

  while (!_.isEqual(allConnections.sort(), connectionsCoverage.sort())) {
    const path = getPath(nodes);
    connectionsCoverage = listConnections(path);
    paths.push(path);
  } 

  const flowNodes = Object.keys(flows);
  const flowPaths = Object.values(flows);
  return paths.map((path) => path.map((node) => node.id));
  
}

function getPath(nodes, flowPaths = null) {
  let path = [];

  for (const node of nodes) {
    if (node.type.toLowerCase() === 'start') {
      path.push(node);
    }
  }

  while (path[path.length - 1]?.type?.toLowerCase() != 'finish') {
    for (const node of nodes) {
      if (path[path.length - 1]?.type?.toLowerCase() === 'flow') {
        if (Object.keys(flowPaths).includes(path[path.length - 1]?.id)) {
          for (const node_ of nodes) {
            if (node_.id === Object.values(flowPaths)) {
              path.push(node_);
              break;
            }
          }
        }
      } else if (node.id === path[path.length - 1].next) {
        path.push(node);
      }
    }
  }

  return path;
}

function getFlows(nodes) {
  let flows = {};
  for (const node of nodes) {
    if (node.type.toLowerCase() === 'flow') {
      flows[node.id] = [...new Set(Object.values(node.next))];
    }
  }
  return flows;
}

module.exports = {
  getFlows,
  getPath,
  getAllPaths
}