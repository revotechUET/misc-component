let neuralNetworkPlayground = require('./visualize-neural-network-playground');

exports.createNNPlayground = function (config, domElem) {
    let neuralNetWork = new neuralNetworkPlayground(config);
    neuralNetWork.init(domElem);
    return neuralNetWork;
}
