module.exports = function nodeController($element) {
    const self = this;
    self.$onInit = function () {
        self.treeRoot = self.findChildAtIdx(self.idx);
        if(!self.noDrag) {
          $element.draggable({
            appendTo: 'body',
            helper: function () {
                const wrapper = $('<div style="border:2px dotted #0077be;"></div>');
                // const selectedNodes = self.getSelectedNode();
                if (!wrapper.children().length) {
                    for (const node of self.getSelectedNode().html) {
                        //fake node just for satifying css
                        // const insertNode = self.createNodeTreeElement(self.idx);
                        // const content = $element.find('.node-content')[0].cloneNode(true);
                            
                        // content.classList.add('selected');
                        // insertNode.appendChild(content);
                    //     insertNode.appendChild(node._htmlElement);
                    //     wrapper.append(insertNode);

                        //wrapper.append(JSON.parse(node._htmlElement))
                        //wrapper.append(insertNode);
                        wrapper.append(node)
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
        return `${(parseInt(self.treeRoot._lv) + 1) * 19}px`
    }

    function cloneCurDOM() {
        // const wrapper = document.createElement('wi-tree-node-virtual');
        // wrapper.style.position = 'absolute';
        const wrapper = self.createNodeTreeElement(-1);
        const content = $element.find('.node-content')[0].cloneNode(true);
        
        content.classList.add('selected');
        wrapper.appendChild(content);

        return wrapper;
    }
}
