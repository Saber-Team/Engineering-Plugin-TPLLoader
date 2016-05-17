/**
 * The MIT License (MIT)
 *
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
 * @file RegExp for compiling
 * @author AceMood
 *
 */

'use strict';

exports.scriptTagRe = '<script(?:(?:.|\n|\r|\u2028|\u2029)*?)src="(.+?)"(?:(?:.|\n|\r|\u2028|\u2029)*?)(?:<\/script>)';
exports.linkTagRe   = '<link(?:(?:.|\n|\r|\u2028|\u2029)*?)href="(.+?)"(?:(?:.|\n|\r|\u2028|\u2029)*?)(?:\/?>|<\/link>)';
exports.imageTagRe  = '<img(?:(?:.|\n|\r|\u2028|\u2029)*?)src="(.+?)"(?:(?:.|\n|\r|\u2028|\u2029)*?)\/>';

exports.includeRe   = 'include(?:(?:.|\n|\r|\u2028|\u2029)*?)file="(.+?)"(?:(?:.|\n|\r|\u2028|\u2029)*?)';
exports.extendsRe   = 'extends(?:(?:.|\n|\r|\u2028|\u2029)*?)file="(.+?)"(?:(?:.|\n|\r|\u2028|\u2029)*?)';

exports.jsRe        = 'brisk_require_js(?:.*?)name=[\'\"](.+?)[\'\"](?:.*)';
exports.cssRe       = 'brisk_require_css(?:.*?)name=[\'\"](.+?)[\'\"](?:.*)';
exports.widgetRe    = 'brisk_widget(?:.*?)name=[\'\"](.+?)[\'\"](?:.*)';