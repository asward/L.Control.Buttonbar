
L.Control.ButtonBar = L.Control.extend(/** @lends L.Control.ButtonBar.prototype */ {
    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        id: 'buttonbar',
        position: 'right', //top/bottom/left/RIGHT
        justify: 'center', //start/CENTER/end
        orientation: 'vert', //horz/VERT
        marginTop: false,
        marginBottom: false,
        marginLeft: false,
        marginRight: false,
    },

    initialize: function (id, options) {
        var i, child;
        
        L.setOptions(this, options);

        this._buttons = [];
        this.id_counter = 1;


        // Find sidebar HTMLElement
        this._buttonbar = L.DomUtil.get(id);
        if (!this._buttonbar) {
            this._buttonbar = document.createElement('div');
            this._buttonbar.id = id;
            this._buttonbar.classList.add('buttonbar');

            document.body.insertBefore(this._buttonbar, document.body.firstChild);
        }

        // Attach .buttonbar-bottom/top class
        L.DomUtil.addClass(this._buttonbar, 'buttonbar-' + this.options.position);
        L.DomUtil.addClass(this._buttonbar, 'buttonbar-justify-' + this.options.justify);
        L.DomUtil.addClass(this._buttonbar, 'buttonbar-' + this.options.orientation);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._buttonbar, 'leaflet-touch');

        document.addEventListener('DOMContentLoaded', (event) => {

            this.reinitialize();
            this.show();

        })
    },


    reinitialize: function () {
        //TO ENABLE DYNAMIC ADDING OF BUTTONS
        //this.initialize_button_items();

        if (this.options.orientation === "horz") {
            this._buttonbar.style.width = this._buttons.length * 40 + this._buttons.length * 4 + "px";
            this._buttonbar.style.maxWidth = `calc(100% ${this.options.marginLeft ? " - " + this.options.marginLeft : ""} ${this.options.marginRight? " - " +this.options.marginRight : ""})`;
        } else {
            this._buttonbar.style.height = this._buttons.length * 40 + this._buttons.length * 4 + "px";

            var mt = parseInt((this.options.marginTop ? this.options.marginTop : getComputedStyle(this._buttonbar).marginTop).replace(/px/, ""));
            var mb = parseInt((this.options.marginBottom ? this.options.marginBottom : getComputedStyle(this._buttonbar).marginBottom).replace(/px/, ""));
            this._buttonbar.style.maxHeight = `calc(100% ${this.options.marginTop ? " - " + this.options.marginTop : ""} ${this.options.marginBottom ? " - " + this.options.marginBottom : ""})`;
        }

        if (this.options.marginTop) {
            this._buttonbar.style.marginTop = this.options.marginTop;
        }

        if (this.options.marginBottom) {
            this._buttonbar.style.marginBottom = this.options.marginBottom;
        }

        if (this.options.marginLeft) {
            this._buttonbar.style.marginLeft = this.options.marginLeft;
        }

        if (this.options.marginRight) {
            this._buttonbar.style.marginRight = this.options.marginRight;
        }
    },
    
    addTo: function (map) {
        //Add this buttonbar to the specified map.
        var i, child;

        this._map = map;
        this.show();
        //this.initialize_on_click();

        return this;
    },

    remove: function (map) {
        //Remove this buttonbar from the map.
        var i, child;

        this._map = null;

        //remove click events from buttons
        return this;
    },


    open: function (id) {
        // open buttonbar (if necessary)
        if (L.DomUtil.hasClass(this._buttonbar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._buttonbar, 'collapsed');
        }

        return this;
    },

    close: function() {
        // close buttonbar
        if (!L.DomUtil.hasClass(this._buttonbar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._buttonbar, 'collapsed');
        }

        return this;
    },

    add_control: function (_opts) {


        let new_control= document.createElement('li');

        //APPEND TO GROUP OR MAKE A NEW ONE
        if (_opts.hasOwnProperty('group')) {
            let group = this._buttonbar.querySelector(`ul.${_opts.group}`)
            if (null != group) {
                group.appendChild(new_control);
            } else {
                let ul = document.createElement('ul');
                ul.classList.add(_opts.group);
                ul.appendChild(new_control);
                this._buttonbar.appendChild(ul);
            }
        } else {
            //NO GROUP GIVEN, LEAVE BLANK
            let ul = document.createElement('ul');
            ul.appendChild(new_control);
            this._buttonbar.appendChild(ul);
        }


        this._buttons.push(new Button(this, new_control, _opts));

        this.reinitialize();
    },

    hide: function(){
        this._buttonbar.classList.add('collapsed');
    },

    show: function () {
        this._buttonbar.classList.remove('collapsed');
    },

    clear: function(){
        //remove all button items and dispose
        this._buttons.forEach((b) => {
            b.Remove();
        });

        //REMOVE STUCTURE
        while (this._buttonbar.firstChild) {
            this._buttonbar.removeChild(this._buttonbar.firstChild);
        }

        this._buttons = [];
    },

    transitionControls: function (controls) {
        
        var bbar = this;
        this._buttonbar.addEventListener('transitionend', () => {
            bbar.clear();
            controls.forEach((c) => {
                bbar.add_control(c);
            });
            bbar.show();

        }, { once: true });
        this.hide();
    }
});

