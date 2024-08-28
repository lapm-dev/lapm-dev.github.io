(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            console.log('ShikimoriPlugin init');
            Lampa.Component.add('shikimori', this.component);

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
            var settingsMenu = Lampa.Settings.main();
            if (settingsMenu) {
                var shikimoriButton = $('<div class="settings-folder selector" data-component="shikimori"><div class="settings-folder__icon">' + this.icon + '</div><div class="settings-folder__name">Shikimori</div></div>');
                shikimoriButton.on('hover:enter', this.showSettings.bind(this));
                settingsMenu.render().find('[data-component="more"]').before(shikimoriButton);
            }
        },

        addMenuButton: function() {
            console.log('Adding Shikimori menu button');
            var menu_item = $('<li class="menu__item selector" data-action="shikimori"><div class="menu__ico">' + this.icon + '</div><div class="menu__text">Shikimori</div></li>');
            menu_item.on('hover:enter', this.showSettings.bind(this));
            $('.menu .menu__list').eq(0).append(menu_item);
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
        }
    });

    window.plugin_shikimori_ready = true;
    ShikimoriPlugin.init();
})();
