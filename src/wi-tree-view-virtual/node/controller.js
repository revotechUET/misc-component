module.exports = function nodeController($element) {
    const self = this;
    self.$onInit = function () {
        self.treeRoot = self.findChildAtIdx(self.idx);
        $element.draggable({
            appendTo: 'body',
            helper: function () {
                const wrapper = $('<div style="border:2px dotted #0077be;"></div>');
                const selectedNodes = self.getSelectedNode();
                const dragElements = []
                
                
                for(const node of selectedNodes) {
                    //fake node just for satifying css
                    const insertNode = self.createNodeTreeElement(self.idx);
                    insertNode.appendChild(node._htmlElement);

                    //avoid duplication
                    if(!dragElements.find(e => e.innerHTML === insertNode.innerHTML)) {
                        dragElements.push(insertNode)
                    }
                }
                for(const el of dragElements) {
                    wrapper.append(el);
                }
                console.log({
                    data: selectedNodes,
                    html: dragElements
                })
                return wrapper;
            },
            start: function ($event, ui) {

                ui.helper.addClass('dragging');
                ui.helper.myData = self.getSelectedNode();
                self.onDragStart && self.onDragStart(ui.helper.myData);
            },
            stop: function ($event, ui) {
                self.onDragStop && self.onDragStop(ui.helper.myData);
            }
        });
    }

    self.showNode = function () {
        return !(self.treeRoot || {})._hidden;
    }

    self.getIconStyle = function () {
        if (typeof self.iconStyle == 'function') {
            return self.iconStyle(self.treeRoot);
        }
        return self.iconStyle;
    }

    self.getPadding = function () {
        return `${(parseInt(self.treeRoot._lv) + 1) * 19}px`
    }
}