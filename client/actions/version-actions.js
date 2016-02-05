import Reflux from 'reflux';
import {get} from '../helpers/api';

const VersionActions = Reflux.createActions({
  loadVersions: {asyncResult: true}
});

VersionActions.loadVersions.listenAndPromise(async () => {
  let {data} = await get(`/api/versions`);
  data.versions.forEach(version => {
    version.time = new Date(version.time);
    version.releaseTime = new Date(version.releaseTime);
  });
  return data;
});

export default VersionActions;
