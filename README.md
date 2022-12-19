# crabviz

crabviz is a static code analysis tool that generates interactive call graph.

## Preview

![preview](https://user-images.githubusercontent.com/20551552/206857636-4f7ad70f-2f65-4f0a-ac77-8f6cca7515e5.gif)

## Supported Languages

* Rust
* Go

## Setup

- `git clone <this_repo`
- `docker build -t crabviz .`

## Run

1. Start the container: `docker run --rm -it -v ~/stripe/gocode/bigfoot/:/gosrc/ crabviz bash`
2. In the container
    1. Test if the binary is running fine: `crabviz`
    2. Test if the volume is loaded correctly: `ls /gosrc/`
  
  
## Features

* show types and functions in files
* draw the calling relationships
* draw the interface implementation relationships
* highlight edges with different colors depending on calling relationships

## TODOs

* support more languages
* beautify UI
* collapse folders
* draw type relationships
* generate graph for specified files

## Credits

crabviz is inspired by [graphql-voyager](https://github.com/APIs-guru/graphql-voyager) and [
go-callvis](https://github.com/ofabry/go-callvis)
