import { BASE_HREF } from '../../../config';

// Styles
import './error.css';

export default {
  name: 'Error',
  props: ['closeError', 'errorMgs'],
  mounted() {
    this.onKeyDown = this.onKeyDown || (event => this.handleKeyDown(event));
    document.addEventListener('keydown', this.onKeyDown);
  },
  beforeUmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      if (event.keyCode === 27) {
        // keyCode 27 is Escape key
        this.closeError();
      }
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
    handleGoCreateRoom() {
      window.location.href = `${BASE_HREF}/`;
    },
  },
};
