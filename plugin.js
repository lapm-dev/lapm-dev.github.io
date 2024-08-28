(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    ShikimoriPlugin.addSettings();
                    ShikimoriPlugin.addMenuButton();
                }
            });
        },

        addSettings: function() {
            Lampa.SettingsApi.addComponent({
                component: ShikimoriPlugin.component,
                name: 'Shikimori',
                icon: ShikimoriPlugin.icon
            });

            Lampa.SettingsApi.addParam({
                component: ShikimoriPlugin.component,
                param: {
                    name: 'shikimori_client_id',
                    type: 'input',
                    default: ''
                },
                field: {
                    name: 'Shikimori Client ID',
                    description: Lampa.Lang.translate('filmix_param_placeholder')
                },
                onChange: function(value) {
                    Lampa.Storage.set('shikimori_client_id', value);
                }
            });

            Lampa.SettingsApi.addParam({
                component: ShikimoriPlugin.component,
                param: {
                    name: 'shikimori_client_secret',
                    type: 'input',
                    default: ''
                },
                field: {
                    name: 'Shikimori Client Secret',
                    description: Lampa.Lang.translate('filmix_param_placeholder')
                },
                onChange: function(value) {
                    Lampa.Storage.set('shikimori_client_secret', value);
                }
            });

            Lampa.SettingsApi.addParam({
                component: ShikimoriPlugin.component,
                param: {
                    name: 'shikimori_auth',
                    type: 'static'
                },
                field: {
                    name: Lampa.Lang.translate('filmix_params_add_device') + ' Shikimori',
                    description: Lampa.Lang.translate('shikimori_auth_add_descr')
                },
                onRender: function(item) {
                    item.on('hover:enter', function() {
                        ShikimoriPlugin.authorize();
                    });
                }
            });
        },

        addMenuButton: function() {
            var settingsMenu = Lampa.Settings.main().render();

            if (settingsMenu) {
                var shikimoriButton = $('<div class="settings-folder selector" data-component="shikimori"><div class="settings-folder__icon">' + ShikimoriPlugin.icon + '</div><div class="settings-folder__name">Shikimori</div></div>');

                shikimoriButton.on('hover:enter', function(){
                    Lampa.Settings.create('shikimori');
                });

                settingsMenu.find('[data-component="more"]').before(shikimoriButton);
            }
        },

        authorize: function() {
            // Здесь реализация авторизации
            // ...
        }
    };

    Lampa.Lang.add({
        shikimori_nodevice: {
            ru: 'Введите Client ID и Client Secret в настройках Shikimori',
            en: 'Enter Client ID and Client Secret in Shikimori settings'
        },
        shikimori_auth_success: {
            ru: 'Авторизация в Shikimori успешна',
            en: 'Shikimori authorization successful'
        },
        shikimori_auth_error: {
            ru: 'Ошибка авторизации в Shikimori',
            en: 'Shikimori authorization error'
        },
        shikimori_auth_add_descr: {
            ru: 'Добавить устройство в Shikimori',
            en: 'Add device to Shikimori'
        }
    });

    ShikimoriPlugin.init();
})();
