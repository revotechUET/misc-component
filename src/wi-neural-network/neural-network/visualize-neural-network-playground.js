module.exports = NeuralNetwork;

const NODE_SIZE = 30;
const LABEL_DIST = NODE_SIZE + 10; // under node
const NODE_SPACE_BETWEEN = 20;
const LAYER_LABEL_CONTAINER_HEIGHT = NODE_SIZE + 20;

function NeuralNetwork(config) {
    this.inputCurves = config.inputCurves;
    this.outputCurves = config.outputCurves;
    this.hiddenLayer = config.hiddenLayer;
}

NeuralNetwork.prototype.init = function (domElem) {
    let self = this;
    this.root = d3.select(domElem);
    this.plotContainer = this.root.append('div')
        .attr('class', 'neural-network-plot-container')
        .attr('style', 'display: flex; flex: 1');

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'neural-network-svg-container')
        .attr('height', '100%')
        .attr('width', '100%');

    this.zoomableContainer = this.svgContainer.append('g')
        .attr('class', 'zoomable-container');

    this.prepareLayers();
}

NeuralNetwork.prototype.setProperties = function (newProps) {
    this.inputCurves = newProps.inputCurves || this.inputCurves;
    this.outputCurves = newProps.outputCurves || this.outputCurves;
    this.hiddenLayer = newProps.hiddenLayer || this.hiddenLayer;
}

NeuralNetwork.prototype.getNodes = function () {
    // create nodes for network
    let self = this;
    let nodes = [];
    // get Random color for node
    function getColor(d) {
        let colorStep = 240 / (self.nLayers + 2);
        let startColor = (d-1) * colorStep;
        let r = Math.round(startColor + Math.random() * colorStep);
        let g = Math.round(startColor + Math.random() * colorStep);
        let b = Math.round(startColor + Math.random() * colorStep);
        return 'rgb(' + ([r,g,b].join(',')) + ')';
    }
    // input layer
    nodes = self.inputCurves.map(function (curve, idx) {
        return {
            label: curve.name,
            layer: 1,
            lidx: idx + 1,
            color: getColor(1)
        };
    });
    // hidden layers
    /*
    for(let i = 1; i <= self.nLayers; ++i) {
        for( let j = 1; j <= self.nNodes; ++j) {
            nodes.push({
                label: 'hidden' + j,
                layer: i + 1,
                lidx: j,
                color: getColor(i+1)
            })
        }
    }
    */
    let hiddenNodes = [];
    self.hiddenLayer.forEach(function(nNodes, idx) {
        for(let i = 1; i <= nNodes; ++i) {
            hiddenNodes.push({
                label: 'hidden' + idx + '_' + i,
                layer: idx + 2,
                lidx: i,
                color: getColor(idx + 2)
            })
        }
    });
    nodes = nodes.concat(hiddenNodes);
    self.nLayers = self.hiddenLayer.length;
    // output layer
    nodes = nodes.concat(self.outputCurves.map(function (curve, idx) {
        return {
            label: curve.name,
            layer: self.nLayers + 2,
            lidx: idx + 1,
            color: getColor(self.nLayers + 2)
        };
    }));
    return nodes;
}

