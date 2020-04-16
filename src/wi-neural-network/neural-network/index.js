import neuralNetworkPlayground from './visualize-neural-network-playground';

export const createNNPlayground = function (config, domElem) {
    let neuralNetWork = new neuralNetworkPlayground(config);
    neuralNetWork.init(domElem);
    return neuralNetWork;
}
