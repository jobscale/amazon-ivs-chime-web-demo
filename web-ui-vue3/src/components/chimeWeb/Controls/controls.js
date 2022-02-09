import { logger } from '../../../tools';
import { chime } from '../../../chime/ChimeSdkWrapper';
import { BASE_HREF } from '../../../config';

export default {
  name: 'Controls',
  props: ['openSettings', 'videoElement'],
  data() {
    return {
      muted: false,
      videoStatus: 'Disabled',
      spinning: false,
      data: {},
    };
  },
  mounted() {
    this.data = this.$storage.getStorageSync('chime');
    this.onMuted = this.onMuted || (muted => this.muted = muted);
    chime.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio(this.onMuted);
  },
  beforeUmount() {
    if (chime.audioVideo) {
      chime.audioVideo.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(this.onMuted);
    }
  },
  methods: {
    async muteButtonOnClick() {
      if (this.muted) {
        chime.audioVideo.realtimeUnmuteLocalAudio();
        this.muted = false;
      } else {
        chime.audioVideo.realtimeMuteLocalAudio();
        this.muted = true;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    },
    async videoButtonOnClick() {
      await new Promise(resolve => setTimeout(resolve, 10));
      if (this.videoStatus === 'Disabled') {
        this.videoStatus = 'Loading';
        try {
          if (!chime.currentVideoInputDevice) {
            throw new Error('currentVideoInputDevice does not exist');
          }

          try {
            await chime.chooseVideoInputDevice(chime.currentVideoInputDevice);
          } catch (e) {
            logger.error(e.message);
            const videoInputDevices = await chime.audioVideo.listVideoInputDevices();
            await chime.audioVideo.chooseVideoInputDevice(videoInputDevices[0].deviceId);
          }

          chime.audioVideo.startLocalVideoTile();
          this.videoStatus = 'Enabled';
        } catch (e) {
          logger.error(e.message);
          this.videoStatus = 'Disabled';
        }
      } else if (this.videoStatus === 'Enabled') {
        this.videoStatus = 'Loading';
        chime.meetingSession.audioVideo.stopLocalVideoTile();
        this.videoStatus = 'Disabled';
      }
    },
    async endButtonOnClick() {
      this.spinning = true;
      await chime.leaveRoom(this.data.role === 'host');
      this.$storage.removeStorageSync('chime');
      window.location.href = `${BASE_HREF}/end`;
      this.spinning = false;
    },
  },
};
