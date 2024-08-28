(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            console.log('ShikimoriPlugin init');
            Lampa.Component.add('shikimori', this.component);
            Lampa.Template.add('settings_shikimori', this.renderSettings);

            this.addSettings();
            this.addMenuButton();

            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    // Any additional initialization after app is ready
                }
            });
        },

        addSettings: function() {
            console.log('Adding Shikimori settings');
            var ico = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            var menu_item = $('<li class="menu__item selector" data-action="shikimori"><div class="menu__ico">' + ico + '</div><div class="menu__text">Shikimori</div></li>');
            menu_item.on('hover:enter', this.showSettings.bind(this));
            $('.menu .menu__list').eq(0).append(menu_item);
        },

        addMenuButton: function() {
            console.log('Adding Shikimori menu button');
            var settingsMenu = Lampa.Settings.main().render();
            if (settingsMenu) {
                var shikimoriButton = $('<div class="settings-folder selector" data-component="shikimori"><div class="settings-folder__icon">' + this.icon + '</div><div class="settings-folder__name">Shikimori</div></div>');
                shikimoriButton.on('hover:enter', this.showSettings.bind(this));
                settingsMenu.find('[data-component="more"]').before(shikimoriButton);
            }
        },

        showSettings: function() {
            console.log('Showing Shikimori settings');
            Lampa.Settings.create('shikimori');
            var html = this.renderSettings();
            this.updateSettingsView(html);
            Lampa.Controller.enable('settings_component');
        },

        renderSettings: function() {
            console.log('Rendering Shikimori settings');
            var html = '<div>';

            html += '<div class="settings-param selector" data-name="shikimori_client_id" data-type="input" data-default="">';
            html += '<div class="settings-param__name">Shikimori Client ID</div>';
            html += '<div class="settings-param__value"></div>';
            html += '<div class="settings-param__descr">' + Lampa.Lang.translate('filmix_param_placeholder') + '</div>';
            html += '</div>';

            html += '<div class="settings-param selector" data-name="shikimori_client_secret" data-type="input" data-default="">';
            html += '<div class="settings-param__name">Shikimori Client Secret</div>';
            html += '<div class="settings-param__value"></div>';
            html += '<div class="settings-param__descr">' + Lampa.Lang.translate('filmix_param_placeholder') + '</div>';
            html += '</div>';

            html += '<div class="settings-param selector" data-name="shikimori_auth" data-static="true">';
            html += '<div class="settings-param__name">' + Lampa.Lang.translate('filmix_params_add_device') + ' Shikimori</div>';
            html += '<div class="settings-param__descr">' + Lampa.Lang.translate('shikimori_auth_add_descr') + '</div>';
            html += '</div>';

            html += '</div>';
            return html;
        },

        updateSettingsView: function(html) {
            console.log('Updating settings view');
            $('.settings__content').empty().append(html);

            var clients = $('.settings-param__value', html);
            clients.eq(0).text(Lampa.Storage.get('shikimori_client_id') || '');
            clients.eq(1).text(Lampa.Storage.get('shikimori_client_secret') || '');

            $('.selector[data-name="shikimori_client_id"]', html).on('hover:enter', function () {
                this.editClientSettings('shikimori_client_id');
            }.bind(this));

            $('.selector[data-name="shikimori_client_secret"]', html).on('hover:enter', function () {
                this.editClientSettings('shikimori_client_secret');
            }.bind(this));

            $('.selector[data-name="shikimori_auth"]', html).on('hover:enter', this.authorize.bind(this));
        },

        editClientSettings: function(settingName) {
            console.log('Editing client settings:', settingName);
            Lampa.Input.edit({
                value: Lampa.Storage.get(settingName) || '',
                title: settingName === 'shikimori_client_id' ? 'Shikimori Client ID' : 'Shikimori Client Secret',
                free: true,
                nosave: true
            }, function (newValue) {
                Lampa.Storage.set(settingName, newValue);
                this.updateSettingsView($('.settings__content').html());
            }.bind(this));
        },

        authorize: function() {
            console.log('Authorizing Shikimori');
            var client_id = Lampa.Storage.get('shikimori_client_id');
            if (!client_id) {
                Lampa.Noty.show(Lampa.Lang.translate('shikimori_nodevice'));
                return;
            }

            var redirectUri = 'https://lampa.mx/shikimori-oauth';
            var authUrl = 'https://shikimori.one/oauth/authorize' +
                '?client_id=' + encodeURIComponent(client_id) +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&response_type=code' +
                '&scope=user_rates';

            if (window.cordova) {
                var ref = cordova.InAppBrowser.open(authUrl, '_blank', 'location=yes');
                ref.addEventListener('loadstart', function(event) {
                    if (event.url.indexOf(redirectUri) === 0) {
                        ref.close();
                        var code = this.getParameterByName('code', event.url);
                        if (code) {
                            this.getToken(code);
                        }
                    }
                }.bind(this));
            } else {
                window.open(authUrl, '_blank');
            }
        },

        getParameterByName: function(name, url) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },

        getToken: function(code) {
            console.log('Getting token');
            var client_id = Lampa.Storage.get('shikimori_client_id');
            var client_secret = Lampa.Storage.get('shikimori_client_secret');

            if (!client_id || !client_secret) {
                Lampa.Noty.show(Lampa.Lang.translate('shikimori_nodevice'));
                return;
            }

            $.ajax({
                url: 'https://shikimori.one/oauth/token',
                method: 'POST',
                data: {
                    grant_type: 'authorization_code',
                    client_id: client_id,
                    client_secret: client_secret,
                    code: code,
                    redirect_uri: 'https://lampa.mx/shikimori-oauth'
                },
                success: function(response) {
                    console.log('Token received successfully');
                    Lampa.Storage.set('shikimori_token', response.access_token);
                    Lampa.Storage.set('shikimori_refresh_token', response.refresh_token);
                    Lampa.Noty.show(Lampa.Lang.translate('shikimori_auth_success'));
                },
                error: function(xhr, status, error) {
                    console.error('Error getting token:', error);
                    Lampa.Noty.show(Lampa.Lang.translate('shikimori_auth_error'));
                }
            });
        },

        component: function() {
            var html = $('<div></div>');
            this.render = function() {
                return html;
            };
            this.destroy = function() {
                html.remove();
            };
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

    Lampa.Manifest.plugins = [];
    Lampa.Manifest.plugins.push({
        component: 'shikimori',
        name: 'Shikimori',
        url: '',
        href: 'https://github.com/yumata/lampa-source/blob/master/src/plugins/shikimori/shikimori.js',
        author: 'Yumata'
    });

    window.plugin_shikimori_ready = true;
    ShikimoriPlugin.init();
})();
