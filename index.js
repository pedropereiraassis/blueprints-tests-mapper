const nodes = require('./samples/test');
const cytoscape = require('cytoscape');
const cytoscapeAllPaths = require('cytoscape-all-paths');
const _ = require('lodash');
cytoscape.use(cytoscapeAllPaths);

const cy = cytoscape();
let count = 0;
nodes.forEach((node) => cy.add({ data: { id: node.id, type: node.type } }))
nodes.forEach((node) => {
  if (node.next && typeof node.next != 'object') {
    count++;
    cy.add({
      data: {
        id: count,
        weight: count,
        source: node.id,
        target: node.next
      }
    })
  } else if (node.next) {
    for (const path of Object.values(node.next)) {
      count++;
      cy.add({
        data: {
          id: count,
          weight: count,
          source: node.id,
          target: path
        }
      })
    }
  }
})

const eles = cy.elements();
const finishNodes = eles.nodes()
  .filter((node) => node._private.data.type.toLowerCase() === 'finish')
  .map((node) => node.id());

const allPaths = eles.cytoscapeAllPaths();
let paths = allPaths.map((path) => path.filter((node) => node.isNode()))
  // .map((node) => { return { id:node.id(), type: node._private.data.type } }))

const loops = [];
const repeatedPaths = [];
const fullPaths = [];
let finalPaths = [];

paths.forEach((path) => {
  if (path?.at(-1)?._private?.data?.type?.toLowerCase() !== 'finish') {
    loops.push(path.slice(-2));
    repeatedPaths.push(path);
  } else {
    fullPaths.push(path);
  }
});

repeatedPaths.forEach((path) => {
  finishNodes.forEach((finishNode) => {
    const bf = eles.bellmanFord({
      root: `#${path.at(-1).id()}`,
      directed: true
    });
    const pathToFinish = bf.pathTo(`#${finishNode}`).filter((node) => node.isNode()).select();
    if (pathToFinish.length !== 0) {
      const newPath = [...path.slice(0, -1), ...pathToFinish];
      fullPaths.push(newPath);
    }
  })
});
fullPaths.forEach((path) => {
  if (path?.at(-1)?._private?.data?.type?.toLowerCase() === 'finish') {
    finalPaths.push(path);
  }
});
console.log()
const finalPathsIds = finalPaths.map(path => path.map(node => node.id()));
const uniqueFinalPaths = _.uniqWith(finalPathsIds, _.isEqual)
console.log(uniqueFinalPaths);
console.log(uniqueFinalPaths.length);

// let paths = [];
// const startNodes = eles.roots().map(node => node.id());

// const flowNodes = eles.nodes()
//   .filter((node) => node._private.data.type.toLowerCase() === 'flow')
//   .map((node) => node.id());
  
// console.log(flowNodes)
// startNodes.forEach((startNode) => {
//   finishNodes.forEach((finishNode) => {
//     const bf = eles.bellmanFord({
//       root: `#${startNode}`,
//       function(edge) {
//         return edge.data('weight');
//       },
//       directed: true
//     });
//     const path = bf.pathTo(`#${finishNode}`);
//     paths.push(path.filter((node) => node.isNode()).map(node => node.id()));
//   })
// });