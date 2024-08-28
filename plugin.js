(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    ShikimoriPlugin.addMenuButton();
                }
            });
        },

        addMenuButton: function() {
            var menu = Lampa.Menu.main().render();
            menu.find('[data-action="settings"]').after(
                '<li class="menu__item selector" data-action="shikimori">'+
                    '<div class="menu__ico">' + ShikimoriPlugin.icon + '</div>'+
                    '<div class="menu__text">Shikimori</div>'+
                '</li>'
            );

            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'action' && e.action == 'shikimori') {
                    ShikimoriPlugin.showSettings();
                }
            });
        },

        showSettings: function() {
            Lampa.Select.show({
                title: 'Shikimori',
                items: [
                    {
                        title: 'Shikimori Client ID',
                        description: Lampa.Storage.get('shikimori_client_id') || 'Не установлено',
                        inputPlaceholder: 'Введите Client ID',
                        onSelect: function (item) {
                            Lampa.Input.edit({
                                title: 'Shikimori Client ID',
                                value: Lampa.Storage.get('shikimori_client_id') || '',
                                free: true,
                                nosave: true
                            }, function (new_value) {
                                Lampa.Storage.set('shikimori_client_id', new_value);
                                item.description = new_value || 'Не установлено';
                                Lampa.Select.draw();
                            });
                        }
                    },
                    {
                        title: 'Shikimori Client Secret',
                        description: Lampa.Storage.get('shikimori_client_secret') ? '******' : 'Не установлено',
                        inputPlaceholder: 'Введите Client Secret',
                        onSelect: function (item) {
                            Lampa.Input.edit({
                                title: 'Shikimori Client Secret',
                                value: Lampa.Storage.get('shikimori_client_secret') || '',
                                free: true,
                                nosave: true
                            }, function (new_value) {
                                Lampa.Storage.set('shikimori_client_secret', new_value);
                                item.description = new_value ? '******' : 'Не установлено';
                                Lampa.Select.draw();
                            });
                        }
                    },
                    {
                        title: Lampa.Lang.translate('filmix_params_add_device') + ' Shikimori',
                        onSelect: ShikimoriPlugin.authorize
                    }
                ],
                onBack: function() {
                    Lampa.Controller.toggle('menu');
                }
            });
        },

        authorize: function() {
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
                        var code = ShikimoriPlugin.getParameterByName('code', event.url);
                        if (code) {
                            ShikimoriPlugin.getToken(code);
                        }
                    }
                });
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
                    Lampa.Storage.set('shikimori_token', response.access_token);
                    Lampa.Storage.set('shikimori_refresh_token', response.refresh_token);
                    Lampa.Noty.show(Lampa.Lang.translate('shikimori_auth_success'));
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка получения токена:', error);
                    Lampa.Noty.show(Lampa.Lang.translate('shikimori_auth_error'));
                }
            });
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

    window.plugin_shikimori_ready = true;
    ShikimoriPlugin.init();
})();
