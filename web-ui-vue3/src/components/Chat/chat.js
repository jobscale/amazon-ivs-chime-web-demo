import { logger } from '../../tools';
import * as config from '../../config';

// Styles
import './chat.css';

export default {
  name: 'Chat',
  props: ['data'],
  data() {
    return {
      message: '',
      messages: [],
      connection: undefined,
      showPopup: false,
    };
  },
  mounted() {
    this.initChatConnection();

    this.scrollToBottom();
  },
  methods: {
    async initChatConnection() {
      const { joinInfo } = this.data;
      const { Meeting, Attendee } = joinInfo;
      const queries = {
        MeetingId: Meeting.MeetingId,
        AttendeeId: Attendee.AttendeeId,
        JoinToken: Attendee.JoinToken,
      };
      const messagingUrl = `${config.CHAT_WEBSOCKET}?${
        Object.entries(queries).map(([key, value]) => `${key}=${value}`).join('&')
      }`;
      const connectionInit = await new WebSocket(messagingUrl);

      logger.debug(connectionInit);
      connectionInit.onopen = event => {
        logger.debug('websocket is now open', event);
      };

      this.recvMessage = this.recvMessage || (event => {
        const data = event.data.split('::');
        const username = data[0];
        const newMessage = data.slice(1).join('::'); // in case the message contains the separator '::'

        this.messages = [...this.messages, {
          timestamp: Date.now(),
          username,
          message: newMessage,
        }];
      });
      connectionInit.removeEventListener('message', this.recvMessage);
      connectionInit.addEventListener('message', this.recvMessage);

      this.connection = connectionInit;
    },

    scrollToBottom() {
      this.$refs.messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    },

    handleEnter() {
      const { username } = this.data;
      if (this.message) {
        const data = {
          message: 'sendmessage',
          data: `${username}::${this.message}`,
        };
        this.connection.send(JSON.stringify(data));
        this.message = '';
      }
    },

    handleRoomClick(event) {
      event.stopPropagation();
      event.preventDefault();
      const title = this.data.joinInfo.Title;
      const link = `${window.location.origin}${window.location.pathname.replace(
        'meeting',
        'join',
      )}?room=${title}`;
      logger.debug(link);
      this.copyTextToClipboard(encodeURI(link));
    },

    handleShowPopup() {
      // show popup message
      this.showPopup = true;
      // hide popup message after 2 seconds
      setTimeout(() => {
        this.showPopup = false;
      }, 2000);
    },

    copyTextToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => {
            this.handleShowPopup();
            logger.debug('Room link copied to clipboard');
          },
          (err) => {
            logger.debug('Could not copy text: ', err);
          },
        );
      }
    },

    parseUrls(userInput) {
      const urlRegExp = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g;
      const formattedMessage = userInput.replace(urlRegExp, match => {
        let formattedMatch = match;
        if (!match.startsWith('http')) {
          formattedMatch = `https://${match}`;
        }
        return `<a href=${formattedMatch} class="chat-line__link" target="_blank" rel="noopener noreferrer">${match}</a>`;
      });
      return formattedMessage;
    },
  },
};
