import Reflux from 'reflux';
import * as api from '../helpers/api';

const WorldActions = Reflux.createActions({
  'create': {
    children: ['completed', 'failed', 'progressed']
  }
});

WorldActions.create.listenAndPromise(async (name, message, version) => {
  return await api.realtime('/new-world', {name, message, version}, WorldActions.create.progressed);
});

export default WorldActions;
