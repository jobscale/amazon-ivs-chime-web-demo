import { logger } from '../../../tools';
import { chime } from '../../../chime/ChimeSdkWrapper';

export default {
  name: 'Settings',
  props: ['joinInfo', 'saveSettings', 'closeSettings'],
  data() {
    return {
      currentMic: undefined,
      audioInputDevices: [],
      currentSpeaker: undefined,
      audioOutputDevices: [],
      currentCam: undefined,
      videoInputDevices: [],
      microphone: '',
      speaker: '',
      camera: '',
    };
  },
  mounted() {
    this.deviceSetup();

    this.onDeviceUpdate = this.onDeviceUpdate || (info => this.devicesUpdatedCallback(info));
    chime.subscribeToDevicesUpdated(this.onDeviceUpdate);
  },
  beforeUmount() {
    chime.unsubscribeFromDevicesUpdated(this.onDeviceUpdate);
  },
  methods: {
    deviceSetup() {
      this.currentMic = chime.currentAudioInputDevice;
      this.audioInputDevices = chime.audioInputDevices;
      this.currentSpeaker = chime.currentAudioOutputDevice;
      this.audioOutputDevices = chime.audioOutputDevices;
      this.currentCam = chime.currentVideoInputDevice;
      this.videoInputDevices = chime.videoInputDevices;
    },

    devicesUpdatedCallback(fullDeviceInfo) {
      logger.debug(JSON.stringify(fullDeviceInfo, null, 2));

      this.deviceSetup();
    },

    handleMicrophoneChange(event) {
      this.microphone = event.target.value;

      if (chime.audioInputDevices.length) {
        let selectedDevice;
        for (const o in chime.audioInputDevices) {
          if (chime.audioInputDevices[o].value === event.target.value) {
            selectedDevice = chime.audioInputDevices[o];
            break;
          }
        }
        chime.chooseAudioInputDevice(selectedDevice);
      }
    },

    handleSpeakerChange(event) {
      this.speaker = event.target.value;

      if (chime.audioOutputDevices.length) {
        let selectedDevice;
        for (const o in chime.audioOutputDevices) {
          if (chime.audioOutputDevices[o].value === event.target.value) {
            selectedDevice = chime.audioOutputDevices[o];
            break;
          }
        }
        chime.chooseAudioOutputDevice(selectedDevice);
      }
    },

    async handleCameraChange(event) {
      this.camera = event.target.value;

      if (chime.videoInputDevices.length) {
        let selectedDevice;
        let o;
        for (o in chime.videoInputDevices) {
          if (chime.videoInputDevices[o].value === event.target.value) {
            selectedDevice = chime.videoInputDevices[o];
            break;
          }
        }
        chime.chooseVideoInputDevice(selectedDevice);
      }
    },

    handleSave(event) {
      event.stopPropagation();
      event.preventDefault();
      this.saveSettings(this.microphone, this.speaker, this.camera);
    },
  },
};
