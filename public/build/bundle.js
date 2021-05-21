
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const ChosenPanel = writable({
        name: "",
    });

    /* src/components/taskbar/panels/StartPanel.svelte generated by Svelte v3.38.2 */
    const file$e = "src/components/taskbar/panels/StartPanel.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			button2 = element("button");
    			attr_dev(button0, "class", "btn-power svelte-hbvzcs");
    			add_location(button0, file$e, 14, 4, 399);
    			attr_dev(button1, "class", "btn-settings svelte-hbvzcs");
    			add_location(button1, file$e, 15, 4, 432);
    			attr_dev(button2, "class", "btn-profile svelte-hbvzcs");
    			add_location(button2, file$e, 16, 4, 468);
    			attr_dev(div, "class", div_class_value = "panel " + /*className*/ ctx[0] + " svelte-hbvzcs");
    			set_style(div, "visibility", "hidden");
    			add_location(div, file$e, 13, 0, 336);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t0);
    			append_dev(div, button1);
    			append_dev(div, t1);
    			append_dev(div, button2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*className*/ 1 && div_class_value !== (div_class_value = "panel " + /*className*/ ctx[0] + " svelte-hbvzcs")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StartPanel", slots, []);
    	let className = "";
    	let previouslyOpened = false;

    	ChosenPanel.subscribe(data => {
    		if (data.name === "start") {
    			$$invalidate(0, className = "panel-open");
    			previouslyOpened = true;
    			return;
    		}

    		$$invalidate(0, className = previouslyOpened ? "panel-close" : "");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StartPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ChosenPanel, className, previouslyOpened });

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("previouslyOpened" in $$props) previouslyOpened = $$props.previouslyOpened;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className];
    }

    class StartPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartPanel",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/taskbar/StartButton.svelte generated by Svelte v3.38.2 */
    const file$d = "src/components/taskbar/StartButton.svelte";

    function create_fragment$d(ctx) {
    	let button;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let startpanel;
    	let current;
    	let mounted;
    	let dispose;
    	startpanel = new StartPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			create_component(startpanel.$$.fragment);
    			if (img0.src !== (img0_src_value = "./vectors/icons8-windows-10-start.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "visibility", /*inactiveVisibility*/ ctx[1]);
    			attr_dev(img0, "class", "svelte-jv6rbt");
    			add_location(img0, file$d, 38, 4, 938);
    			if (img1.src !== (img1_src_value = "./vectors/icons8-windows-10-start-active.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "visibility", /*activeVisibility*/ ctx[0]);
    			attr_dev(img1, "class", "svelte-jv6rbt");
    			add_location(img1, file$d, 43, 4, 1070);
    			attr_dev(button, "class", "svelte-jv6rbt");
    			add_location(button, file$d, 33, 0, 835);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img0);
    			append_dev(button, t0);
    			append_dev(button, img1);
    			insert_dev(target, t1, anchor);
    			mount_component(startpanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "mouseenter", /*onMouseEnter*/ ctx[3], false, false, false),
    					listen_dev(button, "mouseleave", /*onMouseLeave*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*onClick*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*inactiveVisibility*/ 2) {
    				set_style(img0, "visibility", /*inactiveVisibility*/ ctx[1]);
    			}

    			if (!current || dirty & /*activeVisibility*/ 1) {
    				set_style(img1, "visibility", /*activeVisibility*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			destroy_component(startpanel, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StartButton", slots, []);
    	let activeVisibility = "hidden";
    	let inactiveVisibility = "visible";
    	let chosen = false;

    	ChosenPanel.subscribe(data => {
    		chosen = data.name === "start";
    		$$invalidate(0, activeVisibility = "hidden");
    		$$invalidate(1, inactiveVisibility = "visible");

    		if (chosen) {
    			$$invalidate(0, activeVisibility = "visible");
    			$$invalidate(1, inactiveVisibility = "hidden");
    		}
    	});

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = data.name === "start" ? "" : "start";
    			return data;
    		});
    	}

    	function onMouseEnter() {
    		$$invalidate(0, activeVisibility = "visible");
    		$$invalidate(1, inactiveVisibility = "hidden");
    	}

    	function onMouseLeave() {
    		if (chosen) {
    			return;
    		}

    		$$invalidate(0, activeVisibility = "hidden");
    		$$invalidate(1, inactiveVisibility = "visible");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StartButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		StartPanel,
    		activeVisibility,
    		inactiveVisibility,
    		chosen,
    		onClick,
    		onMouseEnter,
    		onMouseLeave
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeVisibility" in $$props) $$invalidate(0, activeVisibility = $$props.activeVisibility);
    		if ("inactiveVisibility" in $$props) $$invalidate(1, inactiveVisibility = $$props.inactiveVisibility);
    		if ("chosen" in $$props) chosen = $$props.chosen;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeVisibility, inactiveVisibility, onClick, onMouseEnter, onMouseLeave];
    }

    class StartButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartButton",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/taskbar/TaskbarItem.svelte generated by Svelte v3.38.2 */

    const file$c = "src/components/taskbar/TaskbarItem.svelte";

    function create_fragment$c(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let t;
    	let div;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t = space();
    			div = element("div");
    			if (img.src !== (img_src_value = /*iconPath*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "taskbar-icon svelte-1dn5c5q");
    			add_location(img, file$c, 35, 4, 810);
    			attr_dev(div, "class", "svelte-1dn5c5q");
    			add_location(div, file$c, 36, 4, 865);
    			attr_dev(button, "class", button_class_value = "taskbar-item " + /*className*/ ctx[2] + " svelte-1dn5c5q");
    			set_style(button, "--item-position", /*itemPosition*/ ctx[0]);
    			add_location(button, file$c, 30, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t);
    			append_dev(button, div);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconPath*/ 2 && img.src !== (img_src_value = /*iconPath*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*className*/ 4 && button_class_value !== (button_class_value = "taskbar-item " + /*className*/ ctx[2] + " svelte-1dn5c5q")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*itemPosition*/ 1) {
    				set_style(button, "--item-position", /*itemPosition*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TaskbarItem", slots, []);
    	let { itemPosition } = $$props;
    	let { iconPath } = $$props;
    	const states = { unopened: 1, opened: 2, focused: 3 };
    	let state = states.unopened;
    	let className = "taskbar-item-unopened";

    	function onClick() {
    		switch (state) {
    			case states.unopened:
    				{
    					state = states.opened;
    					$$invalidate(2, className = "taskbar-item-opened");
    					break;
    				}
    			case states.opened:
    				{
    					state = states.focused;
    					$$invalidate(2, className = "taskbar-item-focused");
    					break;
    				}
    			case states.focused:
    				{
    					state = states.opened;
    					$$invalidate(2, className = "taskbar-item-opened");
    					break;
    				}
    		}
    	}

    	const writable_props = ["itemPosition", "iconPath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TaskbarItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("itemPosition" in $$props) $$invalidate(0, itemPosition = $$props.itemPosition);
    		if ("iconPath" in $$props) $$invalidate(1, iconPath = $$props.iconPath);
    	};

    	$$self.$capture_state = () => ({
    		itemPosition,
    		iconPath,
    		states,
    		state,
    		className,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("itemPosition" in $$props) $$invalidate(0, itemPosition = $$props.itemPosition);
    		if ("iconPath" in $$props) $$invalidate(1, iconPath = $$props.iconPath);
    		if ("state" in $$props) state = $$props.state;
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemPosition, iconPath, className, onClick];
    }

    class TaskbarItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { itemPosition: 0, iconPath: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskbarItem",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemPosition*/ ctx[0] === undefined && !("itemPosition" in props)) {
    			console.warn("<TaskbarItem> was created without expected prop 'itemPosition'");
    		}

    		if (/*iconPath*/ ctx[1] === undefined && !("iconPath" in props)) {
    			console.warn("<TaskbarItem> was created without expected prop 'iconPath'");
    		}
    	}

    	get itemPosition() {
    		throw new Error("<TaskbarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemPosition(value) {
    		throw new Error("<TaskbarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPath() {
    		throw new Error("<TaskbarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPath(value) {
    		throw new Error("<TaskbarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/taskbar/panels/SystemTrayPanel.svelte generated by Svelte v3.38.2 */
    const file$b = "src/components/taskbar/panels/SystemTrayPanel.svelte";

    function create_fragment$b(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "system-tray-panel svelte-dips6g");
    			set_style(div, "--visibility", /*visibility*/ ctx[0]);
    			add_location(div, file$b, 11, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visibility*/ 1) {
    				set_style(div, "--visibility", /*visibility*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SystemTrayPanel", slots, []);
    	let visibility = "hidden";

    	ChosenPanel.subscribe(data => {
    		if (data.name === "systemtray") {
    			$$invalidate(0, visibility = "visible");
    			return;
    		}

    		$$invalidate(0, visibility = "hidden");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SystemTrayPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ChosenPanel, visibility });

    	$$self.$inject_state = $$props => {
    		if ("visibility" in $$props) $$invalidate(0, visibility = $$props.visibility);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visibility];
    }

    class SystemTrayPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTrayPanel",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/taskbar/SystemTray.svelte generated by Svelte v3.38.2 */
    const file$a = "src/components/taskbar/SystemTray.svelte";

    function create_fragment$a(ctx) {
    	let button;
    	let t;
    	let systemtraypanel;
    	let current;
    	let mounted;
    	let dispose;
    	systemtraypanel = new SystemTrayPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = space();
    			create_component(systemtraypanel.$$.fragment);
    			attr_dev(button, "class", "svelte-1g0buk6");
    			add_location(button, file$a, 10, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(systemtraypanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(systemtraypanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(systemtraypanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t);
    			destroy_component(systemtraypanel, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SystemTray", slots, []);

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = data.name === "systemtray" ? "" : "systemtray";
    			return data;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SystemTray> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ChosenPanel, SystemTrayPanel, onClick });
    	return [onClick];
    }

    class SystemTray extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTray",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    let eng = {
        weekDays: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ],
        months: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        weekDaysShort: {
            monday: "Mo",
            tuesday: "Tu",
            wednesday: "We",
            thursday: "Th",
            friday: "Fr",
            saturday: "Sa",
            sunday: "Su",
        },
        notificationPanel: {
            noNewNotification: "No new notification",
            location: "Location",
            nightLight: "Night light",
            screenSnip: "Screen snip",
            network: "Network",
        },
    };

    const Language = writable({
        language: "en",
        text: eng,
    });

    let mon = {
        weekDays: ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"],
        months: [
            "1 Сар",
            "2 Сар",
            "3 Сар",
            "4 Сар",
            "5 Сар",
            "6 Сар",
            "7 Сар",
            "8 Сар",
            "9 Сар",
            "10 Сар",
            "11 Сар",
            "12 Сар",
        ],
        weekDaysShort: {
            monday: "Да",
            tuesday: "Мя",
            wednesday: "Лх",
            thursday: "Пү",
            friday: "Ба",
            saturday: "Бя",
            sunday: "Ня",
        },
        notificationPanel: {
            noNewNotification: "Шинэ мэдээ алга",
            location: "Байршил",
            nightLight: "Шөнийн горим",
            screenSnip: "Дэлгэц хэсэглэх",
            network: "Сүлжээ",
        },
    };

    /* src/components/taskbar/panels/LanguagePickerPanel.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/components/taskbar/panels/LanguagePickerPanel.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let button0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let br0;
    	let t3;
    	let button0_class_value;
    	let t4;
    	let button1;
    	let div2;
    	let t6;
    	let div3;
    	let t7;
    	let br1;
    	let t8;
    	let button1_class_value;
    	let div4_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			button0 = element("button");
    			div0 = element("div");
    			div0.textContent = "ENG";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("English (United States)");
    			br0 = element("br");
    			t3 = text("US Keyboard");
    			t4 = space();
    			button1 = element("button");
    			div2 = element("div");
    			div2.textContent = "МОН";
    			t6 = space();
    			div3 = element("div");
    			t7 = text("Mongolian");
    			br1 = element("br");
    			t8 = text("Buuz (Mongolian)");
    			attr_dev(div0, "class", "language-picker-option-left svelte-134k3sl");
    			add_location(div0, file$9, 59, 8, 1590);
    			add_location(br0, file$9, 61, 35, 1727);
    			attr_dev(div1, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div1, file$9, 60, 8, 1649);
    			attr_dev(button0, "class", button0_class_value = "language-picker-option-EN " + /*engClass*/ ctx[1] + " svelte-134k3sl");
    			add_location(button0, file$9, 58, 4, 1506);
    			attr_dev(div2, "class", "language-picker-option-left svelte-134k3sl");
    			add_location(div2, file$9, 65, 8, 1862);
    			add_location(br1, file$9, 67, 21, 1985);
    			attr_dev(div3, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div3, file$9, 66, 8, 1921);
    			attr_dev(button1, "class", button1_class_value = "language-picker-option-MN " + /*monClass*/ ctx[2] + " svelte-134k3sl");
    			add_location(button1, file$9, 64, 4, 1778);
    			attr_dev(div4, "class", div4_class_value = "language-picker-panel " + /*className*/ ctx[0] + " svelte-134k3sl");
    			set_style(div4, "visibility", "hidden");
    			add_location(div4, file$9, 57, 0, 1426);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, button0);
    			append_dev(button0, div0);
    			append_dev(button0, t1);
    			append_dev(button0, div1);
    			append_dev(div1, t2);
    			append_dev(div1, br0);
    			append_dev(div1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, button1);
    			append_dev(button1, div2);
    			append_dev(button1, t6);
    			append_dev(button1, div3);
    			append_dev(div3, t7);
    			append_dev(div3, br1);
    			append_dev(div3, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*onClickEng*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*onClickMon*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*engClass*/ 2 && button0_class_value !== (button0_class_value = "language-picker-option-EN " + /*engClass*/ ctx[1] + " svelte-134k3sl")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*monClass*/ 4 && button1_class_value !== (button1_class_value = "language-picker-option-MN " + /*monClass*/ ctx[2] + " svelte-134k3sl")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty & /*className*/ 1 && div4_class_value !== (div4_class_value = "language-picker-panel " + /*className*/ ctx[0] + " svelte-134k3sl")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LanguagePickerPanel", slots, []);
    	let className = "";
    	let previouslyOpened = false;

    	ChosenPanel.subscribe(data => {
    		if (data.name === "language") {
    			$$invalidate(0, className = "panel-open");
    			previouslyOpened = true;
    			return;
    		}

    		$$invalidate(0, className = previouslyOpened ? "panel-close" : "");
    	});

    	let engClass = "language-picker-not-chosen";
    	let monClass = "language-picker-not-chosen";
    	let lang = "en";

    	Language.subscribe(data => {
    		lang = data.language;

    		switch (lang) {
    			case "en":
    				{
    					$$invalidate(1, engClass = "language-picker-chosen");
    					$$invalidate(2, monClass = "language-picker-not-chosen");
    					break;
    				}
    			case "mn":
    				{
    					$$invalidate(1, engClass = "language-picker-not-chosen");
    					$$invalidate(2, monClass = "language-picker-chosen");
    					break;
    				}
    		}
    	});

    	function onClickEng() {
    		Language.update(data => {
    			data.language = "en";
    			data.text = eng;
    			return data;
    		});

    		close();
    	}

    	function onClickMon() {
    		Language.update(data => {
    			data.language = "mn";
    			data.text = mon;
    			return data;
    		});

    		close();
    	}

    	function close() {
    		ChosenPanel.update(data => {
    			data.name = "close";
    			return data;
    		});

    		$$invalidate(0, className = "panel-close");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LanguagePickerPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		Language,
    		eng,
    		mon,
    		className,
    		previouslyOpened,
    		engClass,
    		monClass,
    		lang,
    		onClickEng,
    		onClickMon,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("previouslyOpened" in $$props) previouslyOpened = $$props.previouslyOpened;
    		if ("engClass" in $$props) $$invalidate(1, engClass = $$props.engClass);
    		if ("monClass" in $$props) $$invalidate(2, monClass = $$props.monClass);
    		if ("lang" in $$props) lang = $$props.lang;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className, engClass, monClass, onClickEng, onClickMon];
    }

    class LanguagePickerPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePickerPanel",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/taskbar/LanguagePicker.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/components/taskbar/LanguagePicker.svelte";

    function create_fragment$8(ctx) {
    	let button;
    	let p;
    	let t0;
    	let t1;
    	let languagepickerpanel;
    	let current;
    	let mounted;
    	let dispose;
    	languagepickerpanel = new LanguagePickerPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			p = element("p");
    			t0 = text(/*languageAbbr*/ ctx[0]);
    			t1 = space();
    			create_component(languagepickerpanel.$$.fragment);
    			attr_dev(p, "class", "svelte-12zm8z3");
    			add_location(p, file$8, 25, 4, 644);
    			attr_dev(button, "class", "svelte-12zm8z3");
    			add_location(button, file$8, 24, 0, 612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, p);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(languagepickerpanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*languageAbbr*/ 1) set_data_dev(t0, /*languageAbbr*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(languagepickerpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(languagepickerpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			destroy_component(languagepickerpanel, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LanguagePicker", slots, []);
    	let languageAbbr = "";

    	Language.subscribe(data => {
    		switch (data.language) {
    			case "en":
    				{
    					$$invalidate(0, languageAbbr = "ENG");
    					break;
    				}
    			case "mn":
    				{
    					$$invalidate(0, languageAbbr = "МОН");
    					break;
    				}
    		}
    	});

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = data.name === "language" ? "" : "language";
    			return data;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LanguagePicker> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		LanguagePickerPanel,
    		ChosenLanguage: Language,
    		languageAbbr,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("languageAbbr" in $$props) $$invalidate(0, languageAbbr = $$props.languageAbbr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [languageAbbr, onClick];
    }

    class LanguagePicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePicker",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/taskbar/panels/CalendarPanel.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/components/taskbar/panels/CalendarPanel.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (100:24) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "color", "grey");
    			attr_dev(button, "class", "svelte-6a8ex9");
    			add_location(button, file$7, 100, 28, 3550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dateGrid*/ 128 && t_value !== (t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(100:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}
    function create_if_block(ctx) {
    	let button;
    	let t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "color", "white");
    			attr_dev(button, "class", "svelte-6a8ex9");
    			add_location(button, file$7, 96, 28, 3362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dateGrid*/ 128 && t_value !== (t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(96:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}",
    		ctx
    	});

    	return block;
    }

    // (95:20) {#each [...Array(6).keys()] as j}
    function create_each_block_1(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*dateGrid, now*/ 192) show_if = !!(/*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getMonth() == /*now*/ ctx[6].getMonth());
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(95:20) {#each [...Array(6).keys()] as j}",
    		ctx
    	});

    	return block;
    }

    // (93:12) {#each [...Array(7).keys()] as i}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = [...Array(6).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "svelte-6a8ex9");
    			add_location(div, file$7, 93, 16, 3200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dateGrid, Array, now*/ 192) {
    				each_value_1 = [...Array(6).keys()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(93:12) {#each [...Array(7).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div19;
    	let div6;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let div3;
    	let div2;
    	let t2;
    	let t3;
    	let div5;
    	let div4;
    	let t4;
    	let t5;
    	let div18;
    	let div8;
    	let div7;
    	let t6;
    	let t7;
    	let div16;
    	let div9;
    	let t8_value = /*language*/ ctx[1].text.weekDaysShort.sunday + "";
    	let t8;
    	let t9;
    	let div10;
    	let t10_value = /*language*/ ctx[1].text.weekDaysShort.monday + "";
    	let t10;
    	let t11;
    	let div11;
    	let t12_value = /*language*/ ctx[1].text.weekDaysShort.tuesday + "";
    	let t12;
    	let t13;
    	let div12;
    	let t14_value = /*language*/ ctx[1].text.weekDaysShort.wednesday + "";
    	let t14;
    	let t15;
    	let div13;
    	let t16_value = /*language*/ ctx[1].text.weekDaysShort.thursday + "";
    	let t16;
    	let t17;
    	let div14;
    	let t18_value = /*language*/ ctx[1].text.weekDaysShort.friday + "";
    	let t18;
    	let t19;
    	let div15;
    	let t20_value = /*language*/ ctx[1].text.weekDaysShort.saturday + "";
    	let t20;
    	let t21;
    	let div17;
    	let div19_class_value;
    	let each_value = [...Array(7).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div19 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*upperTimerText*/ ctx[2]);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t2 = text(/*upperHourTypeText*/ ctx[3]);
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t4 = text(/*upperDateText*/ ctx[4]);
    			t5 = space();
    			div18 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			t6 = text(/*lowerMonthYearText*/ ctx[5]);
    			t7 = space();
    			div16 = element("div");
    			div9 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div10 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div11 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			div12 = element("div");
    			t14 = text(t14_value);
    			t15 = space();
    			div13 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			div14 = element("div");
    			t18 = text(t18_value);
    			t19 = space();
    			div15 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			div17 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "svelte-6a8ex9");
    			add_location(div0, file$7, 69, 12, 2265);
    			attr_dev(div1, "class", "upper-time svelte-6a8ex9");
    			add_location(div1, file$7, 68, 8, 2228);
    			attr_dev(div2, "class", "svelte-6a8ex9");
    			add_location(div2, file$7, 72, 12, 2358);
    			attr_dev(div3, "class", "upper-hour-type svelte-6a8ex9");
    			add_location(div3, file$7, 71, 8, 2316);
    			attr_dev(div4, "class", "svelte-6a8ex9");
    			add_location(div4, file$7, 75, 12, 2449);
    			attr_dev(div5, "class", "upper-date svelte-6a8ex9");
    			add_location(div5, file$7, 74, 8, 2412);
    			attr_dev(div6, "class", "upper svelte-6a8ex9");
    			add_location(div6, file$7, 67, 4, 2200);
    			attr_dev(div7, "class", "svelte-6a8ex9");
    			add_location(div7, file$7, 80, 12, 2577);
    			attr_dev(div8, "class", "lower-month-year svelte-6a8ex9");
    			add_location(div8, file$7, 79, 8, 2534);
    			attr_dev(div9, "class", "svelte-6a8ex9");
    			add_location(div9, file$7, 83, 12, 2674);
    			attr_dev(div10, "class", "svelte-6a8ex9");
    			add_location(div10, file$7, 84, 12, 2734);
    			attr_dev(div11, "class", "svelte-6a8ex9");
    			add_location(div11, file$7, 85, 12, 2794);
    			attr_dev(div12, "class", "svelte-6a8ex9");
    			add_location(div12, file$7, 86, 12, 2855);
    			attr_dev(div13, "class", "svelte-6a8ex9");
    			add_location(div13, file$7, 87, 12, 2918);
    			attr_dev(div14, "class", "svelte-6a8ex9");
    			add_location(div14, file$7, 88, 12, 2980);
    			attr_dev(div15, "class", "svelte-6a8ex9");
    			add_location(div15, file$7, 89, 12, 3040);
    			attr_dev(div16, "class", "lower-week-days svelte-6a8ex9");
    			add_location(div16, file$7, 82, 8, 2632);
    			attr_dev(div17, "class", "lower-days svelte-6a8ex9");
    			add_location(div17, file$7, 91, 8, 3113);
    			attr_dev(div18, "class", "lower svelte-6a8ex9");
    			add_location(div18, file$7, 78, 4, 2506);
    			attr_dev(div19, "class", div19_class_value = "calendar " + /*className*/ ctx[0] + " svelte-6a8ex9");
    			set_style(div19, "visibility", "hidden");
    			add_location(div19, file$7, 66, 0, 2133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div6);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div6, t1);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, t4);
    			append_dev(div19, t5);
    			append_dev(div19, div18);
    			append_dev(div18, div8);
    			append_dev(div8, div7);
    			append_dev(div7, t6);
    			append_dev(div18, t7);
    			append_dev(div18, div16);
    			append_dev(div16, div9);
    			append_dev(div9, t8);
    			append_dev(div16, t9);
    			append_dev(div16, div10);
    			append_dev(div10, t10);
    			append_dev(div16, t11);
    			append_dev(div16, div11);
    			append_dev(div11, t12);
    			append_dev(div16, t13);
    			append_dev(div16, div12);
    			append_dev(div12, t14);
    			append_dev(div16, t15);
    			append_dev(div16, div13);
    			append_dev(div13, t16);
    			append_dev(div16, t17);
    			append_dev(div16, div14);
    			append_dev(div14, t18);
    			append_dev(div16, t19);
    			append_dev(div16, div15);
    			append_dev(div15, t20);
    			append_dev(div18, t21);
    			append_dev(div18, div17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div17, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*upperTimerText*/ 4) set_data_dev(t0, /*upperTimerText*/ ctx[2]);
    			if (dirty & /*upperHourTypeText*/ 8) set_data_dev(t2, /*upperHourTypeText*/ ctx[3]);
    			if (dirty & /*upperDateText*/ 16) set_data_dev(t4, /*upperDateText*/ ctx[4]);
    			if (dirty & /*lowerMonthYearText*/ 32) set_data_dev(t6, /*lowerMonthYearText*/ ctx[5]);
    			if (dirty & /*language*/ 2 && t8_value !== (t8_value = /*language*/ ctx[1].text.weekDaysShort.sunday + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*language*/ 2 && t10_value !== (t10_value = /*language*/ ctx[1].text.weekDaysShort.monday + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*language*/ 2 && t12_value !== (t12_value = /*language*/ ctx[1].text.weekDaysShort.tuesday + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*language*/ 2 && t14_value !== (t14_value = /*language*/ ctx[1].text.weekDaysShort.wednesday + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*language*/ 2 && t16_value !== (t16_value = /*language*/ ctx[1].text.weekDaysShort.thursday + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*language*/ 2 && t18_value !== (t18_value = /*language*/ ctx[1].text.weekDaysShort.friday + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*language*/ 2 && t20_value !== (t20_value = /*language*/ ctx[1].text.weekDaysShort.saturday + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*Array, dateGrid, now*/ 192) {
    				each_value = [...Array(7).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div17, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*className*/ 1 && div19_class_value !== (div19_class_value = "calendar " + /*className*/ ctx[0] + " svelte-6a8ex9")) {
    				attr_dev(div19, "class", div19_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div19);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CalendarPanel", slots, []);
    	let className = "";
    	let previouslyOpened = false;

    	ChosenPanel.subscribe(data => {
    		if (data.name === "calendar") {
    			$$invalidate(0, className = "panel-open");
    			previouslyOpened = true;
    			return;
    		}

    		$$invalidate(0, className = previouslyOpened ? "panel-close" : "");
    	});

    	let language = get_store_value(Language);

    	Language.subscribe(data => {
    		$$invalidate(1, language = data);
    	});

    	let upperTimerText = "";
    	let upperHourTypeText = "";
    	let upperDateText = "";
    	let lowerMonthYearText = "";
    	let now = new Date();

    	let dateGrid = [
    		[now, now, now, now, now, now, now],
    		[now, now, now, now, now, now, now],
    		[now, now, now, now, now, now, now],
    		[now, now, now, now, now, now, now],
    		[now, now, now, now, now, now, now],
    		[now, now, now, now, now, now, now]
    	];

    	function updateDates() {
    		let runningDate = new Date(now.getFullYear(), now.getMonth(), 1);
    		runningDate.setDate(runningDate.getDate() - runningDate.getDay());

    		for (let i = 0; i < 6; i++) {
    			for (let j = 0; j < 7; j++) {
    				$$invalidate(7, dateGrid[i][j] = new Date(runningDate.getTime()), dateGrid);
    				runningDate.setDate(runningDate.getDate() + 1);
    			}
    		}
    	}

    	function updateTexts() {
    		$$invalidate(6, now = new Date());
    		let year = now.getFullYear();
    		let dayOfMonth = now.getDate();
    		let hour = now.getHours();
    		let minute = now.getMinutes();
    		let second = now.getSeconds();
    		let ampm = hour >= 12 ? "PM" : "AM";
    		let day = language.text.weekDays[now.getDay()];
    		let month = language.text.months[now.getMonth()];
    		hour = hour % 12;
    		let fullhour = hour < 10 ? "0" + hour : "" + hour;
    		let fullminute = minute < 10 ? "0" + minute : "" + minute;
    		let sullsecond = second < 10 ? "0" + second : "" + second;
    		$$invalidate(2, upperTimerText = `${fullhour}:${fullminute}:${sullsecond}`);
    		$$invalidate(3, upperHourTypeText = ampm);
    		$$invalidate(4, upperDateText = `${day}, ${month} ${dayOfMonth}, ${year}`);
    		$$invalidate(5, lowerMonthYearText = `${month} ${year}`);
    	}

    	setInterval(
    		() => {
    			updateTexts();
    		},
    		100
    	);

    	updateDates();
    	updateTexts();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CalendarPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		Language,
    		get: get_store_value,
    		className,
    		previouslyOpened,
    		language,
    		upperTimerText,
    		upperHourTypeText,
    		upperDateText,
    		lowerMonthYearText,
    		now,
    		dateGrid,
    		updateDates,
    		updateTexts
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("previouslyOpened" in $$props) previouslyOpened = $$props.previouslyOpened;
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("upperTimerText" in $$props) $$invalidate(2, upperTimerText = $$props.upperTimerText);
    		if ("upperHourTypeText" in $$props) $$invalidate(3, upperHourTypeText = $$props.upperHourTypeText);
    		if ("upperDateText" in $$props) $$invalidate(4, upperDateText = $$props.upperDateText);
    		if ("lowerMonthYearText" in $$props) $$invalidate(5, lowerMonthYearText = $$props.lowerMonthYearText);
    		if ("now" in $$props) $$invalidate(6, now = $$props.now);
    		if ("dateGrid" in $$props) $$invalidate(7, dateGrid = $$props.dateGrid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		className,
    		language,
    		upperTimerText,
    		upperHourTypeText,
    		upperDateText,
    		lowerMonthYearText,
    		now,
    		dateGrid
    	];
    }

    class CalendarPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CalendarPanel",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/taskbar/DateControl.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/taskbar/DateControl.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let calendarpanel;
    	let current;
    	let mounted;
    	let dispose;
    	calendarpanel = new CalendarPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*timeText*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*dateText*/ ctx[1]);
    			t3 = space();
    			create_component(calendarpanel.$$.fragment);
    			attr_dev(div0, "class", "date-control-time svelte-16px9y3");
    			add_location(div0, file$6, 29, 8, 934);
    			attr_dev(div1, "class", "date-control-date svelte-16px9y3");
    			add_location(div1, file$6, 30, 8, 990);
    			attr_dev(div2, "class", "date-control svelte-16px9y3");
    			add_location(div2, file$6, 28, 4, 899);
    			attr_dev(button, "class", "svelte-16px9y3");
    			add_location(button, file$6, 27, 0, 867);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			mount_component(calendarpanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*timeText*/ 1) set_data_dev(t0, /*timeText*/ ctx[0]);
    			if (!current || dirty & /*dateText*/ 2) set_data_dev(t2, /*dateText*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendarpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendarpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			destroy_component(calendarpanel, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DateControl", slots, []);

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = data.name === "calendar" ? "" : "calendar";
    			return data;
    		});
    	}

    	let timeText = "";
    	let dateText = "";

    	function updateDateTime() {
    		let currDate = new Date();
    		let hour = currDate.getHours();
    		let minute = currDate.getMinutes();
    		let ampm = hour >= 12 ? "PM" : "AM";
    		hour = hour > 12 ? hour - 12 : hour;
    		let fullminute = minute < 10 ? "0" + minute : "" + minute;
    		let month = currDate.getMonth();
    		let dayOfMonth = currDate.getDate();
    		let year = currDate.getFullYear();
    		$$invalidate(0, timeText = `${hour}:${fullminute} ${ampm}`);
    		$$invalidate(1, dateText = `${month}/${dayOfMonth}/${year}`);
    	}

    	updateDateTime();
    	setInterval(updateDateTime, 1000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DateControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		CalendarPanel,
    		onClick,
    		timeText,
    		dateText,
    		updateDateTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("timeText" in $$props) $$invalidate(0, timeText = $$props.timeText);
    		if ("dateText" in $$props) $$invalidate(1, dateText = $$props.dateText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [timeText, dateText, onClick];
    }

    class DateControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateControl",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/taskbar/panels/NotificationPanel.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/taskbar/panels/NotificationPanel.svelte";

    function create_fragment$5(ctx) {
    	let div9;
    	let div0;
    	let t0_value = /*language*/ ctx[1].text.notificationPanel.noNewNotification + "";
    	let t0;
    	let t1;
    	let button0;
    	let div1;
    	let t2;
    	let div2;
    	let t3_value = /*language*/ ctx[1].text.notificationPanel.location + "";
    	let t3;
    	let t4;
    	let button1;
    	let div3;
    	let t5;
    	let div4;
    	let t6_value = /*language*/ ctx[1].text.notificationPanel.nightLight + "";
    	let t6;
    	let t7;
    	let button2;
    	let div5;
    	let t8;
    	let div6;
    	let t9_value = /*language*/ ctx[1].text.notificationPanel.screenSnip + "";
    	let t9;
    	let t10;
    	let button3;
    	let div7;
    	let t11;
    	let div8;
    	let t12_value = /*language*/ ctx[1].text.notificationPanel.network + "";
    	let t12;
    	let div9_class_value;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			button0 = element("button");
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			button1 = element("button");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			button2 = element("button");
    			div5 = element("div");
    			t8 = space();
    			div6 = element("div");
    			t9 = text(t9_value);
    			t10 = space();
    			button3 = element("button");
    			div7 = element("div");
    			t11 = space();
    			div8 = element("div");
    			t12 = text(t12_value);
    			attr_dev(div0, "class", "no-noti-message svelte-148e0m4");
    			add_location(div0, file$5, 20, 4, 610);
    			attr_dev(div1, "class", "location-icon svelte-148e0m4");
    			add_location(div1, file$5, 24, 8, 749);
    			attr_dev(div2, "class", "card-text svelte-148e0m4");
    			add_location(div2, file$5, 25, 8, 787);
    			attr_dev(button0, "class", "location svelte-148e0m4");
    			add_location(button0, file$5, 23, 4, 715);
    			attr_dev(div3, "class", "night-light-icon svelte-148e0m4");
    			add_location(div3, file$5, 28, 8, 914);
    			attr_dev(div4, "class", "card-text svelte-148e0m4");
    			add_location(div4, file$5, 29, 8, 955);
    			attr_dev(button1, "class", "night-light svelte-148e0m4");
    			add_location(button1, file$5, 27, 4, 877);
    			attr_dev(div5, "class", "screen-snip-icon svelte-148e0m4");
    			add_location(div5, file$5, 34, 8, 1106);
    			attr_dev(div6, "class", "card-text svelte-148e0m4");
    			add_location(div6, file$5, 35, 8, 1147);
    			attr_dev(button2, "class", "screen-snip svelte-148e0m4");
    			add_location(button2, file$5, 33, 4, 1069);
    			attr_dev(div7, "class", "network-icon svelte-148e0m4");
    			add_location(div7, file$5, 40, 8, 1294);
    			attr_dev(div8, "class", "card-text svelte-148e0m4");
    			add_location(div8, file$5, 41, 8, 1331);
    			attr_dev(button3, "class", "network svelte-148e0m4");
    			add_location(button3, file$5, 39, 4, 1261);
    			attr_dev(div9, "class", div9_class_value = "notification-panel " + /*className*/ ctx[0] + " svelte-148e0m4");
    			set_style(div9, "visibility", "hidden");
    			add_location(div9, file$5, 19, 0, 533);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div0, t0);
    			append_dev(div9, t1);
    			append_dev(div9, button0);
    			append_dev(button0, div1);
    			append_dev(button0, t2);
    			append_dev(button0, div2);
    			append_dev(div2, t3);
    			append_dev(div9, t4);
    			append_dev(div9, button1);
    			append_dev(button1, div3);
    			append_dev(button1, t5);
    			append_dev(button1, div4);
    			append_dev(div4, t6);
    			append_dev(div9, t7);
    			append_dev(div9, button2);
    			append_dev(button2, div5);
    			append_dev(button2, t8);
    			append_dev(button2, div6);
    			append_dev(div6, t9);
    			append_dev(div9, t10);
    			append_dev(div9, button3);
    			append_dev(button3, div7);
    			append_dev(button3, t11);
    			append_dev(button3, div8);
    			append_dev(div8, t12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*language*/ 2 && t0_value !== (t0_value = /*language*/ ctx[1].text.notificationPanel.noNewNotification + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*language*/ 2 && t3_value !== (t3_value = /*language*/ ctx[1].text.notificationPanel.location + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*language*/ 2 && t6_value !== (t6_value = /*language*/ ctx[1].text.notificationPanel.nightLight + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*language*/ 2 && t9_value !== (t9_value = /*language*/ ctx[1].text.notificationPanel.screenSnip + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*language*/ 2 && t12_value !== (t12_value = /*language*/ ctx[1].text.notificationPanel.network + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*className*/ 1 && div9_class_value !== (div9_class_value = "notification-panel " + /*className*/ ctx[0] + " svelte-148e0m4")) {
    				attr_dev(div9, "class", div9_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotificationPanel", slots, []);
    	let className = "";
    	let previouslyOpened = false;

    	ChosenPanel.subscribe(data => {
    		if (data.name === "notification") {
    			$$invalidate(0, className = "panel-open");
    			previouslyOpened = true;
    			return;
    		}

    		$$invalidate(0, className = previouslyOpened ? "panel-close" : "");
    	});

    	let language = get_store_value(Language);

    	Language.subscribe(data => {
    		$$invalidate(1, language = data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotificationPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		ChosenLanguage: Language,
    		get: get_store_value,
    		className,
    		previouslyOpened,
    		language
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("previouslyOpened" in $$props) previouslyOpened = $$props.previouslyOpened;
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className, language];
    }

    class NotificationPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationPanel",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/taskbar/NotificationCenter.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/taskbar/NotificationCenter.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let t;
    	let notificationpanel;
    	let current;
    	let mounted;
    	let dispose;
    	notificationpanel = new NotificationPanel({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = space();
    			create_component(notificationpanel.$$.fragment);
    			attr_dev(button, "class", "svelte-1rmwgfo");
    			add_location(button, file$4, 10, 0, 296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(notificationpanel, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notificationpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notificationpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t);
    			destroy_component(notificationpanel, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotificationCenter", slots, []);

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = data.name === "notification" ? "" : "notification";
    			return data;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotificationCenter> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ChosenPanel, NotificationPanel, onClick });
    	return [onClick];
    }

    class NotificationCenter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationCenter",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/taskbar/DesktopCorner.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/taskbar/DesktopCorner.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "svelte-1r9mxab");
    			add_location(button, file$3, 9, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DesktopCorner", slots, []);

    	function onClick() {
    		ChosenPanel.update(data => {
    			data.name = "";
    			return data;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DesktopCorner> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ChosenPanel, onClick });
    	return [onClick];
    }

    class DesktopCorner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DesktopCorner",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const TaskbarItems = writable([
        {
            windowId: "file-explorer",
            pinned: true,
            icon: "./vectors/icons8-folder.svg",
        },
        {
            windowId: "edge-browser",
            pinned: true,
            icon: "./vectors/icons8-microsoft-edge.svg",
        },
    ]);

    /* src/components/taskbar/Taskbar.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/components/taskbar/Taskbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (18:4) {#each taskbarItems as taskbarItem, i}
    function create_each_block(ctx) {
    	let taskbaritem;
    	let current;

    	taskbaritem = new TaskbarItem({
    			props: {
    				itemPosition: /*i*/ ctx[3],
    				iconPath: /*taskbarItem*/ ctx[1].icon
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(taskbaritem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(taskbaritem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const taskbaritem_changes = {};
    			if (dirty & /*taskbarItems*/ 1) taskbaritem_changes.iconPath = /*taskbarItem*/ ctx[1].icon;
    			taskbaritem.$set(taskbaritem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(taskbaritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(taskbaritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(taskbaritem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:4) {#each taskbarItems as taskbarItem, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let startbutton;
    	let t0;
    	let t1;
    	let systemtray;
    	let t2;
    	let languagepicker;
    	let t3;
    	let datecontrol;
    	let t4;
    	let notificationcenter;
    	let t5;
    	let desktopcorner;
    	let current;
    	startbutton = new StartButton({ $$inline: true });
    	let each_value = /*taskbarItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	systemtray = new SystemTray({ $$inline: true });
    	languagepicker = new LanguagePicker({ $$inline: true });
    	datecontrol = new DateControl({ $$inline: true });
    	notificationcenter = new NotificationCenter({ $$inline: true });
    	desktopcorner = new DesktopCorner({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(startbutton.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(systemtray.$$.fragment);
    			t2 = space();
    			create_component(languagepicker.$$.fragment);
    			t3 = space();
    			create_component(datecontrol.$$.fragment);
    			t4 = space();
    			create_component(notificationcenter.$$.fragment);
    			t5 = space();
    			create_component(desktopcorner.$$.fragment);
    			attr_dev(div, "class", "taskbar svelte-ahfudz");
    			add_location(div, file$2, 15, 0, 568);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(startbutton, div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			mount_component(systemtray, div, null);
    			append_dev(div, t2);
    			mount_component(languagepicker, div, null);
    			append_dev(div, t3);
    			mount_component(datecontrol, div, null);
    			append_dev(div, t4);
    			mount_component(notificationcenter, div, null);
    			append_dev(div, t5);
    			mount_component(desktopcorner, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*taskbarItems*/ 1) {
    				each_value = /*taskbarItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startbutton.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(systemtray.$$.fragment, local);
    			transition_in(languagepicker.$$.fragment, local);
    			transition_in(datecontrol.$$.fragment, local);
    			transition_in(notificationcenter.$$.fragment, local);
    			transition_in(desktopcorner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startbutton.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(systemtray.$$.fragment, local);
    			transition_out(languagepicker.$$.fragment, local);
    			transition_out(datecontrol.$$.fragment, local);
    			transition_out(notificationcenter.$$.fragment, local);
    			transition_out(desktopcorner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(startbutton);
    			destroy_each(each_blocks, detaching);
    			destroy_component(systemtray);
    			destroy_component(languagepicker);
    			destroy_component(datecontrol);
    			destroy_component(notificationcenter);
    			destroy_component(desktopcorner);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Taskbar", slots, []);
    	let taskbarItems = get_store_value(TaskbarItems);

    	TaskbarItems.subscribe(data => {
    		$$invalidate(0, taskbarItems = data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Taskbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		StartButton,
    		TaskbarItem,
    		SystemTray,
    		LanguagePicker,
    		DateControl,
    		NotificationCenter,
    		DesktopCorner,
    		TaskbarItems,
    		get: get_store_value,
    		taskbarItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("taskbarItems" in $$props) $$invalidate(0, taskbarItems = $$props.taskbarItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taskbarItems];
    }

    class Taskbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Taskbar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/window/Base.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/components/window/Base.svelte";

    function create_fragment$1(ctx) {
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p;
    	let t1;
    	let t2;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let button2;
    	let t5;
    	let div2;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text(/*title*/ ctx[1]);
    			t2 = space();
    			button0 = element("button");
    			t3 = space();
    			button1 = element("button");
    			t4 = space();
    			button2 = element("button");
    			t5 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			if (img.src !== (img_src_value = /*icon*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-jeehci");
    			add_location(img, file$1, 54, 8, 1742);
    			attr_dev(p, "class", "svelte-jeehci");
    			add_location(p, file$1, 56, 12, 1841);
    			attr_dev(div0, "class", "title-text-container svelte-jeehci");
    			add_location(div0, file$1, 55, 8, 1794);
    			attr_dev(button0, "class", "btn-minimize svelte-jeehci");
    			add_location(button0, file$1, 58, 8, 1879);
    			attr_dev(button1, "class", "btn-expand svelte-jeehci");
    			add_location(button1, file$1, 59, 8, 1946);
    			attr_dev(button2, "class", "btn-close svelte-jeehci");
    			add_location(button2, file$1, 60, 8, 2011);
    			attr_dev(div1, "class", "title-bar svelte-jeehci");
    			add_location(div1, file$1, 53, 4, 1678);
    			attr_dev(div2, "class", "form-body svelte-jeehci");
    			add_location(div2, file$1, 62, 4, 2079);
    			attr_dev(div3, "class", div3_class_value = "form " + /*formClass*/ ctx[6] + " svelte-jeehci");
    			set_style(div3, "--top", /*topPx*/ ctx[5] + "px");
    			set_style(div3, "--left", /*leftPx*/ ctx[4] + "px");
    			set_style(div3, "--width", /*widthPx*/ ctx[7] + "px");
    			set_style(div3, "--height", /*heightPx*/ ctx[8] + "px");
    			set_style(div3, "--taskbar-index", /*taskbarIndex*/ ctx[2] + 1);
    			add_location(div3, file$1, 46, 0, 1444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(div1, t4);
    			append_dev(div1, button2);
    			append_dev(div3, t5);
    			append_dev(div3, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			/*div3_binding*/ ctx[21](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousemove", /*onTitleMouseMove*/ ctx[11], false, false, false),
    					listen_dev(window, "mouseup", /*onTitleMouseUp*/ ctx[10], false, false, false),
    					listen_dev(button0, "click", /*onMinimizeClick*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*onMaximizeClick*/ ctx[13], false, false, false),
    					listen_dev(button2, "click", /*onCloseClick*/ ctx[14], false, false, false),
    					listen_dev(div1, "mousedown", /*onTitleMouseDown*/ ctx[9], false, false, false),
    					listen_dev(div3, "dblclick", /*onMaximizeClick*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*icon*/ 1 && img.src !== (img_src_value = /*icon*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*formClass*/ 64 && div3_class_value !== (div3_class_value = "form " + /*formClass*/ ctx[6] + " svelte-jeehci")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*topPx*/ 32) {
    				set_style(div3, "--top", /*topPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty & /*leftPx*/ 16) {
    				set_style(div3, "--left", /*leftPx*/ ctx[4] + "px");
    			}

    			if (!current || dirty & /*taskbarIndex*/ 4) {
    				set_style(div3, "--taskbar-index", /*taskbarIndex*/ ctx[2] + 1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			/*div3_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Base", slots, ['default']);
    	let { width = "50vw" } = $$props;
    	let { height = "50vh" } = $$props;
    	let { left = "25vw" } = $$props;
    	let { top = "10vh" } = $$props;
    	let { icon = "./vectors/email.svg" } = $$props;
    	let { title = "Title" } = $$props;
    	let { taskbarIndex = 0 } = $$props;
    	let nodeRef;
    	let widthPx = +width.replace("vw", "") * document.documentElement.clientWidth / 100;
    	let heightPx = +height.replace("vh", "") * document.documentElement.clientHeight / 100;
    	let leftPx = +left.replace("vw", "") * document.documentElement.clientWidth / 100;
    	let topPx = +top.replace("vh", "") * document.documentElement.clientHeight / 100;
    	let moving = false;
    	let maximized = false;
    	let formClass = "";

    	function onTitleMouseDown() {
    		moving = true;
    	}

    	function onTitleMouseUp() {
    		moving = false;
    	}

    	function onTitleMouseMove(e) {
    		if (moving && !maximized) {
    			$$invalidate(4, leftPx += e.movementX);
    			$$invalidate(5, topPx += e.movementY);
    			$$invalidate(4, leftPx = Math.max(leftPx, -widthPx * 0.95));
    			$$invalidate(4, leftPx = Math.min(leftPx, document.documentElement.clientWidth * 0.95));
    			$$invalidate(5, topPx = Math.max(topPx, 0));
    			$$invalidate(5, topPx = Math.min(topPx, document.documentElement.clientHeight * 0.95));
    		}
    	}

    	function onMinimizeClick() {
    		$$invalidate(6, formClass = "form-minimize");
    	}

    	function onMaximizeClick() {
    		$$invalidate(6, formClass = maximized ? "form-shrink" : "form-maximize");
    		maximized = !maximized;
    	}

    	function onCloseClick() {
    		if (nodeRef.parentNode != null) {
    			nodeRef.parentNode.removeChild(nodeRef);
    		}
    	}

    	const writable_props = ["width", "height", "left", "top", "icon", "title", "taskbarIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Base> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			nodeRef = $$value;
    			$$invalidate(3, nodeRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(15, width = $$props.width);
    		if ("height" in $$props) $$invalidate(16, height = $$props.height);
    		if ("left" in $$props) $$invalidate(17, left = $$props.left);
    		if ("top" in $$props) $$invalidate(18, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("taskbarIndex" in $$props) $$invalidate(2, taskbarIndex = $$props.taskbarIndex);
    		if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		width,
    		height,
    		left,
    		top,
    		icon,
    		title,
    		taskbarIndex,
    		nodeRef,
    		widthPx,
    		heightPx,
    		leftPx,
    		topPx,
    		moving,
    		maximized,
    		formClass,
    		onTitleMouseDown,
    		onTitleMouseUp,
    		onTitleMouseMove,
    		onMinimizeClick,
    		onMaximizeClick,
    		onCloseClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(15, width = $$props.width);
    		if ("height" in $$props) $$invalidate(16, height = $$props.height);
    		if ("left" in $$props) $$invalidate(17, left = $$props.left);
    		if ("top" in $$props) $$invalidate(18, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("taskbarIndex" in $$props) $$invalidate(2, taskbarIndex = $$props.taskbarIndex);
    		if ("nodeRef" in $$props) $$invalidate(3, nodeRef = $$props.nodeRef);
    		if ("widthPx" in $$props) $$invalidate(7, widthPx = $$props.widthPx);
    		if ("heightPx" in $$props) $$invalidate(8, heightPx = $$props.heightPx);
    		if ("leftPx" in $$props) $$invalidate(4, leftPx = $$props.leftPx);
    		if ("topPx" in $$props) $$invalidate(5, topPx = $$props.topPx);
    		if ("moving" in $$props) moving = $$props.moving;
    		if ("maximized" in $$props) maximized = $$props.maximized;
    		if ("formClass" in $$props) $$invalidate(6, formClass = $$props.formClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		icon,
    		title,
    		taskbarIndex,
    		nodeRef,
    		leftPx,
    		topPx,
    		formClass,
    		widthPx,
    		heightPx,
    		onTitleMouseDown,
    		onTitleMouseUp,
    		onTitleMouseMove,
    		onMinimizeClick,
    		onMaximizeClick,
    		onCloseClick,
    		width,
    		height,
    		left,
    		top,
    		$$scope,
    		slots,
    		div3_binding
    	];
    }

    class Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			width: 15,
    			height: 16,
    			left: 17,
    			top: 18,
    			icon: 0,
    			title: 1,
    			taskbarIndex: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Base",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get width() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get taskbarIndex() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taskbarIndex(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let t0;
    	let taskbar;
    	let t1;
    	let window;
    	let current;
    	taskbar = new Taskbar({ $$inline: true });
    	window = new Base({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t0 = space();
    			create_component(taskbar.$$.fragment);
    			t1 = space();
    			create_component(window.$$.fragment);
    			attr_dev(div, "class", "background svelte-enufsi");
    			add_location(div, file, 5, 4, 153);
    			add_location(main, file, 4, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(main, t0);
    			mount_component(taskbar, main, null);
    			append_dev(main, t1);
    			mount_component(window, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(taskbar.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(taskbar.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(taskbar);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Taskbar, Window: Base });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        // props: {
        // 	name: 'world'
        // }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