L.control.buttonbar = function (id, options) {
    return new L.Control.ButtonBar(id, options);
};


class Button {
    constructor(button_bar, dom, _opts = {}) {

        this.button_bar = button_bar;
        this.dom = dom;

        this.opts = Object.assign({
            id: `control_${this.id_counter++}`,
            icon: "fas fa-question-circle",
            title: "Button",
        }, _opts);

        if (this.opts.hasOwnProperty('states')) {
            this.num_states = this.opts.states.length;
            this.cur_state = 0;
        }


        this.InitializeEvents();
        this.UpdateHTML();
    }

    ClearDOMObject() {
        while (this.dom.firstChild) {
            this.dom.removeChild(this.dom.firstChild);
        }
    }

    Remove() {
        this.ClearDOMObject();
        this.dom.remove();
    }
    //CreateDOMObject() {
    //    this.control_dom = document.createElement('li');

    //    //APPEND TO GROUP OR MAKE A NEW ONE
    //    if (this.opts.hasOwnProperty('group')) {
    //        let group = this.dom_parent.querySelector(`.${opts.group}`)
    //        if (null != group) {
    //            group.appendChild(this.control_dom);
    //        } else {
    //            let ul = document.createElement('ul');
    //            ul.classList.add(this.opts.group);
    //            ul.appendChild(this.control_dom);
    //            this.dom_parent.querySelector('.buttonbar-groups').appendChild(ul);
    //        }
    //    } else {
    //        //NO GROUP GIVEN, LEAVE BLANK
    //        let ul = document.createElement('ul');
    //        ul.appendChild(this.control_dom);
    //        this.dom_parent.querySelector('.buttonbar-groups').appendChild(ul);
    //    }
    //    return this.control_dom;
    //}


    UpdateHTML() {
        this.ClearDOMObject();

        var cur_opts;
        //USE STATES OR OPTS
        if (this.opts.hasOwnProperty('states')) {
            cur_opts = this.opts.states[this.cur_state];
        } else {
            cur_opts = this.opts;
        }

        var a = document.createElement('a');
        a.id = this.id;

        if (cur_opts.hasOwnProperty('icon')) {
            var i = document.createElement('i');
            i.classList.add(...cur_opts.icon.split(" "));
            a.appendChild(i);
        } 

        if (cur_opts.hasOwnProperty('argb')) {
            let a, c;
            [a, c] = Utility.color.ARGBToHexAlphaColor(cur_opts.argb);
            a.style['background-color'] = c;
        } else if (cur_opts.hasOwnProperty('color')) {
            a.style['background-color'] = cur_opts.color;
        }

        //FIRE UPDATEEVENT (IF ANY)
        if (cur_opts.hasOwnProperty('update_event')) {
            var update_event = new Event(cur_opts.update_event);
            document.dispatchEvent(update_event);
        }

        this.dom.appendChild(a);
    }

    InitializeEvents() {
        //SINGLE CLICK
        L.DomEvent.on(this.dom, 'click',  (ev) => {

            document.dispatchEvent(new CustomEvent(`${this.id}_click`));

            //STATE
            if (this.opts.hasOwnProperty('states')) {
                //CYCLE STATE
                this.cur_state++;
                this.cur_state = this.cur_state >= this.num_states ? 0 : this.cur_state;

                let state_opts = this.opts.states[this.cur_state];

                //STATE CALLBACK
                if (state_opts.hasOwnProperty('callback')) {
                    state_opts.callback(this);
                }

                //STATE EVENT
                if (state_opts.hasOwnProperty('event')) {
                    let state_event = new Event(state_opts.event);
                    document.dispatchEvent(state_event);
                }
            }


            //CALLBACK
            if (this.opts.hasOwnProperty('callback')) {
                this.opts.callback(this);
            }

            //EVENT
            if (this.opts.hasOwnProperty('event')) {
                var event = new Event(this.opts.event);
                document.dispatchEvent(event);
            }

            this.UpdateHTML();
        });


    }
}
