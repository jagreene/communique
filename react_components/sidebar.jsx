var React = require('react');
var mui = require('material-ui')
var Paper = mui.Paper;
var Card = mui.Card;
var CardHeader = mui.CardHeader;
var TextField = mui.TextField;

SearchBar = React.createClass({
  handleChange: function(event){
    this.props.onSearchInput(
      event.target.value
    )
  },

  render: function(){
    style={
      margin: '0 5px'
    };

    return (
      <Paper className="search-bar" zdepth={2}>
          <TextField
            hintText="Search"
            style={style}
            onChange={this.handleChange}
          />
      </Paper>
    );
  }
});

PersonCard = React.createClass({
  handleClick: function() {
    this.props.onCardClick(
      this.props.person
    )
  },

  render: function(){
    if (this.props.selected){
      var style = {
        backgroundColor: '#ccc'
      }
    } else {
      var style = {
        backgroundColor: '#FFF'
      }
    }

    return (
      <Card className='person-card' onClick={this.handleClick} style={style} className="person-card">
        <CardHeader
          title={this.props.person.name}
          subtitle={this.props.person.email}
          avatar={this.props.person.thumbnail}
        />
      </Card>
    );
  }
});

PersonList =  React.createClass({
  render: function() {
    var personNodes = this.props.people.map(function (person) {
      if (!('name' in person)){
        person.name = person.email
      } else if(!('email' in person)){
        person.email = person.name
      }
      if (person.name.indexOf(this.props.filterText) != -1 || person.email.indexOf(this.props.filterText) != -1){
        if (person == this.props.selectedPerson) {
          return (<PersonCard
            person={person}
            onCardClick={this.props.onCardClick}
            selected={true}
            key={person.email}
          />)
        } else {
          return(<PersonCard
            person={person}
            onCardClick={this.props.onCardClick}
            selected={false}
            key={person.email}
          />)
        }
      } else {
        return;
      }
    }.bind(this));
    return (
      <div className="person-list">
        {personNodes}
      </div>
    );
  }
});

Sidebar =  React.createClass({
  getInitialState: function() {
    return {
      filterText: ''
    }
  },

  onSearchInput: function(text) {
    this.setState({
      filterText: text
    })
  },

  render: function() {
    return (
      <div className="sidebar">
        <SearchBar
          filterText={this.state.filterText}
          onSearchInput={this.onSearchInput}
        />
        <Paper>
          <PersonList
            people={this.props.people}
            selectedPerson={this.props.selectedPerson}
            onCardClick={this.props.onCardClick}
            filterText={this.state.filterText}
          />
        </Paper>
      </div>
    )
  }
})

module.exports = Sidebar
