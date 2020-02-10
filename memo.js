'use strict';
const e = React.createElement;

function ll(...args) {
  //console.log(...args);
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
    ll("qa render with props: ", this.props);
    let marksEnabled = this.state.showAnswer;
    const q = e("div", {id: "question", className: "bb", onClick: (e) => this.setAnswerVisible(true)}, `${this.props.qa[0]}`);
    const a = e("div", {id: "answer"}, e("div", {id: "answertext", className: marksEnabled ? "bb" : "bb hidden"}, `${this.props.qa[1]}`));

    const marks = this.props.marks.map((id) => 
      Mark(id, marksEnabled, (e) => {
        this.setAnswerVisible(false);
        this.props.onMark(id, e);

      }));
    const m = e("div", {id: "marks"}, marks);
    return  e(React.Fragment, null, m, q, a);
  }

}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.initialState(props.learnSet);

    this.initialize = this.initialize.bind(this);
    this.onMarkClicked = this.onMarkClicked.bind(this);
  }

  initialState(ls) {
    let is = {appEnd: false, toLearn: new Array(...ls)};
    ll("initialState called; returns ", is);
    return is;
  }

  initialize() {
    this.setState(this.initialState(this.props.learnSet));
  }

  

  onMarkClicked(id, e) {
    e.preventDefault();
    let newLearn = new Array(...this.state.toLearn);
    let prevCurrent = newLearn.shift();
    ll(`clicked ${id}, checking if leq to ${this.props.repeatHighest}`);
    if (id <= this.props.repeatHighest) {
      newLearn.push(prevCurrent);
    }
    ll("to learn is", newLearn);
    this.setState({toLearn: newLearn, appEnd: newLearn.length === 0});
  }

  renderAgainButton() {
    let again = e("div", {key: "ag", id: "again", onClick: this.initialize}, "Jeszcze raz?");
    return e("div", 
      {id: "message"}, 
      [e("div", {key: "kon"}, "Koniec"), again]);
  }
  render() {
    if (this.state.appEnd) {
      return this.renderAgainButton();
    } else {
      return e(
        QA, 
        {qa: this.state.toLearn[0], onMark: this.onMarkClicked, marks: this.props.marks},
        null);
    }
  }
}

const app = e(App, {
  learnSet: data, 
  marks: [1,2,3,4,5,6], 
  repeatHighest: 4}, 
  null);

ReactDOM.render(app, document.getElementById("app"));
