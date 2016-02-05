import React from 'react';

import {find} from '../../helpers/utils';
import VersionActions from '../../actions/version-actions';
import VersionStore from '../../stores/version-store';

import Dialog from 'react-toolbox/lib/dialog';
import Dropdown from 'react-toolbox/lib/dropdown';
import Input from 'react-toolbox/lib/input';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import styles from './style';

export default class NewWorld extends React.Component {
  constructor() {
    super();
    this.state = {
      versions: [{id: 'loading', value: 'loading', releaseTime: new Date()}],
      message: 'A Minecraft Server',
      name: ''
    };
    this.onVersionsUpdate = this.onVersionsUpdate.bind(this);
    this.onVersionChange = this.onVersionChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onMessageChange = this.onMessageChange.bind(this);
    this.renderVersionSelectItem = this.renderVersionSelectItem.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = VersionStore.listen(this.onVersionsUpdate);
    if (this.props.active) this.checkVersions();
  }

  componentWillReceiveProps(props) {
    if (props.active) this.checkVersions(props.active);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkVersions(active) {
    if (this.state.gotVersions || !(this.props.active || active)) return;
    VersionActions.loadVersions();
  }

  onVersionsUpdate(update) {
    if (update.versions) {
      update.gotVersions = true;
      update.versions = update.versions.map(version => {
        version.value = version.id;
        return version;
      });
      update.selectedVersion = update.latest;
    }
    this.setState(update);
  }

  onVersionChange(id) {
    this.setState({selectedVersion: id});
  }

  onNameChange(name) {
    this.setState({name});
  }

  onMessageChange(message) {
    this.setState({message});
  }

  render() {
    let ready = !this.state.loading && this.state.gotVersions;
    let cancel = {label: 'Cancel', onClick: this.props.onCancel},
        create = {label: 'Create', onClick: this.onCreate, primary: true, raised: true},
        actions = ready ? [cancel, create] : [cancel];

    return (
      <Dialog
        title='Create New World'
        active={this.props.active}
        actions={actions}
        className={styles.root}>
        {ready ? this.renderForm() : this.renderLoader()}
      </Dialog>
    );
  }

  renderLoader() {
    return <div className={styles.loader}>
      <ProgressBar type='circular' mode='indeterminate' />
    </div>;
  }

  renderForm() {
    return (
      <div>
        <Dropdown
          label='Minecraft Version'
          template={this.renderVersionSelectItem}
          onChange={this.onVersionChange}
          source={this.state.versions}
          value={this.state.selectedVersion} />
        <Input label='World Name' value={this.state.name} onChange={this.onNameChange} />
        <Input label='Server Message' value={this.state.message} onChange={this.onMessageChange} />
      </div>
    );
  }

  renderVersionSelectItem({id, releaseTime}) {
    if (id === this.state.latest) id = `${id} (latest)`;

    return (
      <div className={styles.versionSelectItem}>
        <strong>{id}</strong>
        <small>{releaseTime.toDateString()}</small>
      </div>
    );
  }
}
