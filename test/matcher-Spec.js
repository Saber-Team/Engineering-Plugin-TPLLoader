/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file tpl正则匹配功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('matcher', function() {

  'use strict';

  const expect = require('chai').expect;
  const node_path = require('path');
  const fs = require('fs');
  const matcher = require('../lib/matcher');

  const testData = node_path.join(__dirname, '..', '__test_data__');
  const openIdentifier  = '{{';
  const closeIdentifier = '}}';

  describe('include cases', function() {
    const fn = 'bar.tpl';
    const includeRe = new RegExp(openIdentifier + matcher.includeRe + closeIdentifier, 'gm');

    it('should retrieve file attr of include directive', function() {
      let content = fs.readFileSync(node_path.join(testData, 'include.tpl'), {
        encoding: 'utf8'
      });
      let count = 0;

      content.replace(includeRe, (tag, $1) => {
        count++;
        expect($1).to.deep.equal(fn);
      });

      expect(count).to.equal(5);
    });
  });

  describe('extends cases', function() {
    const fn = 'bar.tpl';
    const extendsRe = new RegExp(openIdentifier + matcher.extendsRe + closeIdentifier, 'gm');

    it('should retrieve file attr of extends directive', function() {
      let content = fs.readFileSync(node_path.join(testData, 'extends.tpl'), {
        encoding: 'utf8'
      });
      let count = 0;

      content.replace(extendsRe, (tag, $1) => {
        count++;
        expect($1).to.deep.equal(fn);
      });

      expect(count).to.equal(5);
    });

  });

  describe('script cases', function() {
    const fn = 'bar.js';
    const scriptRe = new RegExp(matcher.scriptTagRe, 'igm');

    it('should retrieve src of script tag', function() {
      let content = fs.readFileSync(node_path.join(testData, 'script.tpl'), {
        encoding: 'utf8'
      });
      let count = 0;

      content.replace(scriptRe, (tag, src) => {
        count++;
        expect(src).to.deep.equal(fn);
      });

      expect(count).to.equal(5);
    });
  });

  describe('link cases', function() {
    const fn = 'bar.css';
    const linkRe = new RegExp(matcher.linkTagRe, 'igm');

    it('should retrieve src of script tag', function() {
      let content = fs.readFileSync(node_path.join(testData, 'link.tpl'), {
        encoding: 'utf8'
      });
      let count = 0;

      content.replace(linkRe, (tag, href) => {
        count++;
        expect(href).to.deep.equal(fn);
      });

      expect(count).to.equal(5);
    });
  });

  describe('image cases', function() {
    const fn = 'bar.png';
    const imageRe = new RegExp(matcher.imageTagRe, 'igm');

    it('should retrieve src of script tag', function() {
      let content = fs.readFileSync(node_path.join(testData, 'image.tpl'), {
        encoding: 'utf8'
      });
      let count = 0;

      content.replace(imageRe, (tag, src) => {
        count++;
        expect(src).to.deep.equal(fn);
      });

      expect(count).to.equal(3);
    });
  });
});
