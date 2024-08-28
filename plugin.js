(function(){
    'use strict';

    var ShikimoriPlugin = {
        init: function() {
            this.addSettingsTemplate();
            this.addSettingsComponent();
            this.registerSettings();
        },
        
        addSettingsTemplate: function() {
            Lampa.Template.add('settings_shikimori', `
                <div>
                    <div class="settings-param">
                        <div class="settings-param__name">Shikimori Client ID</div>
                        <div class="settings-param__value"></div>
                        <div class="settings-param__descr">Введите Client ID вашего приложения Shikimori</div>
                    </div>
                    <div class="settings-param">
                        <div class="settings-param__name">Shikimori Client Secret</div>
                        <div class="settings-param__value"></div>
                        <div class="settings-param__descr">Введите Client Secret вашего приложения Shikimori</div>
                    </div>
                </div>
            `);
        },
        
        addSettingsComponent: function() {
            Lampa.Settings.listener.follow('open', (e) => {
                if (e.name == 'main') {
                    const field = $(Lampa.Lang.translate(`
                        <div class="settings-folder selector" data-component="shikimori">
                            <div class="settings-folder__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="settings-folder__name">Shikimori</div>
                        </div>
                    `));
                    e.body.find('[data-component="more"]').after(field);
                }
            });

            Lampa.Settings.define('shikimori', {
                component: 'shikimori',
                template: 'settings_shikimori',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                name: 'Shikimori'
            });
        },
        
        registerSettings: function() {
            Lampa.Settings.register({
                component: 'shikimori',
                param: {
                    client_id: {
                        default: ''
                    },
                    client_secret: {
                        default: ''
                    }
                },
                onStart: function(){},
                onRender: function(item) {
                    item.on('hover:enter', function(){
                        Lampa.Input.edit({
                            title: 'Введите ' + item.name,
                            value: Lampa.Storage.get('shikimori_' + item.param),
                            free: true,
                            nosave: true
                        }, function(new_value){
                            Lampa.Storage.set('shikimori_' + item.param, new_value);
                            item.update();
                        });
                    });

                    item.update = function(){
                        item.find('.settings-param__value').text(Lampa.Storage.get('shikimori_' + item.param));
                    };

                    item.update();

                    if (item.param === 'client_secret') {
                        item.after($('<div class="settings-param selector" data-action="authorize"><div class="settings-param__name">Авторизоваться в Shikimori</div></div>'));
                        item.on('hover:enter', function(){
                            ShikimoriPlugin.authorize();
                        });
                    }
                }
            });
        },

        authorize: function() {
            var client_id = Lampa.Storage.get('shikimori_client_id');
            if (!client_id) {
                Lampa.Noty.show('Пожалуйста, введите Client ID в настройках Shikimori');
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
                Lampa.Noty.show('Пожалуйста, введите Client ID и Client Secret в настройках Shikimori');
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
                    Lampa.Noty.show('Авторизация в Shikimori успешна');
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка получения токена:', error);
                    Lampa.Noty.show('Ошибка авторизации в Shikimori');
                }
            });
        },

        start: function() {
            // Запуск плагина
        }
    };

    ShikimoriPlugin.init();
})();
