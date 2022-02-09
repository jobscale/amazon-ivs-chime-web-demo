export default {
  name: 'RemoteVideo',
  props: ['attendee'],
  data() {
    return {
      showMeta: true,
    };
  },
  mounted() {
    if (!this.attendee.muted) setTimeout(() => this.showMeta = false, 2000);
    this.attendee.videoElement = this.$refs.videoElement;
  },
  methods: {
    showMetaData() {
      // always show metadata when participant is muted or cam is off
      return this.showMeta || this.attendee.muted || !this.attendee.videoEnabled;
    },
    camClass() {
      return this.attendee.attendee ? '' : 'hidden';
    },
    micMuteCls() {
      return this.attendee.muted ? 'controls__btn--mic_on' : 'controls__btn--mic_off';
    },
    metaCls() {
      return this.showMetaData() ? '' : 'cam__meta--hide';
    },
  },
};
