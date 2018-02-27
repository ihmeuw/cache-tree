import CacheTree from '../cachetree.js';
import { dataGen } from './data-gen.js';

const dataProps = ['foo', 'bar', 'baz'];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.cache = new CacheTree(props.dataProps, 343000);

    this.state = {
      cache: this.cache,
      data: [],
      diff: {},
      hasData: "? ?",
    }

    this.addData = this.addData.bind(this);
    this.getDiff = this.getDiff.bind(this);
    this.getData = this.getData.bind(this);
    this.hasData = this.hasData.bind(this);
  }

  addData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);
    
    const data = dataGen({foo: fooData, bar: barData, baz: bazData});

    this.cache.set(data);

    this.setState({
      cache: this.cache.clone(),
    });
  }

  getData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const data = this.cache.get({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      data,
    });
  }

  getDiff() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const diff = this.cache.getDiff({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      diff
    });
  }

  hasData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const hasData = this.cache.has({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      hasData: hasData ? 'tru' : 'flase',
    });
  }

  render() {
    return (
      <div>
        <h1>CacheTree</h1>
        <div>
          foo:
          <input
          ref={(input) => { this.fooRef = input; }}
          type='text'
          />
        </div>
        <div>
          bar:
          <input
            ref={(input) => { this.barRef = input; }}
            type='text'
          />
        </div>
        <div>
          baz:
          <input
            ref={(input) => { this.bazRef = input; }}
            type='text'
          />
        </div>
        <div>
          <button
            onClick={this.addData}
          >Add Data</button>
        </div>
        <div>
          <button
            onClick={this.getData}
          >Get Data</button>
        </div>
        <div>
          <button
            onClick={this.hasData}
          >Has Data?</button>
        </div>
        <div>
          <button
            onClick={this.getDiff}
          >Get Diff</button>
        </div>
        <div>
          cache size: {this.state.cache.getSize()}
        </div>
        <div>
          data: {JSON.stringify(this.state.data)}
        </div>
        <div>
          I has data? {this.state.hasData}
        </div>
        <div>
          diff: {JSON.stringify(this.state.diff)}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App
    dataProps={dataProps}
  />,
  document.getElementById('page')
);