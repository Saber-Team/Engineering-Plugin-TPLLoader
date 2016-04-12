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
const node_url = require('url');
const matcher = require('./matcher');

const openIdentifier = '{{';
const closeIdentifier = '}}';

// comments
const blockCommentRe = /\{{\*(.|\n)*?\*\}}/g;

// resource src
const resourceRe = new RegExp([
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

// resolve whether a path is __inline
const resolve = function(path) {
  var query = node_url.parse(path, true).query;
  return {
    inline: query ? query.__inline : false
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
  if (resource.isCompiled || resource.isPermanent) {
    return;
  }

  /**
   * @param {string} path
   */
  let checkExist = function(path) {
    var includedResource = map.getResourceByPath(path);
    if (!includedResource) {
      throw `Error path resource not found: ${path} in ${resource.path}`;
    }
    return includedResource;
  };

  // compile single resource
  emitter.emit('pre-compile-resource', resource);

  // compile referred resource recursively
  var content = resource.getContent()
    .replace(blockCommentRe, '')
    .replace(resourceRe, (tag, src) => {
      let path = node_path.join(resource.path, src);
      let ret = resolve(path);
      let inline = ret.inline;
      path = path.replace(/\?(.*)$/g, '');
      let includedResource = checkExist(path);
      let compiler = soi.getCompiler(includedResource.type);

      if (!includedResource.isCompiled) {
        compiler.exec(includedResource, map, rule, emitter);
      }

      // image
      if (tag.startsWith('<img')) {
        return tag.replace(src,
          inline ? includedResource.getDataUri() : includedResource.uri);
      }

      // line script will be skipped, only external script considered
      if (tag.startsWith('<script')) {
        if (inline) {
          return `<script>\n${includedResource.getContent()}\n</script>`;
        } else {
          return tag.replace(src, includedResource.uri);
        }
      }

      // link style
      if (tag.startsWith('<link')) {
        if (inline) {
          return `<style type="text/css">\n${includedResource.getContent()}\n</style>`;
        } else {
          return tag.replace(src, includedResource.uri);
        }
      }
    })
    .replace(briskRe, (tag, src) => {
      let path = node_path.join(resource.path, src);
      path = path.replace(/\?(.*)$/g, '');
      let includedResource = checkExist(path);
      let compiler = soi.getCompiler(includedResource.type);

      if (!includedResource.isCompiled) {
        compiler.exec(includedResource, map, rule, emitter);
      }

      return tag.replace(src, includedResource.id);
    })
    .replace(externalRe, (tag, src) => {
      // TODO
      let path = node_path.join(resource.path, src);
      path = path.replace(/\?(.*)$/g, '');
      let referredResource = checkExist(path);
      let compiler = soi.getCompiler(referredResource.type);

      if (!referredResource.isCompiled) {
        compiler.exec(referredResource, map, rule, emitter);
      }

      var relativePath = node_path.relative(resource.uri, referredResource.uri);
      return tag.replace(src, relativePath);
    });

  // replace content
  resource.setContent(content);

  // complete compile
  emitter.emit('compiled-resource', resource);
  resource.isCompiled = true;

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
};