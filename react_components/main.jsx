var React = require('react');
var mui = require('material-ui');
var AppBar = mui.AppBar;
var Sidebar = require('./sidebar.jsx');
var Visualizations = require('./visualizations.jsx');

var Main = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object

  },

  getChildContext() {
    ThemeManager = new mui.Styles.ThemeManager();
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  getInitialState: function() {
    return {
      people: [],
      selectedPerson: NaN
    }
  },

  componentDidMount: function() {
    $.get('/people')
    .done(function(data){
      if(this.isMounted()){
        this.setState({
          people: data.people,
          selectedPerson: data.people[0]
        });
      }
    }.bind(this))
    .error(function (data, status){
      console.log(status);
      console.log(data);
    })
  },

  onCardClick: function (person) {
    this.setState({
      selectedPerson: person
    });
  },

  render: function() {
    console.log("Main Rendering, state:", this.state)
    appBarStyle = {
      margin: '0'
    }
    return (
      <div className="wrap flex-container">
        <AppBar
          title="Communique"
          showMenuIconButton={false}
          style= {appBarStyle}
          className="title-bar"/>
        <div className="main flex-container">
          <Visualizations
            selectedPerson={this.state.selectedPerson}
          />
          <Sidebar
            people={this.state.people}
            selectedPerson={this.state.selectedPerson}
            onCardClick={this.onCardClick}
          />
        </div>
      </div>
    );
  }
});

function run() {
    React.render(<Main />, document.body);

}

if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', run);
} else {
    window.attachEvent('onload', run);
}
