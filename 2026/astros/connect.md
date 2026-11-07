## Play it on a FM-1

Open the website in Chrome, Edge or Firefox and Astros plays its music as plain MIDI, ready for a synth. The first target is the [M-VAVE FM-1](https://www.cuvave.com/product?id=fm-1) pocket synth running the open [Felucca](https://github.com/hugelton/Felucca) firmware, whose 4 tracks are the 4 voices.

1. **Flash Felucca** onto the FM-1 (firmwares: [fm1-editor.com/firmware](https://fm1-editor.com/firmware)). Other firmwares map MIDI differently.
2. **Plug it in by USB** and, turn on the FM-1 
3. **Choose a sound for each track.** Each track plays one voice, and its instrument is yours to pick:

   | Ch | Voice | Suggested sound |
   |---|---|---|
   | 1 | The Sun, always playing | warm and round: soft e-piano, mellow organ, marimba |
   | 2 | Planets in union (conjunction, or no aspect) | pure and centred: music box, kalimba, soft flute |
   | 3 | Planets in harmony (sextile, trine) | open and airy: celesta, glockenspiel, glass bells |
   | 4 | Planets in tension (square, opposition) | friendly friction: FM bell, vibraphone, muted pluck |

   Astros only colours each sound with standard CCs (level, pan, attack, release, brightness, reverb, chorus, delay). If a register sounds too low or high, move that track's octave on the synth.
4. **Open the page and allow MIDI access** when the browser asks (it needs https or localhost). If more than one MIDI port exists, pick the FM-1 in the selector at the bottom left; it is remembered. `?midi=NAME` in the URL chooses it too.
5. Press `d` to visualize the different MIDI events for each channel and then press `/` to play the chart sequentially. 
6. Fullscreen the app by pressing on the icon on the lower right coorner

Keep the tab visible: browsers pause hidden tabs, and the music stops with them.