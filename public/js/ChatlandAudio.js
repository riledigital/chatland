import { zzfx } from "https://cdn.skypack.dev/zzfx";

class ChatlandAudio {
  constructor() {}

  playSound(sound) {
    switch (sound) {
      case "psa": {
        zzfx(...[0.25, , 1193, 0.01, 0.02, 0.09, , 2.29, -8.7, , 69]); // Blip 7
        break;
      }
      case "chat": {
        console.log("sfx");
        zzfx(
          ...[
            0.5,
            0,
            520,
            0.11,
            ,
            0.01,
            ,
            6,
            90,
            ,
            -850,
            0.37,
            ,
            ,
            ,
            ,
            ,
            0,
            0.03
          ]
        ); // Blip 3        break;
      }
      default: {
        return null;
      }
    }
  }
}

export default ChatlandAudio;
