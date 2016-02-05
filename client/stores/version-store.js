import Reflux from 'reflux';
import {formatError} from '../helpers/utils';
import VersionActions from '../actions/version-actions';

let UserStore = Reflux.createStore({
  listenables: VersionActions,

  onLoadVersions() {
    this.trigger({loading: true, error: null});
  },

  onLoadVersionsCompleted({latest, versions}) {
    this.latest = latest;
    this.versions = versions;
    this.trigger({loading: false, latest, versions});
  },

  onLoadVersionsFailed(error) {
    this.latest = null;
    this.versions = null;
    this.trigger({loading: false, error: formatError(error)});
  }
});

export default UserStore;
