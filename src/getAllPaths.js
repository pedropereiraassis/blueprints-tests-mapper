const cytoscape = require('cytoscape');
const cytoscapeAllPaths = require('cytoscape-all-paths');
const _ = require('lodash');
cytoscape.use(cytoscapeAllPaths);

function getAllPaths(blueprint, ignoreLoops = false) {
  const { nodes } = blueprint.blueprint_spec;
  const cy = cytoscape();
  let count = 0;
  nodes.forEach((node) => cy.add({ data: { id: node.id, type: node.type } }));
  nodes.forEach((node) => {
    if (node.next && typeof node.next != 'object') {
      count++;
      cy.add({
        data: {
          id: count,
          source: node.id,
          target: node.next
        }
      })
    } else if (node.next) {
      for (const path of _.uniq(Object.values(node.next))) {
        count++;
        cy.add({
          data: {
            id: count,
            source: node.id,
            target: path
          }
        })
      }
    }
  });

  const eles = cy.elements();
  const allPaths = eles.cytoscapeAllPaths();
  let paths = allPaths.map((path) => path.filter((node) => node.isNode()));
  let finalPaths = [];
  const fullPaths = [];

  if (ignoreLoops) {
    paths.forEach((path) => {
      if ((path?.at(-1)?._private?.data?.type?.toLowerCase() === 'finish') && path.length > 1) {
        fullPaths.push(path);
      }
    });
  } else {
    let repeatedPaths = [];

    paths.forEach((path) => {
      if (path?.at(-1)?._private?.data?.type?.toLowerCase() !== 'finish') {
        repeatedPaths.push(path);
      } else {
        fullPaths.push(path);
      }
    });

    while (repeatedPaths.length !== 0) {
      repeatedPaths.forEach((repeatedPath) => {
        const allNewPaths = eles.cytoscapeAllPaths({
          rootIds: [`${repeatedPath.at(-1).id()}`]
        });
        let newPaths = allNewPaths.map((path) => path.filter((node) => node.isNode()));
        
        newPaths.forEach((newPath) => {
          if (newPath?.at(-1)?._private?.data?.type?.toLowerCase() === 'finish') {
            const newFullPath = [...repeatedPath.slice(0, -1), ...newPath];
            fullPaths.push(newFullPath);
          }
        });
      })

      repeatedPaths = [];

      fullPaths.forEach((path) => {
        if (path?.at(-1)?._private?.data?.type?.toLowerCase() !== 'finish') {
          repeatedPaths.push(path);
        } else {
          finalPaths.push(path);
        }
      });
    }
  }

  fullPaths.forEach((path) => {
    if (path?.at(-1)?._private?.data?.type?.toLowerCase() === 'finish') {
      finalPaths.push(path);
    }
  });

  const finalPathsIds = finalPaths.map(path => path.map(node => node.id()));
  const uniqueFinalPaths = _.uniqWith(finalPathsIds, _.isEqual);
  let countPath = 0;

  return {
    totalScenarios: uniqueFinalPaths.length,
    scenarios: uniqueFinalPaths.map((path) => {
      return {
        id: countPath++,
        name: `${path[0]}->${path.at(-1)}`,
        nodes: uniqueFinalPaths[countPath - 1]
      }
    })
  }
}

module.exports = {
  getAllPaths
}