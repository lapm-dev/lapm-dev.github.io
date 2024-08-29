(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        name: 'Shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        manifest: {
            name: 'Shikimori',
            author: 'dmitry.tsynik',
            version: '1.0.0',
            description: 'Плагин для интеграции с Shikimori',
            icons: {
                '16': 'img/icons/plugins/shikimori-16.png',
                '128': 'img/icons/plugins/shikimori-128.png',
            },
        },

        init: function() {
            Lampa.Template.add('settings_' + this.component, this.getTemplate());
            Lampa.Listener.follow('app', (e) => {
                if (e.type == 'ready') {
                    this.addSettings();
                    this.addMenuButton();
                }
            });
        },

        getTemplate: function() {
            return `
                <div>
                    <div class="settings-param selector" data-name="shikimori_client_id" data-type="input" placeholder="#{filmix_param_placeholder}">
                        <div class="settings-param__name">Shikimori Client ID</div>
                        <div class="settings-param__value"></div>
                    </div>
                    <div class="settings-param selector" data-name="shikimori_client_secret" data-type="input" placeholder="#{filmix_param_placeholder}">
                        <div class="settings-param__name">Shikimori Client Secret</div>
                        <div class="settings-param__value"></div>
                    </div>
                    <div class="settings-param selector" data-name="shikimori_auth" data-static="true">
                        <div class="settings-param__name">#{shikimori_auth_add_descr}</div>
                    </div>
                </div>
            `;
        },

        addSettings: function() {
            Lampa.Settings.add({
                component: this.component,
                category: 'plugins',
                translate(key, to){
                    let result = Lampa.Lang.translate(key)

                    if(result.indexOf('#{') >= 0){
                        return result.replace(/#{([a-z_0-9-]+)}/g, function(e,s){
                            return Lampa.Lang.translate(s) || s
                        })
                    }
                    else return result
                },
                title: this.name,
                body: this.getTemplate(),
                onBack: ()=>{
                    Lampa.Controller.toggle('settings');
                }
            })

            Lampa.SettingsApi.addParam({
                component: this.component,
                param: {
                    type: 'input',
                    name: 'shikimori_client_id',
                    placeholder: '#{filmix_param_placeholder}'
                },
                field: {
                    name: 'Shikimori Client ID'
                }
            });

            Lampa.SettingsApi.addParam({
                component: this.component,
                param: {
                    type: 'input',
                    name: 'shikimori_client_secret',
                    placeholder: '#{filmix_param_placeholder}'
                },
                field: {
                    name: 'Shikimori Client Secret'
                }
            });

            Lampa.SettingsApi.addParam({
                component: this.component,
                param: {
                    type: 'button',
                    static: true,
                    name: 'shikimori_auth'
                },
                field: {
                    name: '#{shikimori_auth_add_descr}'
                },
                onChange: this.authorize
            });
        },

        updateValues: function() {
            let body = Lampa.Settings.main().render();
            ['shikimori_client_id', 'shikimori_client_secret'].forEach(name => {
                let value = Lampa.Storage.get(name, '');
                body.find(`[data-name="${name}"] .settings-param__value`).text(value);
            });

            body.find('[data-name="shikimori_auth"]').on('hover:enter', this.authorize);
        },

        addMenuButton: function() {
            let button = $(`<li class="menu__item selector">
                <div class="menu__ico">${this.icon}</div>
                <div class="menu__text">${this.name}</div>
            </li>`);

            button.on('hover:enter', () => {
                // Здесь можно добавить действие при наведении на кнопку меню, если необходимо
                // Например, открыть страницу профиля пользователя Shikimori
            });

            $('.menu .menu__list').eq(0).append(button);
        },

        authorize: function() {
            let clientId = Lampa.Storage.get('shikimori_client_id');
            let clientSecret = Lampa.Storage.get('shikimori_client_secret');

            if (!clientId || !clientSecret) {
                Lampa.Noty.show(Lampa.Lang.translate('shikimori_nodevice'));
                return;
            }

            let authUrl = 'https://shikimori.one/oauth/authorize' +
                '?client_id=' + clientId +
                '&redirect_uri=urn:ietf:wg:oauth:2.0:oob' +
                '&response_type=code' +
                '&scope=user_rates+comments+topics';

            Lampa.Noty.show('Please open this URL to authorize: ' + authUrl);

            // Здесь можно добавить код для обработки полученного кода авторизации и получения токена доступа
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

    Lampa.Component.add('shikimori', ShikimoriPlugin);

    window.plugin_shikimori_ready = true;
})();
