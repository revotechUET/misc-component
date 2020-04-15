module.exports = nodeController
nodeController.$inject = ['$element'];
function nodeController($element) {
    const self = this;
    self.$onInit = function () {
        self.treeRoot = self.findChildAtIdx(self.idx);
        if(typeof(self.noDrag) === 'function' ? !self.noDrag(self.treeRoot) : !self.noDrag) {
          $element.draggable({
            appendTo: 'body',
            helper: function () {
                const wrapper = $('<div style="border:2px dotted #0077be;"></div>');
                // const selectedNodes = self.getSelectedNode();
                if (!wrapper.children().length) {
                    for (const node of self.getSelectedNode().html) {
                        //this node is only for satisfying css
                        //const fakeWiVirtualHtmlNode = self.createNodeTreeElement(-1);
                        const fakeWiVirtualHtmlNode = document.createElement('wi-tree-node-virtual')
                        fakeWiVirtualHtmlNode.appendChild(node);
                        wrapper.append(fakeWiVirtualHtmlNode)
                        //wrapper.append(node)
                    }
                }

                return wrapper;
            },
            start: function ($event, ui) {

                ui.helper.addClass('dragging');
                ui.helper.myData = self.getSelectedNode().data;
                self.onDragStart && self.onDragStart(ui.helper.myData);
								//console.log(ui.helper.myData)
            },
            stop: function ($event, ui) {
                self.onDragStop && self.onDragStop(ui.helper.myData);
            }
        });

        }    
    }

    self.onClick = function ($event) {
        // const thisHtml = $element.find('.node-content')[0].cloneNode(true)
        // const thisHtml = $element[0].cloneNode(true)
//        const thisHtml = cloneCurDOM()
        //from parrent
        self.nodeOnClick(self.treeRoot, $event)
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
        return `${(parseInt(self.findLvOfNode(self.treeRoot)) + 1) * 19}px`
    }
}
