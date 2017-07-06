import _ from 'underscore';
import {AccountStore, FolderSyncProgressStore, React} from 'nylas-exports';

export default class InitialSyncActivity extends React.Component {
  static displayName = 'InitialSyncActivity';

  constructor(props) {
    super(props);
    this.state = {
      syncState: FolderSyncProgressStore.getSyncState(),
    }
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.unsub = FolderSyncProgressStore.listen(this.onDataChanged)
  }

  componentWillUnmount() {
    this.unsub();
    this.mounted = false;
  }

  onDataChanged = () => {
    this.setState({syncState: FolderSyncProgressStore.getSyncState()});
  }

  renderFolderProgress(folderPath, progress) {
    let status = 'busy';
    let progressLabel = `In Progress (${Math.round(progress * 100)}%)`;
    if (progress === 1) {
      status = 'complete';
      progressLabel = '';
    }

    return (
      <div className={`model-progress ${status}`} key={folderPath}>
        {folderPath} <span className="progress-label">{progressLabel}</span>
      </div>
    )
  }

  render() {
    if (FolderSyncProgressStore.isSyncComplete()) {
      return false;
    }


    let maxHeight = 0;
    let accounts = _.map(this.state.syncState, (accountSyncState, accountId) => {
      const account = AccountStore.accountForId(accountId);
      if (!account) {
        return false;
      }

      let folderStates = _.map(accountSyncState, ({progress}, folderPath) => {
        return this.renderFolderProgress(folderPath, progress)
      })

      if (folderStates.length === 0) {
        folderStates = <div><br />Gathering folders...</div>
      }

      // A row for the account email address plus a row for each folder state,
      const numRows = 1 + (folderStates.length || 1)
      maxHeight += 50 * numRows;

      return (
        <div className="account" key={accountId}>
          <h2>{account.emailAddress}</h2>
          {folderStates}
        </div>
      )
    });

    if (accounts.length === 0) {
      accounts = <div><br />Looking for accounts...</div>
    }

    return (
      <div
        className="account-detail-area"
        key="expanded-sync-state"
        style={{maxHeight: `${maxHeight + 500}px`}}
      >
        {accounts}
      </div>
    )
  }

}