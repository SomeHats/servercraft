import bluebird from 'bluebird';
import del from 'del';
import mkdirpCb from 'mkdirp';
import path from 'path';
import request from 'request';
import requestProgress from 'request-progress';
import serverProperties from 'minecraft-server-properties';
import {World} from '../db';
import * as versions from '../minecraft/versions';
import fs from 'fs';

const mkdirp = bluebird.promisify(mkdirpCb);
bluebird.promisifyAll(fs);

const getWorldPath = async (id) => {
  let worldPath = path.resolve(process.env.SERVERCRAFT_WORLDS || './servercraft-worlds', id);
  await mkdirp(worldPath);
  return worldPath;
}

const checkString = (str, name) => {
  if (!(str && typeof str === 'string' && str.trim() !== ''))
    throw {status: 400, message: `You must include a ${name}`};
};

const downloadWorld = async (download, world, progress) => new Promise((resolve, reject) => {
  let {url} = download,
      filename = path.join(world, path.basename(url));

  requestProgress(request(url), {throttle: 200})
    .on('progress', progress)
    .on('error', reject)
    .pipe(fs.createWriteStream(filename))
    .on('error', reject)
    .on('close', resolve);
});

const writeProperties = (worldPath, properties, name = 'server.properties') => {
  const filename = path.join(worldPath, name);
  return fs.writeFileAsync(filename, serverProperties.stringify(properties), {encoding: 'utf-8'});
};

export default (api, wrap) => {
  api.realtime('/new-world', async (data, connection, progressHandler) => {
    let {name, version, message} = data;
    checkString(name, 'server name');
    checkString(version, 'server version');
    checkString(message, 'server message');

    let versionInfo = await versions.info(data.version),
        download = versionInfo.downloads.server,
        worldId = World.getId(name),
        worldPath = await getWorldPath(worldId);

    if (await World.exists(worldId)) {
      throw {status: 400, message: `World id ${worldId} already exists!`};
    }

    let world = await World.forge({id: worldId, name, version, message, ownerId: connection.user.id})
      .save(null, {method: 'insert'});

    try {
      await downloadWorld(download, worldPath, progressHandler);
      progressHandler({percentage: 1});

      let serverProperties = {
        'enable-query': true,
        'motd': `${name}: ${message}`,
        'op-permission-level': 3,
        'player-idle-timeout': 30,
        'level-name': worldId
      };
      await writeProperties(worldPath, {eula: true}, 'eula.txt');
      await writeProperties(worldPath, serverProperties);

      await fs.writeFileAsync(path.join(worldPath, 'banned-players.json'), '[]');
      await fs.writeFileAsync(path.join(worldPath, 'banned-ips.json'), '[]');
      await fs.writeFileAsync(path.join(worldPath, 'ops.json'), '[]');
      await fs.writeFileAsync(path.join(worldPath, 'whitelist.json'), '[]');
    } catch (e) {
      await world.destroy();
      await del([worldPath]);
      throw e;
    }

    return world.toJSON();
  });

  api.get('/worlds', wrap(async (req, res) => {
    let worlds = await World.fetchAll();
    res.json(worlds.toJSON());
  }));
};
