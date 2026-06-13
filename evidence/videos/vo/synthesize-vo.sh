#!/usr/bin/env bash
# Synthesize the Signal Foundry demo VO from the SSML segments.
# Produces one .mp3 per segment plus a concatenated narration track.
# Requires ONE of:
#   Azure Speech:   export AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=eastus2
#   ElevenLabs:     export ELEVENLABS_API_KEY=...  (uses plain text, not SSML breaks)
# Run from anywhere; paths are absolute.
set -euo pipefail
VO="/Users/mattgraves/Development/hackathon-enterprise/evidence/videos/vo"
SEGS=(01-hook 02-discover 03-propose 04-risk 05-refuse 06-release 07-close)

if [[ -n "${AZURE_SPEECH_KEY:-}" ]]; then
  REGION="${AZURE_SPEECH_REGION:-eastus2}"
  echo "Synthesizing with Azure Speech ($REGION, neural)..."
  for s in "${SEGS[@]}"; do
    curl -sS -X POST "https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1" \
      -H "Ocp-Apim-Subscription-Key: ${AZURE_SPEECH_KEY}" \
      -H "Content-Type: application/ssml+xml" \
      -H "X-Microsoft-OutputFormat: audio-24khz-96kbitrate-mono-mp3" \
      --data-binary "@${VO}/${s}.ssml" -o "${VO}/${s}.mp3"
    echo "  ${s}.mp3"
  done
elif [[ -n "${ELEVENLABS_API_KEY:-}" ]]; then
  VOICE="${ELEVENLABS_VOICE_ID:-pNInz6obpgDQGcFmaJgB}"  # Adam; override as desired
  echo "Synthesizing with ElevenLabs (voice ${VOICE})..."
  for s in "${SEGS[@]}"; do
    # ElevenLabs takes plain text; strip SSML tags, keep sentence flow.
    TEXT=$(sed -e 's/<[^>]*>//g' "${VO}/${s}.ssml" | tr -s ' \n' ' ' | sed 's/^ *//')
    curl -sS -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE}" \
      -H "xi-api-key: ${ELEVENLABS_API_KEY}" -H "Content-Type: application/json" \
      -d "$(python3 -c "import json,sys; print(json.dumps({'text':sys.argv[1],'model_id':'eleven_multilingual_v2','voice_settings':{'stability':0.45,'similarity_boost':0.8,'style':0.3}}))" "$TEXT")" \
      -o "${VO}/${s}.mp3"
    echo "  ${s}.mp3"
  done
else
  echo "No TTS credentials. Set AZURE_SPEECH_KEY (+AZURE_SPEECH_REGION) or ELEVENLABS_API_KEY." >&2
  exit 1
fi

printf "file '%s'\n" "${SEGS[@]/#/${VO}/}" | sed 's/$/.mp3/' > "${VO}/concat.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "${VO}/concat.txt" -c:a libmp3lame -q:a 2 "${VO}/signal-foundry-vo-master.mp3"
echo "VO master: ${VO}/signal-foundry-vo-master.mp3"
echo "Mux onto the reference cut:"
echo "  ffmpeg -i evidence/videos/signal-foundry-demo-side-by-side-1080p.mp4 -i ${VO}/signal-foundry-vo-master.mp3 -c:v copy -c:a aac -shortest evidence/videos/signal-foundry-demo-narrated.mp4"
