// @flow

import mockFs from 'mock-fs';

import {mock} from '../../__mocks__';

jest.mock('pkg-dir', () => ({
  sync: jest.fn()
}));

describe('Config', () => {
  const mockRootDir = '/foo/bar/baz';

  describe('getFilePath', () => {
    it('should return file path', async () => {
      const {sync} = require('pkg-dir');
      mock(sync).mockImplementationOnce(arg => {
        expect(arg).toBeUndefined();
        return mockRootDir;
      });

      const {getFilePath} = require('../config');

      const result = await getFilePath();
      const expected = `${mockRootDir}/.xcoderc`;

      expect(result).toEqual(expected);
    });

    it('should throw error if root dir is not found', () => {
      const {sync} = require('pkg-dir');
      mock(sync).mockImplementationOnce(arg => {
        expect(arg).toBeUndefined();
        return;
      });

      const {getFilePath} = require('../config');

      const result = getFilePath();

      expect(result).rejects.toThrow(':x: Project root not found.');
    });

    afterEach(() => {
      const {sync} = require('pkg-dir');
      mock(sync).mockClear();
    });
  });

  describe('getVersion', () => {
    beforeAll(() => {
      const {sync} = require('pkg-dir');
      mock(sync).mockImplementation(arg => {
        expect(arg).toBeUndefined();
        return mockRootDir;
      });
    });

    it('should throw error on file not found', async () => {
      const {getVersion} = require('../config');

      const result = getVersion();

      await expect(result).rejects.toThrow(`:x: Xcode version file (.xcoderc) not found. Try: xcoderc init`);
    });

    it('should throw error on empty file', async () => {
      mockFs({
        [`${mockRootDir}/.xcoderc`]: ''
      });
      const {getVersion} = require('../config');

      const result = getVersion();

      await expect(result).rejects.toThrow(`:x: Xcode version file (.xcoderc) is empty.`);
    });

    it('should return version', async () => {
      const mockVersion = '9.4';
      mockFs({
        [`${mockRootDir}/.xcoderc`]: mockVersion
      });
      const {getVersion} = require('../config');

      const result = await getVersion();

      expect(result).toEqual(mockVersion);
    });

    afterEach(() => mockFs.restore());

    afterAll(() => {
      const {sync} = require('pkg-dir');
      mock(sync).mockClear();
    });
  });
});
