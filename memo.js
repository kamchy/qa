'use strict';
const e = React.createElement;

function ll(...args) {
  console.log(...args);
}

function Mark(id, enabled, onMark) {
  return e("div",
    {className: enabled? "" : "disabled", onClick: enabled ? onMark :null, key: id},
    `${id}`);
}


class QA extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showAnswer: false};
    this.setAnswerVisibleCb = this.setAnswerVisible.bind(this);
  }

  setAnswerVisible(val) {
    this.setState({showAnswer: val});

  }

  render() {
    let getq = () => this.props.qa.el[0];
    let geta = () => this.props.qa.el[1];

    ll("qa render with props: ", this.props);
    let marksEnabled = this.state.showAnswer;
    const q = e("pre", {id: "question", onClick: (e) => this.setAnswerVisible(true)}, e("div", {className: "innertext"}, `${getq()}`));
    const a = e("pre", {id: "answer"}, e("div", {className: marksEnabled ? "innertext" : "innertext hidden"}, `${geta()}`));

    const marks = this.props.marks.map((id) =>
      Mark(id, marksEnabled, (e) => {
        this.setAnswerVisible(false);
        this.props.onMark(id, e);

      }));
    const m = e("div", {id: "marks"}, marks);
    return  e("div", {className: "qa"}, m, q, a);
  }

}
function initializedArray(len, elemFn) {
  let a = new Array(len);
  for (let i = 0; i < len; i++) {
    a[i] = elemFn();
  }
  return a;
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.initialState(props.learnList);

    this.initialize = this.initialize.bind(this);
    this.onMarkClicked = this.onMarkClicked.bind(this);
  }

  initialState(ls) {
    let is = {
      appEnd: false,
      toLearn: new Array(...ls.map((el, idx) => ({idx, el}))),
      stats: initializedArray(ls.length, () => new Array())
    };
    ll("initialState called; returns ", is);
    return is;
  }

  initialize() {
    this.setState(this.initialState(this.props.learnList));
  }

  updateStats(elem, mark) {
    this.state.stats[elem.idx].push(mark);
  }

  onMarkClicked(id, e) {
    e.preventDefault();
    let newLearn = new Array(...this.state.toLearn);
    let prevCurrent = newLearn.shift();
    ll(`clicked ${id}, checking repeat cond.}`);
    let mark = this.props.indexToMark(id);
    if (this.props.shouldRepeatIfMark(mark)) {
      newLearn.push(prevCurrent);
    }
    ll("to learn is", newLearn);
    this.updateStats(prevCurrent, id);
    this.setState({toLearn: newLearn, appEnd: newLearn.length === 0, stats: this.state.stats});
  }

  renderAgainButton() {
    let again = e("div", {key: "ag", id: "again", onClick: this.initialize}, "Jeszcze raz?");
    return e("div",
      {id: "message"},
      [e("div", {key: "kon"}, "Koniec"), again]);
  }

  mkQA() {
    return e(
        QA,
        {qa: this.state.toLearn[0], onMark: this.onMarkClicked, marks: this.props.marks},
        null)
  }

  mkToLearn() {
    return e(ToLearn, {toLearnCount: this.state.toLearn.length}, null);
  }

  mkStat() {
    return e(Stats, {
      stats: this.state.stats,
      marks: this.props.marks,
      markToIndex: this.props.markToIndex,
      indexToMark: this.props.indexToMark,
      toLearnCount: this.state.toLearn.length}, null);
  }


  render() {
    if (this.state.appEnd) {
      return this.renderAgainButton();
    } else {
      return e(React.Fragment, null, this.mkQA(), this.mkStat());
    }
  }
}

function ToLearn(props) {
  let cnt = props.toLearnCount;
  let [grammarFormLeft, grammarFormElems] = cnt === 1 ? ["został", "element"] : (cnt < 5 ? ["zostały", "elementy"] : ["zostało", "elementów"]);
  return e("div", {className: "toLearn"}, `Do nauczenia ${grammarFormLeft} `, e("span", {className: "numel"}, `${cnt} ${grammarFormElems}`))
}

function Stats(props) {

  function generateNSpansForMark(n, g) {
    let histoValueSpans = [];
    for (let i = 0; i < n; i++) {
      histoValueSpans.push(e("span", {className: `grade_${g}`}, " "));
    }
    return histoValueSpans;
  }

  let histo = initializedArray(props.marks.length, () => 0);
  props.stats.forEach(itemList => itemList.forEach(mark => histo[props.markToIndex(mark)] += 1));
  let histoElems = histo.map((count, idx) => e("p", null, e("span", null, `${props.indexToMark(idx)}`), ...generateNSpansForMark(count, props.indexToMark(idx))));

  let toLearnEl = e(ToLearn, {toLearnCount: props.toLearnCount}, null);
  let histoEl = e("div", {className: "histo"},  ...histoElems);

  return e("div", {className: "stats"}, toLearnEl, "Histogram ocen",  histoEl);

}

const app = e(App, {
  learnList: data,
  marks: [1,2,3,4,5,6],
  markToIndex: (mark) => mark - 1,
  indexToMark: (idx) => idx + 1,
  shouldRepeatIfMark: (mark) => mark < 4},
  null);

ReactDOM.render(app, document.getElementById("app"));
