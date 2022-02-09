import { BASE_HREF } from '../../../config';

export default {
  name: 'End',
  methods: {
    handleHome(event) {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = `${BASE_HREF}/`;
    },
  },
};
