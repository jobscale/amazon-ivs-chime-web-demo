import { logger } from '../../tools';

const videoPlayer = 'https://player.live-video.net/1.6.1/amazon-ivs-player.min.js';

export default {
  name: 'videoPlayer',
  props: ['videoStream'],
  data() {
    return {
      mediaPlayerScript: document.createElement('script'),
    };
  },
  mounted() {
    this.mediaPlayerScript.src = videoPlayer;
    this.mediaPlayerScript.async = true;
    this.mediaPlayerScript.onload = () => this.mediaPlayerScriptLoaded();
    document.body.appendChild(this.mediaPlayerScript);
  },
  methods: {
    mediaPlayerScriptLoaded() {
      // This shows how to include the Amazon IVS Player with a script tag from our CDN
      // If self hosting, you may not be able to use the create() method since it requires
      // that file names do not change and are all hosted from the same directory.

      // First, check if the browser supports the Amazon IVS player.
      if (!window.IVSPlayer.isPlayerSupported) {
        logger.warn(
          'The current browser does not support the Amazon IVS player.',
        );
        return;
      }

      const { PlayerState, PlayerEventType } = window.IVSPlayer;

      // Initialize player
      const player = window.IVSPlayer.create();
      player.attachHTMLVideoElement(this.$refs.videoElement);

      // Attach event listeners
      player.addEventListener(PlayerState.PLAYING, () => {
        logger.debug('Player State - PLAYING');
      });
      player.addEventListener(PlayerState.ENDED, () => {
        logger.debug('Player State - ENDED');
      });
      player.addEventListener(PlayerState.READY, () => {
        logger.debug('Player State - READY');
      });
      player.addEventListener(PlayerEventType.ERROR, (err) => {
        logger.warn('Player Event - ERROR:', err);
      });

      player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
        const metadataText = cue.text;
        const position = player.getPosition().toFixed(2);
        logger.debug(
          `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`,
        );
      });

      // Setup stream and play
      player.setAutoplay(true);
      player.load(this.videoStream);

      // Setvolume
      player.setVolume(0.1);

      // Show/Hide player controls
      this.$refs.playerOverlay.addEventListener('mouseover', () => {
        this.$refs.playerOverlay.classList.add('overlay--hover');
      }, false);
      this.$refs.playerOverlay.addEventListener('mouseout', () => {
        this.$refs.playerOverlay.classList.remove('overlay--hover');
      });

      // Controls events
      // Play/Pause
      this.$refs.btnPlay.addEventListener('click', () => {
        if (this.$refs.btnPlay.classList.contains('player-btn--play')) {
          // change to pause
          this.$refs.btnPlay.classList.remove('player-btn--play');
          this.$refs.btnPlay.classList.add('player-btn--pause');
          player.pause();
        } else {
          // change to play
          this.$refs.btnPlay.classList.remove('player-btn--pause');
          this.$refs.btnPlay.classList.add('player-btn--play');
          player.play();
        }
      }, false);

      // Mute/Unmute
      this.$refs.btnMute.addEventListener('click', () => {
        if (this.$refs.btnMute.classList.contains('player-btn--mute')) {
          this.$refs.btnMute.classList.remove('player-btn--mute');
          this.$refs.btnMute.classList.add('player-btn--unmute');
          player.setMuted(1);
        } else {
          this.$refs.btnMute.classList.remove('player-btn--unmute');
          this.$refs.btnMute.classList.add('player-btn--mute');
          player.setMuted(0);
        }
      }, false);
    },
  },
};
