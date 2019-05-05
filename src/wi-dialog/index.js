var serviceName = 'wiDialog';
module.exports.name = serviceName;

let app = angular.module(serviceName, ['angularModalService']);
app.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

app.factory(serviceName, function(ModalService, $sce) {
    return new wiDialogService(ModalService, $sce);
});

function wiDialogService(ModalService, $sce) {
    let self = this;
    this.setDialogUtil = function(dialogUtil) {
        self.DialogUtil = dialogUtil;
    }
    this.promptDialog = function(config, cb) {
        if (self.DialogUtil) {
            return self.DialogUtil.promptDialog(ModalService, config, cb);
        }
        promptDialog(config, cb);
    }
    function promptDialog(promptConfig, callback) {
        function ModalController($scope, close) {
            let self = this;
            this.title = promptConfig.title;
            this.inputs = promptConfig.inputs; // multi inputs
            this.inputName = promptConfig.inputName;
            this.input = promptConfig.input;
            // type: [select, text]
            this.type = promptConfig.type;
            this.options = promptConfig.options;
            this.onOkButtonClicked = function () {
                close(self.input || self.inputs);
            }
            this.onCancelButtonClicked = function () {
                close(null);
            }
        }

        ModalService.showModal({
            template: require("./prompt/prompt-modal.html"),
            controller: ModalController,
            controllerAs: 'wiModal'
        }).then(function (modal) {
            initModal(modal);
            modal.close.then(function (ret) {
                removeBackdrop();
                ret && callback && callback(ret);
            });
        });
    }
}

function initModal(modal) {
    modal.element.modal();
    $(modal.element).prop('tabindex', 1);
    const elem = $(modal.element).find('.modal-content');
    setTimeout(() => {
        elem.find('.modal-header').css('cursor', 'move');
        const offsetWidth = elem.width()/3;
        const offsetHeight = elem.height()/3;
        elem.draggable({
            containment:[-2*offsetWidth, -10, window.innerWidth-offsetWidth, window.innerHeight-offsetHeight],
            handle: '.modal-header'
        });
        $(modal.element).find('input').first().focus();
    }, 500)
    $(modal.element).keydown(function (e) {
        if (e.ctrlKey || e.shiftKey || e.altKey) return;
        if (e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ESCAPE) {
            let okButton, cancelButton;
            let buttonElems = $(modal.element).find('.modal-footer > button');
            for (let i = 0; i < buttonElems.length; i++) {
                if (buttonElems[i].innerText.toLowerCase().trim() == 'ok'
                    || buttonElems[i].innerText.toLowerCase().trim() == 'close'
                ) {
                    okButton = buttonElems[i];
                }
                if (buttonElems[i].innerText.toLowerCase().trim() == 'cancel') {
                    cancelButton = buttonElems[i];
                }
            }
            if (e.keyCode == $.ui.keyCode.ENTER && okButton) {
                e.preventDefault();
                e.stopPropagation();
                okButton.click();
            }
            if (e.keyCode == $.ui.keyCode.ESCAPE && cancelButton) cancelButton.click();
        }
    });
}

function removeBackdrop() {
    $('.modal-backdrop').last().remove();
    $('body').removeClass('modal-open');
}
