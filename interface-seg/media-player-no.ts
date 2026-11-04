// the problem is a fat interface 
// like a media player trying to play both audio and video

interface MediaPlayer {
    playAudio(audioFile: string): void;
    stopAudio(): void;
    adjustAudioVolume(volume: number): void;
    playVideo(videoFile: string): void;
    stopVideo(): void;
    adjustVideoBrightness(brightness: number): void;
    displaySubtitles(subtitleFile: string): void;
}

// Let's say we want to create a pure audio player that implements the MediaPlayer interface.
class AudioPlayer implements MediaPlayer {
    playAudio(audioFile: string): void {
        console.log(`Playing audio file: ${audioFile}`);
    }

    stopeAudio(): void {
        console.log(`Stopping audio playback.`);
    }

    adjustAudioVolume(volume: number): void {
        console.log(`Adjusting audio volume to: ${volume}`);
    }   

    // methods that this player should not implement, but is forced to due to the interface
    playVideo(videoFile: string): void {
        throw new Error("AudioPlayer cannot play video files.");
    }

    stopVideo(): void {
        throw new Error("AudioPlayer cannot stop video playback.");
    }
    
    adjustVideoBrightness(brightness: number): void {
        throw new Error("AudioPlayer cannot adjust video brightness.");
    }   

    displaySubtitles(subtitleFile: string): void {
        throw new Error("AudioPlayer cannot display subtitles.");
    }   
}

// evn tbhough audio playerf needs omnly audio methods, 
// it is forced to implement video methods as well, which violates 
// the Liskov Substitution Principle. 

// for example adding a new method like picture in picture mode,
//  would require all media players to implement it,
//  even if they don't support it.

