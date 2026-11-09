#!/bin/bash
# uso: pipeline.sh entrada.glb carpeta_salida tamaño_textura
set -e
IN=$1;D=$2;T=${3:-1024};mkdir -p $D;cd /tmp/claude-0/gt
node limpiar.mjs $IN $D/c1.glb 2>&1 | grep -v clearcoat | tail -1
rm -rf $D/tx && node texout.mjs $D/c1.glb $D/tx out && python3 /tmp/claude-0/sangrar.py $D/tx >/dev/null && node texout.mjs $D/c1.glb $D/tx in $D/c2.glb
cd $D && npx --yes @gltf-transform/cli@4.1.1 resize c2.glb c3.glb --width $T --height $T >/dev/null 2>&1 && npx --yes @gltf-transform/cli@4.1.1 webp c3.glb c4.glb >/dev/null 2>&1 && npx --yes @gltf-transform/cli@4.1.1 quantize c4.glb final.glb >/dev/null 2>&1
ls -la $D/final.glb
