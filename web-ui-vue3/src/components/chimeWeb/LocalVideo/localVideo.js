import { logger } from '../../../tools';
import { chime } from '../../../chime/ChimeSdkWrapper';

export default {
  name: 'LocalVideo',
  props: ['joinInfo'],
  data() {
    return {
      enabled: false,
      muted: false,
      showMeta: true,
    };
  },
  mounted() {
    setTimeout(() => this.showMeta = false, 2500);

    chime.audioVideo.addObserver({
      videoTileDidUpdate: tileState => {
        if (!tileState.boundAttendeeId
          || !tileState.localTile
          || !tileState.tileId
          || !this.$refs.videoElement) {
          logger.warn({ tileState });
          return;
        }
        chime.audioVideo.bindVideoElement(
          tileState.tileId,
          this.$refs.videoElement,
        );
        this.enabled = tileState.active;
      },
    });

    this.onRoster = this.onRoster || (newRoster => this.rosterCallback(newRoster));
    chime.unsubscribeFromRosterUpdate(this.onRoster);
    chime.subscribeToRosterUpdate(this.onRoster);
  },
  methods: {
    rosterCallback(newRoster) {
      let attendeeId;
      for (attendeeId in newRoster) {
        // Exclude others
        if (attendeeId === this.joinInfo.Attendee.AttendeeId) {
          this.muted = newRoster[attendeeId].muted;
        }
      }
    },
    micMuteCls() {
      return this.muted ? 'controls__btn--mic_on' : 'controls__btn--mic_off';
    },
    metaCls() {
      // always show metadata when muted
      const isMetaShown = this.showMeta || this.muted || !this.enabled;
      return isMetaShown ? '' : ' cam__meta--hide';
    },
  },
};
