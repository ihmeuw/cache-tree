import CacheTree from '../cachetree.js';
import { dataGen } from './data-gen.js';

const dataProps = ['foo', 'bar', 'baz'];
const bigDataProps = ['one', 'two', 'three', 'four', 'five', 'six'];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cache: new CacheTree(props.dataProps, 125),
      data: [],
      diff: {},
      hasData: "? ?",
      bigCache: new CacheTree(props.bigDataProps),
    }

    this.addData = this.addData.bind(this);
    this.addBigData = this.addBigData.bind(this);
    this.getDiff = this.getDiff.bind(this);
    this.getData = this.getData.bind(this);
    this.hasData = this.hasData.bind(this);
  }

  addData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);
    
    const data = dataGen({foo: fooData, bar: barData, baz: bazData});

    this.state.cache.set(data);

    this.setState({
      cache: this.state.cache.clone(),
    });
  }

  addBigData() {
    const params = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const filter = this.props.bigDataProps.reduce((acc, prop) => {
      acc[prop] = params;
      return acc;
    }, {});
    
    const data = dataGen(filter);
    this.state.bigCache.set(data);

    this.setState({
      bigCache: this.state.bigCache.clone(),
    });
  }

  getData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const data = this.state.cache.get({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      data,
    });
  }

  getDiff() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const diff = this.state.cache.getDiff({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      diff
    });
  }

  hasData() {
    const fooData = this.fooRef.value.split(/\s*;\s*/);
    const barData = this.barRef.value.split(/\s*;\s*/);
    const bazData = this.bazRef.value.split(/\s*;\s*/);

    const hasData = this.state.cache.has({foo: fooData, bar: barData, baz: bazData});

    this.setState({
      hasData: hasData ? 'tru' : 'false',
    });
  }

  showData() {
    return this.state.data.map((datum, i) => (
      <div key={i}>
        {JSON.stringify(datum)}
      </div>
    ));
  }

  showDiff() {
    const keys = Object.keys(this.state.diff);

    return keys.map((key, i) => (
      <div key={i}>
        {`${key}: ${JSON.stringify(this.state.diff[key])}`}
      </div>
    ));
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
        <div className={'things'}>
          <div>
            <div>
              <button
                onClick={this.addData}
              >Add Data</button>
            </div>
            cache size: {this.state.cache.getSize()}
          </div>
          <div>
            <div>
              <button
                onClick={this.getData}
              >Get Data</button>
            </div>
            <div>data:</div>
            {this.showData()}
          </div>
          <div>
            <div>
              <button
                onClick={this.hasData}
              >Has Data?</button>
            </div>
            I has data? {this.state.hasData}
          </div>
          <div>
            <div>
              <button
                onClick={this.getDiff}
              >Get Diff</button>
            </div>
            <div>diff:</div>
            {this.showDiff()}
          </div>
        </div>
        <h2>Big Cache</h2>
        <div className={'things'}>
          <div>
            <div>
              <button
                onClick={this.addBigData}
              >Add Big Data</button>
            </div>
            big cache size: {this.state.bigCache.getSize()}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App
    dataProps={dataProps}
    bigDataProps={bigDataProps}
  />,
  document.getElementById('page')
);