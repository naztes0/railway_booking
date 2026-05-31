#!/bin/bash


PATTERNS=("naive" "constraint" "pessimistic" "optimistic")
VUS_LIST=(5 10 50 100 500 1000)

echo "Starting SOAK benchmark..."
echo "Patterns: ${PATTERNS[*]}"
echo "VU counts: ${VUS_LIST[*]}"
echo "Total runs: $((${#PATTERNS[@]} * ${#VUS_LIST[@]}))"
echo "----------------------------------------"

for PATTERN in "${PATTERNS[@]}"; do
  for VUS in "${VUS_LIST[@]}"; do
    echo "Running SOAK: $PATTERN with $VUS VUs for 1 minute..."
    k6 run --env PATTERN=$PATTERN --env VUS=$VUS k6/scripts/soak_benchmark.js
    echo "Done: $PATTERN $VUS"
    echo "----------------------------------------"
    sleep 5
  done
done

echo "All SOAK benchmarks complete!"