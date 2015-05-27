Cars = new Mongo.Collection("cars");

if (Meteor.isServer) {

  Meteor.startup(function(){
    if(Cars.find().count()==0) Cars.insert({_id:"BMW",speed:120});
  });

  Meteor.publish("car",function(carName){
    return Cars.find({_id:carName});
  });

}

Meteor.methods({
  updateSpeed : function(speed){
    speed = speed > 200 ? 200 : speed;
    Cars.upsert({ _id : "BMW" } , { $set : {speed : speed} });
  }
});

if (Meteor.isClient) {

  Template.carSpeed.events({
    'click input[name=saveSpeed]' : function(evt,tmpl){

      Meteor.call('updateSpeed', parseInt(tmpl.find("input[name=speed]").value));

    },
    'keyup input[name=speed]' : function(evt,tmpl){

      Meteor.call('updateSpeed', parseInt(tmpl.find("input[name=speed]").value));

    }
  });

  Template.carSpeed.onCreated(function(){

    var self = this;

    self.subscribe("car","BMW");

  });



  Template.carSpeed.rendered = function () {

    var self = this;

    $('#container').highcharts({

          chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
          },

          title: {
            text: 'Speedometer'
          },

          pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
              backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, '#FFF'],
                  [1, '#333']
                ]
              },
              borderWidth: 0,
              outerRadius: '109%'
            }, {
              backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, '#333'],
                  [1, '#FFF']
                ]
              },
              borderWidth: 1,
              outerRadius: '107%'
            }, {
              // default background
            }, {
              backgroundColor: '#DDD',
              borderWidth: 0,
              outerRadius: '105%',
              innerRadius: '103%'
            }]
          },

          // the value axis
          yAxis: {
            min: 0,
            max: 200,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
              step: 2,
              rotation: 'auto'
            },
            title: {
              text: 'km/h'
            },
            plotBands: [{
              from: 0,
              to: 120,
              color: '#55BF3B' // green
            }, {
              from: 120,
              to: 160,
              color: '#DDDF0D' // yellow
            }, {
              from: 160,
              to: 200,
              color: '#DF5353' // red
            }]
          },

          series: [{
            name: 'Speed',
            data: [80],
            tooltip: {
              valueSuffix: ' km/h'
            }
          }]

        },
        function (chart) {

          var point = chart.series[0].points[0];

          self.autorun(function(){
            var car = Cars.findOne();
            if(!!car){
              point.update(car.speed);
            }
          });

        });

  }

}