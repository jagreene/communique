var React = require('react');

var rd3 = require('react-d3');
var BarChart = rd3.BarChart;
var LineChart = rd3.LineChart;

var linspace = require('linspace');

var mui = require('material-ui')
var Paper = mui.Paper;
var Card = mui.Card;
var CardHeader = mui.CardHeader;
var CardText = mui.CardText;
var CardMedia = mui.CardMedia;
var TextField = mui.TextField;

var vizEndpoints = ['/sentimentTime', '/texttagsSentiment']
var tickNumber = 10;

VizCard = React.createClass({
  componentDidMount: function() {
    var max = Math.max(this.props.viz.data.x)
    var min = Math.min(this.props.viz.data.x)

    xData = this.props.viz.data.x.map(function (datum){
      return datum.toDateString().substring(4)
    });

    chart = c3.generate({
      bindto: '#'+this.props.key,
      data: {
          x: this.props.viz.xLabel,
          xFormat: '%m %d %Y',
          columns: [
              [this.props.viz.xLabel].concat(xData),
              [this.props.viz.yLabel].concat(this.props.viz.data.y),
          ]
      },
      axis: {
          x: {
              type: 'timeseries',
              tick: {
                  format: '%m %d %Y',
                  count: tickNumber
              }
          }
      }
    })
    this.setState({
      chart: chart
    });
  },

  componentWillReceiveProps: function(nextProps) {
    var chart = this.state.chart;
    chart.unload([this.props.xlabel, this.props.ylabel])
    xData = nextProps.viz.data.x.map(function (datum){
      return datum.toDateString().substring(4)
    });
    chart.load({
      columns: [
          [nextProps.viz.xLabel].concat(xData),
          [nextProps.viz.yLabel].concat(nextProps.viz.data.y),
      ]
    })

    this.setState({
      chart:chart
    });
  },

  render: function(){
    return (
      <Card className='viz-card' initiallyExpanded={this.props.first} className="viz-card">
        <CardHeader
          showExpandableButton={true}
          title={this.props.viz.title}
        />
        <CardText expandable={true} initiallyExpanded={this.props.first}>
          <div id={this.props.key}/>
        </CardText>
      </Card>
    )
  }
});

VizList =  React.createClass({
 render: function() {
   var first = true;
    var vizNodes = this.props.visuals.map(function (viz) {
      if (first){
        first = false;
        return(
          <VizCard
            viz={viz}
            first={true}
            key={viz.title}
          />
        )
      } else {
        return(
          <VizCard
            viz={viz}
            first={false}
            key={viz.title}
          />
        )
      }
    }.bind(this));
    return (
      <div className="viz-list">
        {vizNodes}
      </div>
    );
  }
});

Vizualizations =  React.createClass({
  getInitialState: function() {
    return {
      visuals: [],
      messages: []
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      visuals: [],
      messages: []
    })
    $.get('/messages', data={contact: nextProps.selectedPerson})
    .done(function(messages){
      console.log("Messages: ", messages)
      if (messages.messageBodies) {
        if(this.isMounted()){
          vizEndpoints.forEach(function(endpoint){
            $.get(endpoint, data=messages)
            .done(function(data){
              if(this.isMounted()){
                this.setState({
                  messages: messages,
                  visuals: this.state.visuals.concat([data])
                });
              }
            }.bind(this))
            .error(function (data, status){
              console.log(status);
              console.log(data);
            })
          }.bind(this))
        }
      }
    }.bind(this))
    .error(function (data, status){
      console.log(status);
      console.log(data);
    })
  },

  render: function() {
    return (
      <div className="visualizations">
          <VizList
            visuals={this.state.visuals}
          />
      </div>
    )
  }
})

module.exports = Vizualizations

