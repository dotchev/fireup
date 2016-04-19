[![Linux Build Status](https://travis-ci.org/dotchev/fireup.svg?branch=master)](https://travis-ci.org/dotchev/fireup)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/el189f26694rwblo/branch/master?svg=true)](https://ci.appveyor.com/project/dotchev/fireup/branch/master)

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

**.fireup.yml**
```yml
processes:
  - name: proxy
    cmd: node proxy.js
    env:
      PORT: 8080
      FORWARD: >
        {
          "target": "http://localhost:8181",
          "tomeout": 15000
        }

  - name: app
    cmd: node start.js
    env:
      PORT: 8181
```
```sh
$ fup
```
![Screen](screen.png)

## Reference

### Command line

```sh
fup [<.fireup.yml>]
```
Start the processes defined in the given yaml file.
By default loads `.fireup.yml` from current directory.

### .fireup.yml

#### processes

List of processes to Start

#### name

Process name. Identifies the process in the output.

#### cmd

Shell command to start the Process

#### env

Additional environment variables for this process.
Parent environment is inherited by the process.
Can be used also at root level of `.fireup.yml` to define common environment variables for all processes.

#### dir

Process current working directory.
By default the directory of `.fireup.yml` (base directory).
If `dir` is relative, it is resolved from the base directory.
