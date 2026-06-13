# Demo VO — synthesis assets

Seven SSML segments matching the beats in
`docs/submission/demo-video-production-prompt.md`, tuned for a warm,
human cadence (prosody rate -4%, em-dash breaks, emphasis on proof points).

## Generate the audio

Pick a voice engine and export a key, then run the driver:

```bash
# Azure Speech (free tier covers this; eastus2 already in use for the project)
export AZURE_SPEECH_KEY=...   AZURE_SPEECH_REGION=eastus2
bash evidence/videos/vo/synthesize-vo.sh

# or ElevenLabs (most natural; paid)
export ELEVENLABS_API_KEY=...   # optional: ELEVENLABS_VOICE_ID=...
bash evidence/videos/vo/synthesize-vo.sh
```

Output: `01-hook.mp3 … 07-close.mp3` and `signal-foundry-vo-master.mp3`.

## Attach to the video

Quick mux onto the silent reference cut:

```bash
ffmpeg -i evidence/videos/signal-foundry-demo-side-by-side-1080p.mp4 \
  -i evidence/videos/vo/signal-foundry-vo-master.mp3 \
  -c:v copy -c:a aac -shortest evidence/videos/signal-foundry-demo-narrated.mp4
```

For the polished final, time each segment's MP3 to its shot (the prompt's
timing table) in any editor rather than a single concat — the VO is segmented
precisely so each beat lands on its visual.

## Voice choice

Default is Azure `en-US-AndrewMultilingualNeural` (warm male) / ElevenLabs
"Adam". Swap the `<voice name="...">` in each .ssml (Azure) or `ELEVENLABS_VOICE_ID`
to retune. `en-US-AvaNeural` (Azure) is a strong warm female alternative.

## Demo voice (saved for the morning re-synth)

ElevenLabs Voice ID `REDACTED-VOICE-ID` is the chosen demo voice and is now
the script default (verified accessible via the API on 2026-06-13). To regenerate
the narration in this voice tomorrow:

```bash
export ELEVENLABS_API_KEY=...   # from your temp file, not committed
bash evidence/videos/vo/synthesize-vo.sh   # uses the saved voice ID automatically
```
