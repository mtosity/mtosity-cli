# Harmonica Video Echo Enhancement

## Source File
`/Users/mtosity/Documents/O+ Connect/VID20260124162411.mp4`

## Output File
`/Users/mtosity/Documents/O+ Connect/VID20260124162411_echo.mp4`

## Final FFmpeg Command
```bash
ffmpeg -y -i "INPUT.mp4" \
  -af "bass=g=3:f=100,aecho=0.8:0.88:100|190:0.45|0.32,aecho=0.8:0.88:115:0.36,volume=1.5" \
  -c:v copy \
  "OUTPUT_echo.mp4"
```

## Parameters Explained
- `bass=g=3:f=100` - Bass boost: +3dB gain at 100Hz (adds warmth)
- `aecho=in_gain:out_gain:delays:decays`
- First echo: delays 100ms & 190ms, decays 0.45 & 0.32
- Second echo: delay 115ms, decay 0.36
- `volume=1.5` - 50% volume boost
- Video is copied without re-encoding (`-c:v copy`)

## Notes
- Tested multiple echo levels before settling on this balanced setting
- Echo only (no bass): `aecho=0.8:0.88:80|150:0.4|0.25,aecho=0.8:0.88:90:0.3`
- Too little: `aecho=0.8:0.88:60:0.4,aecho=0.8:0.88:100:0.27`
- Too much: `aecho=0.8:0.9:200|400:0.5|0.3,aecho=0.8:0.9:150:0.4`
