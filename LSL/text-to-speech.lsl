// Request a text-to-speech sound clip from Bonnie and play it.

// UUID of the Bonnie TTS bot.
key bonnieBelle86 = "5a6b0045-12db-4bf6-8108-7c27f024ca5b";

// Secret key for authentication.
string secret = "REPLACE_ME_WITH_A_SECRET_KEY"; // Replace with your secret key from config.ts

// Choose your own voice!
// Examples:
// Mimic3 voices can be found at https://mycroftai.github.io/mimic3-voices/
// string voice = "en_US/cmu-arctic_low#ljm";
// string voice = "de_DE/thorsten-emotion_low#drunk";
string voice = "en_US/vctk_low#p239";

// Customize your voice!
// Adjust pitch: larger numbers are higher, smaller numbers are deeper.
integer pitch = 0;

// Adjust scale: larger numbers are slower, smaller numbers are faster.
float scale = 1.0; 

string URL = "";

requestTTS(string text) {
    // Truncate text so we don't overflow the llInstantMessage limit.
    text = llBase64ToString(llGetSubString(llStringToBase64(text), 0, 512));

    string message = llList2Json(JSON_OBJECT, [
        "command", "tts",
        "voice", voice,
        "scale", scale,
        "pitch", pitch,
        "body", text,
        "url", URL,
        "secret", secret
    ]);
    
    llInstantMessage(bonnieBelle86, message);
}

default {
    on_rez(integer n) {
        llResetScript();
    }
    
    state_entry() {
        llRequestURL();
        llListen(0, "", "", "");
        llSetTimerEvent(3600);
    }
    
    listen(integer c, string n, key i, string m) {
        // Do not read /me in emotes.
        if (llGetSubString(m, 0, 2) == "/me") {
            m = llGetSubString(m, 3, -1);
        }
        
        llSetTimerEvent(60);
        requestTTS(m);
    }
    
    http_request(key id, string method, string body) {
        if (method == URL_REQUEST_GRANTED) {
            URL = body;
        } else {
            llHTTPResponse(id, 200, "OK");
            llSetTimerEvent(0);
            llSetTimerEvent(3600);
            string sound = llJsonGetValue(body, ["uuid"]);
            float duration = (float)llJsonGetValue(body, ["duration"]);
            llTriggerSound(sound, 1.0);
            llSleep(duration);
        }
    }
    
    changed(integer change) { 
        if (change & CHANGED_TELEPORT) {
            llResetScript();
        }
        if (change & CHANGED_REGION){
            llResetScript();
        }
        if (change & CHANGED_OWNER) {
            llResetScript();
        }
    }
    
    timer() {
        llResetScript();
    }
}
