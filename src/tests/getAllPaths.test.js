const { getAllPaths } = require('../getAllPaths');
const verySimpleBP = require('../../samples/verySimpleBP');
const simpleBP = require('../../samples/simpleBP');
const mediumBP = require('../../samples/mediumBP');
const averageBP = require('../../samples/averageBP');
const loopSimpleBP = require('../../samples/loopSimpleBP');
const loopMultipleBP = require('../../samples/loopMultipleBP');

describe('Get All Paths tests with loops', () => {
  test('get all verySimpleBP paths', () => {
    const allPaths = getAllPaths(verySimpleBP);
    expect(allPaths.totalScenarios).toEqual(1);
    expect(allPaths.scenarios).toBeDefined();
  });

  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP);
    expect(allPaths.totalScenarios).toEqual(2);
    expect(allPaths.scenarios).toBeDefined();
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP);
    expect(allPaths.totalScenarios).toEqual(4);
    expect(allPaths.scenarios).toBeDefined();
  });
  
  test('get all averageBP paths', () => {
    const allPaths = getAllPaths(averageBP);
    expect(allPaths.totalScenarios).toEqual(9);
    expect(allPaths.scenarios).toBeDefined();
  });
  
  test('get all loopSimpleBP paths', () => {
    const allPaths = getAllPaths(loopSimpleBP);
    expect(allPaths.totalScenarios).toEqual(6);
    expect(allPaths.scenarios).toBeDefined();
  });
   
  test('get all loopMultipleBP paths', () => {
    const allPaths = getAllPaths(loopMultipleBP);
    expect(allPaths.totalScenarios).toEqual(60);
    expect(allPaths.scenarios).toBeDefined();
  });
  
});

describe('Get All Paths tests ignoring loops', () => {
  test('get all verySimpleBP paths', () => {
    const allPaths = getAllPaths(verySimpleBP, true);
    expect(allPaths.totalScenarios).toEqual(1);
    expect(allPaths.scenarios).toBeDefined();
  });

  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP, true);
    expect(allPaths.totalScenarios).toEqual(2);
    expect(allPaths.scenarios).toBeDefined();
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP, true);
    expect(allPaths.totalScenarios).toEqual(4);
    expect(allPaths.scenarios).toBeDefined();
  });
  
  test('get all averageBP paths', () => {
    const allPaths = getAllPaths(averageBP, true);
    expect(allPaths.totalScenarios).toEqual(5);
    expect(allPaths.scenarios).toBeDefined();
  });
  
  test('get all loopSimpleBP paths', () => {
    const allPaths = getAllPaths(loopSimpleBP, true);
    expect(allPaths.totalScenarios).toEqual(3);
    expect(allPaths.scenarios).toBeDefined();
  });
   
  test('get all loopMultipleBP paths', () => {
    const allPaths = getAllPaths(loopMultipleBP, true);
    expect(allPaths.totalScenarios).toEqual(5);
    expect(allPaths.scenarios).toBeDefined();
  });
  
});