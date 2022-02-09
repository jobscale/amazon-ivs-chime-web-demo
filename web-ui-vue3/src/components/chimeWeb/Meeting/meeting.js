import { MeetingSessionStatusCode } from 'amazon-chime-sdk-js';
import { logger } from '../../../tools';

// Components
import VideoPlayer from '../../VideoPlayer/videoPlayer.vue';
import Chat from '../../Chat/chatView.vue';
import Controls from '../Controls/controlsView.vue';
import Settings from '../Settings/settingsView.vue';
import LocalVideo from '../LocalVideo/localVideo.vue';
import RemoteVideoGroup from '../RemoteVideoGroup/remoteVideoGroup.vue';
import Error from '../Error/errorView.vue';

import { BASE_HREF } from '../../../config';
import { chime } from '../../../chime/ChimeSdkWrapper';

// Styles
import '../chimeWeb.css';

export default {
  name: 'Meeting',
  components: {
    VideoPlayer,
    Chat,
    Controls,
    Settings,
    LocalVideo,
    RemoteVideoGroup,
    Error,
  },
  data() {
    return {
      chime,
      meetingStatus: '',
      showSettings: false,
      showError: false,
      errorMsg: undefined,
      data: {
        playbackURL: undefined,
        username: undefined,
        title: undefined,
        role: undefined,
        joinInfo: undefined,
      },
    };
  },
  mounted() {
    this.data = this.$storage.getStorageSync('chime');

    if (!(this.data.title && this.data.username && this.data.role)) {
      window.location.href = `${BASE_HREF}/end`;
      return;
    }
    if (!(this.data.role !== 'host' || this.data.playbackURL)) {
      window.location.href = `${BASE_HREF}/end`;
      return;
    }

    this.start();
  },

  methods: {
    async start() {
      try {
        const { username, room, role } = this.data;
        logger.debug({ username, room, role });

        if (!this.data.joinInfo) {
          this.data.name = username;
          const joinInfo = await chime.createRoom(this.data);
          this.data.joinInfo = joinInfo;
          this.$storage.setStorageSync('chime', this.data);
          this.data.playbackURL = this.data.joinInfo.PlaybackURL;
        } else {
          // Browser refresh
          await chime.reInitializeMeetingSession(this.data.joinInfo, username);
          this.data.playbackURL = this.data.joinInfo.PlaybackURL;
        }
        this.meetingStatus = 'Success';

        chime.audioVideo.addObserver({
          audioVideoDidStop: async sessionStatus => {
            if (
              sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded
            ) {
              chime.leaveRoom(role === 'host');
              window.location.href = `${BASE_HREF}/${role === 'host' ? '' : 'end'}`;
            }
          },
        });

        await chime.joinRoom(this.$refs.audioElementRef);
      } catch (e) {
        logger.debug('error', e.message);
        this.errorMsg = e.message;
        this.showError = true;
        this.meetingStatus = 'Failed';
      }
    },

    closeError() {
      this.showError = false;
    },

    saveSettings(currentAudioInputDevice, currentAudioOutputDevice, currentVideoInputDevice) {
      chime.chooseCurrentVideoInputDevice = currentVideoInputDevice;
      chime.chooseCurrentAudioinputDevice = currentAudioInputDevice;
      chime.chooseCurrentAudioOutputDevice = currentAudioOutputDevice;

      this.showSettings = false;
    },

    handleClick(event) {
      if (this.showSettings) {
        let node = event.target;
        let isModal = false;
        while (node) {
          if (node && node.classList && node.classList.contains('modal__el')) {
            isModal = true;
            break;
          }
          node = node.parentNode;
        }
        if (isModal) {
          this.showSettings = false;
        }
      }
    },

    setMetadataId(metadataId) {
      this.metadataId = metadataId;
    },

    openSettings() {
      this.showSettings = true;
    },

    closeSettings() {
      this.showSettings = false;
    },
  },
};
