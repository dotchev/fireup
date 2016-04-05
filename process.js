'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var spawn = require('child_process').spawn;
var utils = require('./utils');

module.exports = Process;

var colors = [
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.magenta,
  chalk.cyan
];

function Process(doc, proc, idx) {
  this.name = proc.name;
  this.cmd = proc.cmd;
  this.env = _.assign({}, process.env, doc.env, proc.env);
  this.dir = proc.dir;
  this.color = colors[idx % colors.length];
}

Process.prototype.start = function () {
  var file, args;
  // from exec implementation
  if (process.platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', '"' + this.cmd + '"'];
  } else {
    file = '/bin/sh';
    args = ['-c', this.cmd];
  }
  var child = spawn(file, args, {
    env: this.env,
    cwd: this.dir
  });
  this.info(`${this.name} started with pid ${child.pid}`);

  child.stdout.on('data', (data) => {
    this.log(data.toString('utf8'));
  });

  child.stderr.on('data', (data) => {
    this.log(data.toString('utf8'));
  });

  child.on('close', (code) => {
    this.info(`${this.name} exited with code ${code}`);
  });
}

Process.prototype.log = function (msg) {
  utils.splitLines(msg).forEach(function(line) {
    console.log(this.color(this.name + '> ') + line);
  }, this);
};

Process.prototype.info = function (msg) {
  console.log(this.color(msg));
};
