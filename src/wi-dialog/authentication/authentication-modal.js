import helper from '../DialogHelper';
require('./authentication-modal.less');
export default function (ModalService, callback, options) {
  ModalController.$inject = ['$scope', 'close', '$timeout', 'wiApi'];
  function ModalController($scope, close, $timeout, wiApi) {
    // let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let self = this;
    self.whoami = options.whoami;
    const availableOptions = [];
    // if (env === 'prod') {
    // 	availableOptions.push({name: 'Product Server', server: config['Product Server']});
    // } else {
    // 	for (const key in config) {
    // 		availableOptions.push({name: key, server: config[key]});
    // 	}
    // }
    // const defaultServer = env === 'prod' ? 'Product Server' : env === 'local' ? 'Local Server' : 'Dev Server';
    // let oldServer = window.localStorage.getItem('Name') || defaultServer;
    // self.server = {
    // 	availableOptions: availableOptions,
    // 	selectedOption: config[oldServer]
    // };
    // this.onButtonShowServerClick = function () {
    // 	console.log(self.server.selectedOption);
    // 	const {
    // 		AUTHENTICATION_SERVICE,
    // 		BASE_URL,
    // 		CHAT_URL,
    // 		FILE_MANAGER,
    // 		INVENTORY_SERVICE,
    // 		MACHINE_LEARNING,
    // 		Name,
    // 		PROCESSING_SERVICE,
    // 		PYTHON_URL,
    // 		BASE_MAP_URL
    // 	} = self.server.selectedOption;
    // 	const serverInformationConfig = {
    // 		title: 'Servers',
    // 		inputs: [
    // 			{
    // 				key: 'Name',
    // 				name: 'Name server',
    // 				input: Name,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'BASE_URL',
    // 				name: 'Main server',
    // 				input: BASE_URL,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'INVENTORY_SERVICE',
    // 				name: 'Inventory server',
    // 				input: INVENTORY_SERVICE,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'FILE_MANAGER',
    // 				name: 'Storage server',
    // 				input: FILE_MANAGER,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'CHAT_URL',
    // 				name: 'Chat url',
    // 				input: CHAT_URL,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'AUTHENTICATION_SERVICE',
    // 				name: 'Authentication sevice',
    // 				input: AUTHENTICATION_SERVICE,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'MACHINE_LEARNING',
    // 				name: 'Machine learning',
    // 				input: MACHINE_LEARNING,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'PROCESSING_SERVICE',
    // 				name: 'Processing service',
    // 				input: PROCESSING_SERVICE,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'PYTHON_URL',
    // 				name: 'Python service',
    // 				input: PYTHON_URL,
    // 				disabled: true
    // 			},
    // 			{
    // 				key: 'BASE_MAP_URL',
    // 				name: 'Base map url',
    // 				input: BASE_MAP_URL,
    // 				disabled: true
    // 			},
    // 		]
    // 	};
    // 	// dialogUtils.serverInformationDialog(ModalService, serverInformationConfig);
    // };
    this.disabled = false;
    this.error = null;
    // this.captchaPNG = wiApiService.getCaptcha();
    this.username = window.localStorage.getItem('username');
    this.remember = true;
    this.onLoginButtonClicked = function () {
      self.error = null;
      if (!self.username || !self.password) return;
      self.username = self.username.toLowerCase();
      let dataRequest = {
        username: self.username,
        password: self.password,
        whoami: self.whoami || "unknown"
      };
      // wiMachineLearningApiService.setServicesUrl(self.server.selectedOption);
      // wiOnlineInvService.setServicesUrl(self.server.selectedOption);
      // wiApiService.setServicesUrl(self.server.selectedOption);
      // window.localStorage.setItem('__BASE_URL', self.server.selectedOption.BASE_URL);
      wiApi.login(dataRequest)
      .then(res => {
        let userInfo = {
          username: self.username,
          token: res.token,
          refreshToken: res.refresh_token,
          remember: self.remember,
          company: res.company
        };
        if (userInfo.remember) {
                window.localStorage.setItem('rememberAuth', true);
              }
            let sameUser = userInfo.username === window.localStorage.getItem('username');
            window.localStorage.setItem('username', userInfo.username);
            window.localStorage.setItem('token', userInfo.token);
            window.localStorage.setItem('refreshToken', userInfo.refreshToken);
            window.localStorage.setItem('company', JSON.stringify(userInfo.company));
        // console.log(userInfo);
        close(userInfo);
      })
      .catch(err => {
        // console.error(err);
        if(toastr) {
          toastr.error(err.message)
        }
      })
    }
  }

  ModalService.showModal({
    template: require('./authentication-modal.html'),
    controller: ModalController,
    controllerAs: "wiModal"
  }).then(function (modal) {
    helper.initModal(modal);
    // helper.preventInitModal(true);
    $(modal.element).css('z-index', 10000);
    $('.modal-backdrop').css({'opacity': 1, 'background-color': '#ffffff', 'z-index': 9999});
    modal.close.then(function (data) {
      // helper.preventInitModal(false);
      helper.removeBackdrop();
      $('.modal-backdrop').remove();
      $('.modal').remove();
      if (callback && data) callback(data);
      // location.reload();
    });
  });
}
