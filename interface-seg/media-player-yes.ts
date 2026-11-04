// define player secidific interfaces for audio and video players

interface AudioPlayerController {
    playAudio(audioFile: string): void;
    stopAudio(): void;
    adjustAudioVolume(volume: number): void;
}

interface videoPlayerCoontroller {
    playVideo(videoFile: string): void;
    stopvideo(): void;
    adjustVideoBrightness(brightness: number): void;
    displaySubtitles(subtitleFile: string): void;
} 


// now our specific player only imeplemnts the interfaces they need 

// Audio Player
class ModernAudioPlayer implements AudioPlayerController {
    playAudio(audioFile: string): void {
        console.log(`Playing audio file: ${audioFile}`);
    }   
    stopAudio(): void {
        console.log(`Stopping audio playback.`);
    }
    adjustAudioVolume(volume: number): void {
        console.log(`Adjusting audio volume to: ${volume}`);
    }
}

// Video Player
class SilentVideoPlayer implements videoPlayerCoontroller {
    playVideo(videoFile: string): void {
        console.log(`Playing video file: ${videoFile}`);
    }
    stopvideo(): void {
        console.log(`Stopping video playback.`);
    }
    adjustVideoBrightness(brightness: number): void {
        console.log(`Adjusting video brightness to: ${brightness}`);
    }
    displaySubtitles(subtitleFile: string): void {
        console.log(`Displaying subtitles from file: ${subtitleFile}`);
    }
}

// a comprehensoive player which plays both audios and videos
// can implement both interfaces

class ComprehensiveMediaPlayer implements AudioPlayerControls, VideoPlayerControls {
    playAudio(audioFile: string): void {
        console.log(`ComprehensiveMediaPlayer: Playing audio - ${audioFile}`);
    }

    stopAudio(): void {
        console.log("ComprehensiveMediaPlayer: Audio stopped.");
    }

    adjustAudioVolume(volume: number): void {
        console.log(`ComprehensiveMediaPlayer: Audio volume set to ${volume}`);
    }

    playVideo(videoFile: string): void {
        console.log(`ComprehensiveMediaPlayer: Playing video - ${videoFile}`);
    }

    stopVideo(): void {
        console.log("ComprehensiveMediaPlayer: Video stopped.");
    }

    adjustVideoBrightness(brightness: number): void {
        console.log(`ComprehensiveMediaPlayer: Brightness set to ${brightness}`);
    }

    displaySubtitles(subtitleFile: string): void {
        console.log(`ComprehensiveMediaPlayer: Subtitles from ${subtitleFile}`);
    }
}

// ISP and LSP are closelyb aligned
// Isp makes suee that interfaces are minimal and relevant
// LSP makes sure that the implementation fof those interfaces 
// behave correctly and predictably, so that derived classes can be used 
// interchangeably with their base classes without unexpected behavior.