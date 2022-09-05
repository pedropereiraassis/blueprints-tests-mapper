# blueprint-tests-mapper

blueprint-tests-mapper is a plugin to get all possible paths of a given process 
blueprint.

## Installation
```
npm install blueprint-tests-mapper
```

## Usage
```js
const { getAllPaths } = require('blueprint-tests-mapper');
const allPaths = getAllPaths(blueprint);

/*
note that 'blueprint' must be a valid blueprint inside flowbuild's pattern, i.e, 
must have the valid properties 'name', 'description' and 'blueprint_spec' in it.
*/
```