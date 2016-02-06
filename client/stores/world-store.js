import Reflux from 'reflux';
import {formatError} from '../helpers/utils';
import WorldActions from '../actions/world-actions';

let WorldStore = Reflux.createStore({
  listenables: WorldActions,

  init() {
    this.worlds = [];
  },

  onCreate() {
    this.trigger({creating: true});
  },

  onCreateProgressed({percentage}) {
    this.trigger({createProgress: percentage});
  },

  onCreateCompleted(world) {
    this.worlds.push(world);
    this.trigger({creating: false, worlds: this.worlds, world: world, createProgress: null});
  },

  onCreateFailed(error) {
    this.trigger({error: formatError(error), creating: false, createProgress: null});
  }
});

export default WorldStore;
