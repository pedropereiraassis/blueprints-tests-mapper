const { nodes } = require('./samples/simpleBP');
const { getAllPaths } = require('./scripts/base');

console.log(getAllPaths(nodes));

// if (Object.keys(flows).length > 0) {
//   for (const [key, value] of Object.entries(flows)) {
//     console.log(key, value);
//   }
// } else {
//   const path = getPath(nodes);
//   paths.push(path);
// }

// console.log(paths);