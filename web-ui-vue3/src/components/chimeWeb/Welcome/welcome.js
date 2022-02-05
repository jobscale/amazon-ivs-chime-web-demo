import { BASE_HREF, DEFAULT_VIDEO_STREAM } from '../../../config';
import Error from '../Error/error';
import { chime } from '../../../chime/ChimeSdkWrapper';

export default {
  name: 'Welcome',
  components: {
    Error,
  },
  data() {
    return {
      username: '',
      title: '',
      playbackURL: DEFAULT_VIDEO_STREAM,
      errorMsg: '',
      showError: false,
    };
  },
  mounted() {
    const qs = new URLSearchParams(window.location.search);
    const action = qs.get('action');
    if (action === 'join') {
      const title = qs.get('room');
      chime.joinRoom = title;
      this.store.route = 'join';
    }
    this.$refs.inputRef.focus();
  },
  methods: {
    closeError() {
      this.showError = false;
    },

    handleCreateRoom(event) {
      event.preventDefault();
      event.stopPropagation();

      try {
        this.createRoom();
      } catch (e) {
        this.handleErrorMsg(e.message);
      }
    },

    handleErrorMsg(errorMsg) {
      this.errorMsg = errorMsg;
      this.showError = true;
    },

    async createRoom() {
      const { username, title, playbackURL } = this;
      const data = {
        username, title, playbackURL, role: 'host',
      };
      this.$storage.setStorageSync('chime', data);
      window.location.href = `${BASE_HREF}/meeting`;
    },
  },
};
