import Reflux from 'reflux';
import * as api from '../helpers/api';

const WorldActions = Reflux.createActions({
  'load': {asyncResult: true},
  'create': {
    children: ['completed', 'failed', 'progressed']
  }
});

WorldActions.create.listenAndPromise(async (name, message, version) => {
  return await api.realtime('/new-world', {name, message, version}, WorldActions.create.progressed);
});

WorldActions.load.listenAndPromise(async () => {
  let {data} = await api.get('/api/worlds');
  return data;
});

export default WorldActions;
