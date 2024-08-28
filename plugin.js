(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        name: 'Shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            Lampa.Component.add('shikimori_component', this);

            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') {
                    ShikimoriPlugin.addSettings();
                    ShikimoriPlugin.addMenuButton();
                }
            });
        },

        addSettings: function() {
            if (Lampa.Settings.main && Lampa.Settings.main().render) {
                var field = $("<div class='settings-folder selector' data-component='shikimori'><div class='settings-folder__icon'>" + this.icon + "</div><div class='settings-folder__name'>" + this.name + "</div></div>");
                Lampa.Settings.main().render().find('[data-component="more"]').after(field);
            }
            
            Lampa.Settings.create('shikimori', {
                data: [{
                    title: 'General',
                    items: [{
                        title: 'Shikimori Client ID',
                        name: 'shikimori_client_id',
                        type: 'input',
                        placeholder: Lampa.Lang.translate('filmix_param_placeholder')
                    }, {
                        title: 'Shikimori Client Secret',
                        name: 'shikimori_client_secret',
                        type: 'input',
                        placeholder: Lampa.Lang.translate('filmix_param_placeholder')
                    }, {
                        title: Lampa.Lang.translate('filmix_params_add_device') + ' Shikimori',
                        name: 'shikimori_auth',
                        type: 'static',
                        onRender: function(item) {
                            item.on('hover:enter', ShikimoriPlugin.authorize);
                        }
                    }]
                }],
                onRender: function(item) {
                    item.on('hover:enter', function() {
                        Lampa.Settings.create('shikimori');
                    });
                }
            });
        },

        addMenuButton: function() {
            var button = $("<li class=\"menu__item selector\">\n" +
                "<div class=\"menu__ico\">"+ this.icon +"</div>\n" +
                "<div class=\"menu__text\">"+ this.name +"</div>\n" +
            "</li>");
            
            button.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: 'Shikimori',
                    component: 'shikimori_component',
                    page: 1
                });
            });

            $('.menu .menu__list').eq(0).append(button);
        },

        authorize: function() {
            var clientId = Lampa.Storage.get('shikimori_client_id');
            var clientSecret = Lampa.Storage.get('shikimori_client_secret');

            if (!clientId || !clientSecret) {
                Lampa.Noty.show(Lampa.Lang.translate('shikimori_nodevice'));
                return;
            }

            // Here goes the authorization logic
            // This is a placeholder and should be replaced with actual OAuth2 flow
            var authUrl = 'https://shikimori.one/oauth/authorize' +
                '?client_id=' + clientId +
                '&redirect_uri=urn:ietf:wg:oauth:2.0:oob' +
                '&response_type=code' +
                '&scope=user_rates+comments+topics';

            // Open authorization URL (this part depends on your environment)
            // For example, you might want to show this URL to the user
            Lampa.Noty.show('Please open this URL to authorize: ' + authUrl);

            // After authorization, you would typically exchange the received code for an access token
            // This part should be implemented server-side for security reasons
        },

        // Render the main view of your plugin
        render: function() {
            return $('<div>Shikimori Plugin Content</div>');
        },

        // Other methods for your plugin functionality
        start: function() {
            // Logic when the plugin starts
        },

        stop: function() {
            // Logic when the plugin stops
        },

        onStart: function() {
            // What to do on plugin start
        },

        onBack: function() {
            // How to handle 'back' action
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

    var manifest = {
        type: 'video',
        version: '1.0',
        name: 'Shikimori',
        description: 'Plugin for Shikimori integration',
        component: 'shikimori_component'
    };

    Lampa.Manifest.plugins['shikimori'] = manifest;
    ShikimoriPlugin.init();
})();
