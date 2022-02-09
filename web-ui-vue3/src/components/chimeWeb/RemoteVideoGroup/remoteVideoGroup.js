import { logger } from '../../../tools';
import { chime } from '../../../chime/ChimeSdkWrapper';
import RemoteVideo from '../RemoteVideo/remoteVideo.vue';

export default {
  name: 'RemoteVideoGroup',
  props: ['joinInfo'],
  components: {
    RemoteVideo,
  },
  data() {
    return {
      roster: [],
    };
  },
  mounted() {
    this.onRosterUpdate = this.onRosterUpdate || (newRoster => this.rosterCallback(newRoster));
    chime.subscribeToRosterUpdate(this.onRosterUpdate);
    chime.audioVideo.addObserver({
      videoTileDidUpdate: tileState => this.videoTileDidUpdateCallback(tileState),
      videoTileWasRemoved: tileId => this.videoTileWasRemovedCallback(tileId),
    });
  },
  beforeUmount() {
    chime.unsubscribeFromRosterUpdate(this.onRosterUpdate);
  },
  methods: {
    findRosterSlot(attendeeId) {
      let index;
      for (index = 0; index < this.roster.length; index++) {
        if (this.roster[index].attendeeId === attendeeId) {
          return index;
        }
      }
      for (index = 0; index < this.roster.length; index++) {
        if (!this.roster[index].attendeeId) {
          return index;
        }
      }
      return this.roster.length;
    },

    rosterCallback(newRoster) {
      logger.debug(`Rosters ${Object.keys(newRoster).length}`);

      Object.keys(newRoster).forEach(attendeeId => {
        // Exclude self
        if (attendeeId === this.joinInfo.Attendee.AttendeeId) {
          return;
        }

        // exclude empty name
        if (!newRoster[attendeeId].name) {
          return;
        }

        const index = this.findRosterSlot(attendeeId);
        const rosterNew = this.roster;
        const attendee = {
          ...rosterNew[index],
          attendeeId,
          ...newRoster[attendeeId],
        };

        rosterNew[index] = attendee;
        this.roster = rosterNew;
      });
    },

    videoTileDidUpdateCallback(tileState) {
      if (!tileState.boundAttendeeId || tileState.localTile
        || tileState.isContent || !tileState.tileId) {
        return;
      }

      const index = this.findRosterSlot(tileState.boundAttendeeId);
      const rosterNew = this.roster;
      const attendee = {
        ...rosterNew[index],
        videoEnabled: tileState.active,
        attendeeId: tileState.boundAttendeeId,
        tileId: tileState.tileId,
      };
      rosterNew[index] = attendee;
      this.roster = rosterNew;

      setTimeout(() => {
        logger.debug(rosterNew[index]);
        const videoElement = document.querySelector(`#video-${tileState.boundAttendeeId}`);
        if (videoElement) {
          chime.audioVideo.bindVideoElement(tileState.tileId, videoElement);
        }
      }, 1000);
    },

    videoTileWasRemovedCallback(tileId) {
      const rosterNew = this.roster;

      // Find the removed tileId in the roster and mark the video as disabled.
      rosterNew.forEach((attendee, index) => {
        if (attendee.tileId === tileId) {
          rosterNew[index].videoEnabled = false;
          this.roster = rosterNew;
          logger.debug(`Tile was removed ${tileId}`);
        }
      });
    },
  },
};
