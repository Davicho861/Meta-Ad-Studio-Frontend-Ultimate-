#!/usr/bin/env bash
set -e
echo "🚀 Orquestador directo: generar video vía proxy y producir evidencia"

PROXY_URL=""
IMG_URL="/images/campaign-examples/nexus_arena_shibuya.jpg"
FULL_IMG_URL="http://localhost:5173${IMG_URL}"
OUTDIR="output"
mkdir -p "$OUTDIR"

echo "Direct orchestrator: proxy flow removed in local-first release. Use local fallback generation via generate-demo-local.sh or run-final-demo.sh"
echo "To generate the demo locally, run: bash scripts/generate-demo-local.sh"
