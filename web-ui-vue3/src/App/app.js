import { h } from 'vue';
import { BASE_HREF } from '../config';
import Home from '../components/chimeWeb/Welcome/welcomeView.vue';
import Join from '../components/chimeWeb/Join/joinView.vue';
import Meeting from '../components/chimeWeb/Meeting/meetingView.vue';
import End from '../components/chimeWeb/End/endView.vue';

export default {
  name: 'App',
  data() {
    return {
      currentRoute: window.location.pathname,
      routes: {
        [`${BASE_HREF}/`]: Home,
        [`${BASE_HREF}/join`]: Join,
        [`${BASE_HREF}/meeting`]: Meeting,
        [`${BASE_HREF}/end`]: End,
      },
    };
  },
  computed: {
    CurrentComponent() {
      return this.routes[this.currentRoute] || Home;
    },
  },
  render() {
    return h(this.CurrentComponent);
  },
};
