![fireup](banner.png)

[![Linux Build Status](https://travis-ci.org/dotchev/fireup.svg?branch=master)](https://travis-ci.org/dotchev/fireup)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/el189f26694rwblo/branch/master?svg=true)](https://ci.appveyor.com/project/dotchev/fireup/branch/master)
[![npm](https://img.shields.io/npm/v/fireup.svg)](https://www.npmjs.com/package/fireup)

fireup
======

In the world of microservices to test locally our application, we often need to
start multiple processes, each with its own options and environment.
Using _fireup_ we can do this with a single command and watch the output in a
single console, just like a monolith application.

Inspired by [Foreman](http://blog.daviddollar.org/2011/05/06/introducing-foreman.html), [node-foreman](https://github.com/strongloop/node-foreman) and
Cloud Foundry [manifest.yml](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html).

What's in:
* Launch multiple processes with a single command
* Aggregate output of all processes in the same console
* All configuration in one yaml file (think of Procfile and .env combined)
* Multi-line environment variables
* For each process specify
  * Shell command to start
  * Environment variables
  * Working directory
* Common env vars for all processes
* Tested on
  * Linux
  * Windows

What's out:
* Scaling (multiple instances of one process type)
* Monitoring and auto restart
* Load balancing and proxying
* Export to other process managers
* Port assignment

## Install

```sh
$ [sudo] npm install -g fireup
```

## Example

**fireup.yml**
```yml
processes:
  proxy:
    cmd: node proxy.js
    env:
      PORT: 8080
      FORWARD: >
        {
          "target": "http://localhost:8181",
          "tomeout": 15000
        }

  app:
    cmd: node start.js
    env:
      PORT: 8181
```
```sh
$ fireup
```
![Screen](screen.png)

## Reference

### Command line

```sh
fireup [<fireup.yml>]
```
Start the processes defined in the given yaml file.
By default loads `fireup.yml` from current directory.

### fireup.yml

#### processes

An object inside which each property describes a processes to start.
The property name is the process name.
The value can be a shell command to start the respective process.
Alternatively it can be an object specifying additional process properties.

```yml
processes:
  app: node start.js
```

#### cmd

Shell command to start the process
_Mandatory_

#### env

Additional environment variables for this process.
Parent environment is inherited by the process.
Can be used also at root level of `fireup.yml` to define common environment variables for all processes.

#### dir

Process current working directory.
By default the directory of `fireup.yml` (base directory).
If `dir` is relative, it is resolved from the base directory.

## History

See [release history](https://github.com/dotchev/fireup/releases) in GitHub.
There are breaking changes since version 1.

## License

[MIT](LICENSE)
