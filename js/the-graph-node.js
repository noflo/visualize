(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Font Awesome
  var faKeys = Object.keys(TheGraph.FONT_AWESOME);

  // Node view

  TheGraph.Node = React.createClass({
    mixins: [
      TheGraph.mixins.FakeMouse,
      TheGraph.mixins.Tooltip
    ],
    getInitialState: function() {
      return {
        // Random icon just for fun
        icon: 'cog'
      };
    },
    componentDidMount: function () {
      // Mouse listen to window for drag/release outside
      // window.addEventListener("mousemove", this.onMouseMove);
      // window.addEventListener("mouseup", this.onMouseUp);

      // Right-click
      this.getDOMNode().addEventListener("contextmenu", this.contextMenu);
    },
    mouseX: 0,
    mouseY: 0,
    highlight: function () {
      var highlightEvent = new CustomEvent('the-graph-node-highlight', { 
        'detail': this, 
        'bubbles': true
      });
      this.getDOMNode().dispatchEvent(highlightEvent);
    },
    getTooltipTrigger: function () {
      return this.getDOMNode();
    },
    shouldShowTooltip: function () {
      // HACK
      return (this.props.app.state.scale < TheGraph.zbpNormal);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if moved
      return (
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y
      );
    },
    render: function() {
      var metadata = this.props.process.metadata;

      var label = this.props.label;
      var sublabel = this.props.process.component;
      if (sublabel === label) {
        sublabel = "";
      }
      var x = this.props.x;
      var y = this.props.y;

      // Ports
      var keys, count, index;

      // Inports
      var inports = metadata.ports.inports;
      keys = Object.keys(inports);
      count = keys.length;
      index = 0;
      var inportViews = keys.map(function(key){
        index++;
        var info = inports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      // Outports
      var outports = metadata.ports.outports;
      keys = Object.keys(outports);
      count = keys.length;
      index = 0;
      var outportViews = keys.map(function(key){
        index++;
        var info = outports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      return (
        React.DOM.g(
          {
            className: "node drag",
            name: this.props.key,
            key: this.props.key,
            title: label,
            transform: "translate("+x+","+y+")",
            onMouseDown: this.onMouseDown
          },
          React.DOM.rect({
            className: "node-bg", // HACK to make the whole g draggable
            width: TheGraph.nodeSize,
            height: TheGraph.nodeSize + 35
          }),
          React.DOM.rect({
            className: "node-rect drag",
            width: TheGraph.nodeSize,
            height: TheGraph.nodeSize,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "node-icon drag",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize/2,
            children: TheGraph.FONT_AWESOME[this.state.icon]
          }),
          React.DOM.g({
            className: "inports",
            children: inportViews
          }),
          React.DOM.g({
            className: "outports",
            children: outportViews
          }),
          React.DOM.text({
            className: "node-label",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 20,
            children: label
          }),
          React.DOM.text({
            className: "node-sublabel",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 35,
            children: sublabel
          })
        )
      );
    }
  });





  TheGraph.NodeMenu = React.createClass({
    render: function() {
      var metadata = this.props.process.metadata;

      var label = metadata.label;
      if (label === undefined || label === "") {
        label = this.props.process.key;
      }
      var x = this.props.x;
      var y = this.props.y;

      // Ports
      var keys, count, index;

      // Inports
      var inports = metadata.ports.inports;
      keys = Object.keys(inports);
      count = keys.length;
      index = 0;
      var inportViews = keys.map(function(key){
        index++;
        var info = inports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      // Outports
      var outports = metadata.ports.outports;
      keys = Object.keys(outports);
      count = keys.length;
      index = 0;
      var outportViews = keys.map(function(key){
        index++;
        var info = outports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      return (
        React.DOM.g(
          {
            className: "node",
            name: this.props.key,
            key: this.props.key,
            transform: "translate("+x+","+y+")"
          },
          React.DOM.rect({
            className: "node-rect drag",
            name: this.props.key, // makes it draggable
            width: TheGraph.nodeSize,
            height: TheGraph.nodeSize,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "node-icon drag",
            name: this.props.key, // makes it draggable
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize/2,
            children: TheGraph.FONT_AWESOME[this.state.icon]
          }),
          React.DOM.g({
            className: "inports",
            children: inportViews
          }),
          React.DOM.g({
            className: "outports",
            children: outportViews
          }),
          React.DOM.text({
            className: "node-label",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 20,
            children: label
          })
        )
      );
    }
  });


})(this);
