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
    expect(allPaths.length).toEqual(1);
  });

  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP);
    expect(allPaths.length).toEqual(2);
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP);
    expect(allPaths.length).toEqual(4);
  });
  
  test('get all averageBP paths', () => {
    const allPaths = getAllPaths(averageBP);
    expect(allPaths.length).toEqual(9);
  });
  
  test('get all loopSimpleBP paths', () => {
    const allPaths = getAllPaths(loopSimpleBP);
    expect(allPaths.length).toEqual(6);
  });
   
  test('get all loopMultipleBP paths', () => {
    const allPaths = getAllPaths(loopMultipleBP);
    expect(allPaths.length).toEqual(60);
  });
  
});

describe('Get All Paths tests ignoring loops', () => {
  test('get all verySimpleBP paths', () => {
    const allPaths = getAllPaths(verySimpleBP, true);
    expect(allPaths.length).toEqual(1);
  });

  test('get all simpleBP paths', () => {
    const allPaths = getAllPaths(simpleBP, true);
    expect(allPaths.length).toEqual(2);
  });

  test('get all mediumBP paths', () => {
    const allPaths = getAllPaths(mediumBP, true);
    expect(allPaths.length).toEqual(4);
  });
  
  test('get all averageBP paths', () => {
    const allPaths = getAllPaths(averageBP, true);
    expect(allPaths.length).toEqual(5);
  });
  
  test('get all loopSimpleBP paths', () => {
    const allPaths = getAllPaths(loopSimpleBP, true);
    expect(allPaths.length).toEqual(3);
  });
   
  test('get all loopMultipleBP paths', () => {
    const allPaths = getAllPaths(loopMultipleBP, true);
    expect(allPaths.length).toEqual(5);
  });
  
});