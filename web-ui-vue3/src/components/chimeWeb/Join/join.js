import { BASE_HREF } from '../../../config';
import Error from '../Error/errorView.vue';

export default {
  name: 'Join',
  components: {
    Error,
  },
  data() {
    return {
      username: '',
      title: '',
      errorMsg: '',
      showError: false,
    };
  },
  mounted() {
    const qs = new URLSearchParams(window.location.search);
    this.title = qs.get('room');
    if (!this.title) {
      window.location.href = `${BASE_HREF}/end`;
    }
  },
  methods: {
    async joinRoom() {
      const { username, title } = this;
      const data = { username, title, role: 'attendee' };
      this.$storage.setStorageSync('chime', data);
      window.location.href = `${BASE_HREF}/meeting`;
    },

    handleJoinRoom(event) {
      event.preventDefault();
      event.stopPropagation();
      this.joinRoom();
    },

    handleClick(event) {
      let node = event.target;
      let isModal = false;
      while (node) {
        if (node && node.classList && node.classList.contains('notice--error')) {
          isModal = true;
          break;
        }
        node = node.parentNode;
      }
      if (!isModal) {
        this.closeError();
      }
    },

    closeError() {
      this.errorMsg = 'Something went wrong';
      this.showError = false;
    },
  },
};
