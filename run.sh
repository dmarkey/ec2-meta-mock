#!/bin/bash
if [ -n "$1" ]
  then
    cd $1
fi
nohup sudo -E node main.js &
