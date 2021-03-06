import Reflux from 'reflux';
import {formatError} from '../helpers/utils';
import WorldActions from '../actions/world-actions';

let WorldStore = Reflux.createStore({
  listenables: WorldActions,

  init() {
    this.worlds = [];
  },

  onLoad() {
    this.trigger({loading: true, loadError: null});
  },

  onLoadCompleted(worlds) {
    this.worlds = worlds;
    this.trigger({loading: false, worlds});
  },

  onLoadFailed(error) {
    this.trigger({loading: false, loadError: formatError(error)});
  },

  onCreate() {
    this.trigger({creating: true});
  },

  onCreateProgressed({percentage}) {
    this.trigger({createProgress: percentage, createError: null});
  },

  onCreateCompleted(world) {
    this.worlds.push(world);
    this.trigger({creating: false, worlds: this.worlds, world: world, createProgress: null});
  },

  onCreateFailed(error) {
    this.trigger({createError: formatError(error), creating: false, createProgress: null});
  }
});

export default WorldStore;
