#!/bin/bash
set -e; for t in test/*.js; do node $t; done