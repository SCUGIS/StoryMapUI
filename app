#!/bin/bash
node_options="--use_strict --gc_global"
ignoreItems=".git"
server="index.js"

if [ "$1" == "pm2" ]; then
  pm2 start --name STROYMAPUI --watch --ignore-watch="$ignoreItems" --node-args="$node_options" $server
elif [ "$1" == "sup" ] || [ "$1" == "supervisor" ]; then
  supervisor --ignore "$ignoreItems" -- $node_options $server
else
  node $node_options $server
fi
