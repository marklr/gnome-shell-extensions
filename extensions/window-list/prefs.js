// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
/* exported init buildPrefsWidget */

const { Gio, GLib, GObject, Gtk } = imports.gi;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;


function init() {
    ExtensionUtils.initTranslations();
}

const WindowListPrefsWidget = GObject.registerClass(
class WindowListPrefsWidget extends Gtk.Grid {
    _init() {
        super._init({
            margin_top: 24,
            margin_bottom: 24,
            margin_start: 24,
            margin_end: 24,
            row_spacing: 6,
            orientation: Gtk.Orientation.VERTICAL,
        });

        let groupingLabel = '<b>%s</b>'.format(_('Window Grouping'));
        this.add(new Gtk.Label({
            label: groupingLabel, use_markup: true,
            halign: Gtk.Align.START,
        }));

        let grid = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 6,
            column_spacing: 6,
            margin_start: 12,
        });
        this.add(grid);

        this._settings = ExtensionUtils.getSettings();
        this._actionGroup = new Gio.SimpleActionGroup();
        for (const key of this._settings.list_keys())
            this._actionGroup.add_action(this._settings.create_action(key));
        this.insert_action_group('window-list', this._actionGroup);

        let range = this._settings.get_range('grouping-mode');
        let modes = range.deep_unpack()[1].deep_unpack();

        let modeLabels = {
            'never': _('Never group windows'),
            'auto': _('Group windows when space is limited'),
            'always': _('Always group windows'),
        };

        let radio = null;
        for (let i = 0; i < modes.length; i++) {
            let mode = modes[i];
            let label = modeLabels[mode];
            if (!label) {
                log('Unhandled option "%s" for grouping-mode'.format(mode));
                continue;
            }

            radio = new Gtk.RadioButton({
                label,
                group: radio,
                action_name: 'window-list.grouping-mode',
                action_target: new GLib.Variant('s', mode),
            });
            grid.add(radio);
        }

        let check = new Gtk.CheckButton({
            label: _('Show on all monitors'),
            action_name: 'window-list.show-on-all-monitors',
            margin_top: 6,
        });
        this.add(check);

        check = new Gtk.CheckButton({
            label: _('Show windows from all workspaces'),
            action_name: 'window-list.display-all-workspaces',
            margin_top: 6,
        });
        this.add(check);
    }
});

function buildPrefsWidget() {
    return new WindowListPrefsWidget();
}
