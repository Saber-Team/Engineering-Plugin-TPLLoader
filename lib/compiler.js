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
 * @file compile tpl file
 * @author AceMood
 */

'use strict';

const node_path = require('path');
const node_url  = require('url');
const matcher   = require('./matcher');

const openIdentifier  = '{{';
const closeIdentifier = '}}';

// comments
const blockCommentRe = /\{{\*(.|\n)*?\*\}}/g;

// resource src
const exStaticRe = new RegExp([
  matcher.scriptTagRe,
  matcher.linkTagRe,
  matcher.imageTagRe
].join('|'), 'igm');

const externalRe = new RegExp([
  openIdentifier + matcher.extendsRe + closeIdentifier,
  openIdentifier + matcher.includeRe + closeIdentifier
].join('|'), 'gm');

const briskRe = new RegExp([
  openIdentifier + matcher.jsRe + closeIdentifier,
  openIdentifier + matcher.cssRe + closeIdentifier
].join('|'), 'gm');

const widgetRe = new RegExp(
  openIdentifier + matcher.widgetRe + closeIdentifier,
  'gm'
);

// resolve whether a path is __inline
const resolve = function(path) {
  var query = node_url.parse(path, true).query;
  return {
    inline: query.__inline !== undefined
  };
};

/**
 * Put compiler back to soi. Apart from `neo-core` make this easy to
 * debug when develop and publish.
 * Plug-in architecture realize through event emitter. As we do not
 * plan to support `async-event-listener` in the future. Current mechanism
 * of node.js event emitter architecture is useful for us.
 * During compiling, an `isCompiled` property will be added to the resource
 * to avoid duplicated compilation.
 *
 * @param {TPL} resource tpl resource
 * @param {ResourceMap} map resource map object
 * @param {!object} rule contains pattern and to
 * @param {EventEmitter} emitter
 */
