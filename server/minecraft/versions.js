import http from 'axios';

const versionURL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export function canRun(version) {
  let [major, minor] = version.split('.').map(n => parseInt(n, 10));
  return major >= 1 && minor >= 7;
}

export async function getVersions() {
  let {data} = await http.get(versionURL);

  return {
    latest: data.latest.release,
    versions: data.versions.filter(version => version.type === 'release' && canRun(version.id))
  };
}

export async function info(version) {
  let {versions} = await getVersions();
  let versionInfo = versions.filter(({id}) => id === version)[0];
  if (!(versionInfo && versionInfo.url)) return false;

  let {data} = await http.get(versionInfo.url);
  return data;
}
