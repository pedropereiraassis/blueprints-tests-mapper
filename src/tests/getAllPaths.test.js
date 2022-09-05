const { getAllPaths } = require('../getAllPaths');
const simpleBP = require('../../samples/simpleBP');
const mediumBP = require('../../samples/mediumBP');
const hardBP = require('../../samples/hardBP');
const veryHardBP = require('../../samples/veryHardBP');
const extremelyHardBP = require('../../samples/extremelyHardBP');

describe('Get All Paths tests with loops', () => {
  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP);
    expect(allPaths.length).toEqual(1);
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP);
    expect(allPaths.length).toEqual(2);
  });

  test('get all hardBP paths', () => {
    const allPaths = getAllPaths(hardBP);
    expect(allPaths.length).toEqual(4);
  });
  
  test('get all veryHardBP paths', () => {
    const allPaths = getAllPaths(veryHardBP);
    expect(allPaths.length).toEqual(6);
  });
   
  test('get all extremelyHardBP paths', () => {
    const allPaths = getAllPaths(extremelyHardBP);
    expect(allPaths.length).toEqual(60);
  });
  
});

describe('Get All Paths tests ignoring loops', () => {
  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP, true);
    expect(allPaths.length).toEqual(1);
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP, true);
    expect(allPaths.length).toEqual(2);
  });

  test('get all hardBP paths', () => {
    const allPaths = getAllPaths(hardBP, true);
    expect(allPaths.length).toEqual(4);
  });
  
  test('get all veryHardBP paths', () => {
    const allPaths = getAllPaths(veryHardBP, true);
    expect(allPaths.length).toEqual(3);
  });
   
  test('get all extremelyHardBP paths', () => {
    const allPaths = getAllPaths(extremelyHardBP, true);
    expect(allPaths.length).toEqual(5);
  });
  
});