var exec = exports.exec = function(resource, map, rule, emitter) {
  if (resource.isCompiled) {
    return;
  }

  let checkExist = function(path) {
    var includedResource = map.getResourceByPath(path);
    if (!includedResource) {
      throw `Error path resource not found: ${path} in ${resource.path}`;
    }
    return includedResource;
  };

  let isValidPath = function(path) {
    return !/{{.*\}\}/g.test(path);
  };

  let isTopLevelPath = function(path) {
    return !node_path.isAbsolute(path) && (path.charAt(0) !== '.');
  };

  // compile single resource
  emitter.emit('pre-compile-resource', resource);

  if (!resource.isPermanent) {

    // compile referred resource recursively
    var content = resource.getContent()
      // .replace(blockCommentRe, '')
      // 处理普通的 html 外链资源标签
      .replace(exStaticRe, (tag, $1, $2, $3) => {
        let addr = $1 || $2 || $3;

        // may contains smarty variables
        if (!isValidPath(addr)) {
          return tag;
        }

        // skip absolute url
        if (soi.util.isAbsUrl(addr) || node_path.isAbsolute(addr)) {
          return tag;
        }

        let path = node_path.join(node_path.dirname(resource.path), addr);
        let ret = resolve(path);
        let inline = ret.inline;
        path = path.replace(/\?(.*)$/g, '');
        let includedResource = checkExist(path);
        let compiler = soi.getCompiler(includedResource.type);

        if (!includedResource.isCompiled) {
          let to = '';
          let hitOptions = emitter.rules.match(includedResource.path);
          if (hitOptions) {
            to = hitOptions.to;
            if (typeof to !== 'string') {
              soi.log.error('rule\'s to property must be string.');
              throw new Error('the path ' + to + ' must be string');
            }
          }
          compiler.exec(includedResource, map, hitOptions, emitter);
        }

        // image
        if (tag.toLowerCase().startsWith('<img')) {
          return tag.replace(addr,
            inline ? includedResource.getDataUri() : includedResource.uri);
        }

        // line script will be skipped, only external script considered
        if (tag.toLowerCase().startsWith('<script')) {
          if (inline) {
            return `<script>\n${includedResource.getContent()}\n</script>`;
          } else {
            return tag.replace(addr, includedResource.uri);
          }
        }

        // link style
        if (tag.toLowerCase().startsWith('<link')) {
          if (inline) {
            return `<style type="text/css">\n${includedResource.getContent()}\n</style>`;
          } else {
            return tag.replace(addr, includedResource.uri);
          }
        }
      })
      // 处理 brisk_require_(js|css) 函数
      .replace(briskRe, (tag, $1, $2) => {
        let addr = $1 || $2;
        let path = node_path.join(node_path.dirname(resource.path), addr);
        path = path.replace(/\?(.*)$/g, '');
        let includedResource = checkExist(path);
        let compiler = soi.getCompiler(includedResource.type);

        if (!includedResource.isCompiled) {
          let to = '';
          let hitOptions = emitter.rules.match(includedResource.path);
          if (hitOptions) {
            to = hitOptions.to;
            if (typeof to !== 'string') {
              soi.log.error('rule\'s to property must be string.');
              throw new Error('the path ' + to + ' must be string');
            }
          }
          compiler.exec(includedResource, map, hitOptions, emitter);
        }

        return tag.replace(addr, includedResource.id);
      });

    // replace content
    resource.setContent(content);

  }

  // complete compile
  emitter.emit('compiled-resource', resource);

  // resolve uri of current js file
  emitter.emit('pre-resolve-resource', resource);

  if (rule.pattern && rule.to) {
    let to = rule.to;
    let pathObj = node_path.parse(to);
    if (!pathObj.ext) {
      to = (soi.util.isDirPath(to) ? to : to + '/')
        + node_path.basename(resource.path);
    }

    resource.uri = resource.path.replace(rule.pattern, to);
  } else {
    resource.uri = resource.path;
  }

  // complete resolve
  emitter.emit('resolved-resource', resource);

  content = resource.getContent()
    // 处理smarty的include 和 extends 函数
    .replace(externalRe, (tag, $1, $2) => {
      let addr = $1 || $2;
      let path = node_path.join(node_path.dirname(resource.path), addr);
      path = path.replace(/[\?#](.*)$/g, '');
      let includedResource = checkExist(path);

      if (!includedResource.isCompiled) {
        let to = '';
        let hitOptions = emitter.rules.match(includedResource.path);
        if (hitOptions) {
          to = hitOptions.to;
          if (typeof to !== 'string') {
            soi.log.error('rule\'s to property must be string.');
            throw new Error('the path ' + to +' must be string');
          }
        }
        exec(includedResource, map, hitOptions, emitter);
      }

      var relativePath = node_path.relative(
          node_path.dirname(resource.uri),
          includedResource.uri
      );

      if (isTopLevelPath(relativePath)) {
        relativePath = './' + relativePath;
      }

      return tag.replace(addr, relativePath);
    })
    // 处理 brisk_widget 函数
    .replace(widgetRe, (tag, name) => {
      let path = node_path.join(node_path.dirname(resource.path), name);
      path = path.replace(/[\?#](.*)$/g, '');
      let includedResource = checkExist(path);

      if (!includedResource.isCompiled) {
        let to = '';
        let hitOptions = emitter.rules.match(includedResource.path);
        if (hitOptions) {
          to = hitOptions.to;
          if (typeof to !== 'string') {
            soi.log.error('rule\'s to property must be string.');
            throw new Error('the path ' + to + ' must be string');
          }
        }
        exec(includedResource, map, hitOptions, emitter);
      }

      var relativePath = node_path.relative(
          node_path.dirname(resource.uri),
          includedResource.uri
      );

      if (isTopLevelPath(relativePath)) {
        relativePath = './' + relativePath;
      }

      return tag.replace(name, includedResource.id + '" path="' + relativePath);
    });

  // replace content
  resource.setContent(content);

  // 延迟isCompiled赋值
  resource.isCompiled = true;
};