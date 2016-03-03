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
 * @file utility
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

const node_path = require('path');
const fs = require('fs');

/**
 * 测试路径是否目录
 * @param   {string} path
 * @returns {boolean}
 */
exports.isDirPath = function(path) {
  return /\/|\\\\$/.test(path);
};

var exists = exports.exists = fs.existsSync || node_path.existsSync;

/**
 * 创建目录
 * @param {string} fpath 要创建的目录的路径
 * @param {?number=} mode 创建模式
 */
exports.mkdirp = function(fpath, mode) {
  if (exists(fpath)) {
    return;
  }

  var _0777 = parseInt('0777', 8);
  if (mode === void 0) {
    mode = _0777 & (~process.umask());
  }

  fpath.split(node_path.sep).reduce(function(prev, next) {
    if (prev && !exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + node_path.sep + next;
  });

  if (!exists(fpath)) {
    fs.mkdirSync(fpath, mode);
  }
};