NeuralNetwork.prototype.prepareLayers = function () {
    let self = this;
    self.nLayers = self.hiddenLayer.length;

    // calculate space between nodes
    let svgSize = self.svgContainer.node().getBoundingClientRect();
    let maxNetworkHorizontalSize = self.nLayers + 2;
    let maxNetworkVerticalNode = d3.max([self.inputCurves.length, d3.max(self.hiddenLayer), self.outputCurves.length]);
    let ydist = NODE_SIZE * 2 + NODE_SPACE_BETWEEN;
    let maxNetworkVerticalSize = ydist * maxNetworkVerticalNode;

    let container = self.zoomableContainer;
    container.selectAll("*").remove();
    // Zoom Function
    var zoom = d3.zoom()
        .on("zoom", zoomed);
    self.svgContainer.call(zoom)
        .on("dblclick.zoom", null);
    function zoomed() {
        container.attr("transform", d3.event.transform);
    }
    // scale container to fit parent Node
    let scaleFactor = (svgSize.height - NODE_SIZE*2) / (maxNetworkVerticalSize + NODE_SIZE * 4);
    var zoomIdentity = d3.zoomIdentity.scale(scaleFactor);
    self.svgContainer.call(zoom.transform, zoomIdentity);

    if(!self.inputCurves.length || !self.outputCurves.length) return;

    let nodes = self.getNodes();
    let layerSizes = {};
    let links = [];
    nodes.forEach( (d) => {
        if(d.layer in layerSizes) { layerSizes[d.layer] ++;}
        else { layerSizes[d.layer] = 1};
    });

    let xdist = (svgSize.width) / (maxNetworkHorizontalSize * scaleFactor);

    // create node locations
    nodes.map(function(d) {
        d["x"] = (d.layer - 0.5) * xdist;
        d["y"] = LAYER_LABEL_CONTAINER_HEIGHT + (d.lidx - 0.5) * (maxNetworkVerticalSize / layerSizes[d.layer]);
    });

    // drawing layer labels
    let lowestY = d3.min(nodes.map((n) => n.y));
    let labelContainer = container.append('g')
        .attr('class', 'neural-network-labels');
    inputLabelX = nodes.find((n) => n.layer == 1).x;
    outputLabelX = nodes.find((n) => n.layer == self.nLayers + 2).x;

    hiddenStartNode = nodes.find((n) => n.layer == 2)
    hiddenLabelStartX = hiddenStartNode ? hiddenStartNode.x : inputLabelX + NODE_SIZE*3;
    hiddenStopNode = nodes.find((n) => n.layer == self.nLayers + 1);
    hiddenLabelStopX = hiddenStopNode ? hiddenStopNode.x : outputLabelX - NODE_SIZE;
    labelContainer.append('text')
        .attr('class', 'input-layer-label')
        .attr('text-anchor', 'middle')
        .attr('dx', inputLabelX)
        .attr('dy', lowestY - LAYER_LABEL_CONTAINER_HEIGHT)
        .text("Input Layer");
    labelContainer.append('text')
        .attr('class', 'hidden-layer-label')
        .attr('text-anchor', 'middle')
        .attr('dx', function() { return (hiddenLabelStartX + hiddenLabelStopX) / 2;})
        .attr('dy', lowestY - LAYER_LABEL_CONTAINER_HEIGHT)
        .text("Hidden Layer");
    labelContainer.append('text')
        .attr('class', 'output-layer-label')
        .attr('text-anchor', 'middle')
        .attr('dx', outputLabelX)
        .attr('dy', lowestY - LAYER_LABEL_CONTAINER_HEIGHT)
        .text("Output Layer");

    let layerLabelLine = d3.line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveMonotoneY);
    let inputLayerLabelDatum = [
        {x: inputLabelX - NODE_SIZE * 1.75, y: lowestY - NODE_SIZE},
        {x: inputLabelX - NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
        {x: inputLabelX, y: lowestY - NODE_SIZE - 15},
        {x: inputLabelX + NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
        {x: inputLabelX + NODE_SIZE * 1.75, y: lowestY -NODE_SIZE}
    ];
    labelContainer.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('class', 'input-layer-path')
        .datum(inputLayerLabelDatum)
            .attr('d', layerLabelLine);
    if(self.hiddenLayer.length) {
        let hiddenLayerLabelDatum = [
            {x: hiddenLabelStartX - NODE_SIZE * 1.75, y: lowestY - NODE_SIZE},
            {x: hiddenLabelStartX - NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
            {x: ((hiddenLabelStartX + hiddenLabelStopX) / 2), y: lowestY - NODE_SIZE - 15},
            {x: hiddenLabelStopX + NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
            {x: hiddenLabelStopX + NODE_SIZE * 1.75, y: lowestY - NODE_SIZE}
        ];
        labelContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('class', 'hidden-layer-path')
            .datum(hiddenLayerLabelDatum)
                .attr('d', layerLabelLine);
    }
    let outputLayerLabelDatum = [
        {x: outputLabelX - NODE_SIZE * 1.75, y: lowestY - NODE_SIZE},
        {x: outputLabelX - NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
        {x: outputLabelX, y: lowestY - NODE_SIZE - 15},
        {x: outputLabelX + NODE_SIZE * 1.5, y: lowestY - NODE_SIZE - 5},
        {x: outputLabelX + NODE_SIZE * 1.75, y: lowestY -NODE_SIZE}
    ];
    labelContainer.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('class', 'output-layer-path')
        .datum(outputLayerLabelDatum)
            .attr('d', layerLabelLine);

    // autogenerate links
    nodes.map(function(d, i) {
        for (var n in nodes) {
            if (d.layer + 1 == nodes[n].layer) {
                links.push({
                    source: parseInt(i),
                    target: parseInt(n),
                    color: d.color,
                    weight: -1 + Math.random() * 2 // random weight generating
                });
            }
        }
    }).filter(function(d) { return typeof d !== "undefined"; });

    // get hidden layer nodes
    let hiddenLayerNodes = [];
    for(let i = 0; i < self.hiddenLayer.length; ++i) {
        let layerNodes = nodes.filter((node) => (node.layer == (i + 2)));
        hiddenLayerNodes.push(layerNodes);
    }

    //handle events
    function handleNodeMouseover(d, i) {
        d3.select(this).select('circle')
            .style('stroke-width', '5')
            .style('stroke', 'black');
    }
    function handleNodemouseout(d,i) {
        d3.select(this).select('circle')
            .style('stroke', 'none');
    }
    function handleNodeMousedown(d, i) {
        // handle for input layer
        if(d.layer == 1 || d.layer == self.nLayers + 2) {
            let circle = d3.select(this).select('circle')
            if(circle.style('fill-opacity') == 0.5) {
                circle.style('fill-opacity', 1);
                if(this.recycleLinks) {
                    links = links.concat(this.recycleLinks);
                }
            } else {
                circle.style('fill-opacity', 0.5);
                this.recycleLinks = links.filter((l) => (l.source == i || l.target == i));
                links = links.filter((l) => (l.source != i && l.target != i));
            }
            draw();
        } else {
            //handle for other layers
        }
    }
    function handleHiddenLayerMouseLeave(d, i) {
        d3.select(this)
            .attr('fill-opacity', 0)
            .attr('stroke','none');
    }
    function handleHiddenLayerMouseOver(d, i) {
        d3.select(this)
            .attr('fill-opacity', 0.3)
            .attr('stroke','black');
    }
    function draw() {
        // draw links
        let line = d3.line()
            .x(function (d, i) {
                if(i == 0) return d.x + NODE_SIZE;
                else if(i == 3) return d.x - NODE_SIZE;
                else return d.x;
            })
            .y(function (d, i) {
                return d.y;
            })
            .curve(d3.curveBundle.beta(0.45));
        function getCurveDatum(data) {
            let source = nodes[data.source];
            let target = nodes[data.target];
            let commonX = (source.x + target.x)/2;
            let datum = [source,
                        {x: commonX, y: source.y},
                        {x: commonX, y: target.y},
                        target];
            return datum;
        }
        let link = container.selectAll(".link")
            .data(links);
        // update
        link.select('path')
            .attr("stroke", '#888')
            .attr("stroke-width", 1)
            .datum(function(d) { return getCurveDatum(d); })
            .attr("d", line);
        // enter + update
        link.enter().append("g")
                .attr("class", "link")
                .append('path')
                    .attr("fill", "none")
                    .attr("stroke", "#888")
                    .attr("stroke-width", 1)
                    .datum(function(d) { return getCurveDatum(d); })
                    .attr("d", line);

        link.exit().remove();
        // draw nodes
        let node = container.selectAll(".node")
            .data(nodes)
          .enter().append("g")
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; }
            )
            .on('mouseover', handleNodeMouseover)
            .on('mouseout', handleNodemouseout)
            .on('mousedown', handleNodeMousedown);

        node.append("circle")
            .attr("class", "node-circle")
            .attr("r", NODE_SIZE)
            .style("fill", function(d) { return d.color; });

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dx", function() { return 0;})
            .attr("dy", function() { return LABEL_DIST;})
            .text(function(d) { return d.label; });

        node.exit().remove();
    }
    draw();
}
