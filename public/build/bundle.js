
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
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
    			attr_dev(img0, "draggable", "false");
    			attr_dev(img0, "class", "svelte-jv6rbt");
    			add_location(img0, file$d, 38, 4, 938);
    			if (img1.src !== (img1_src_value = "./vectors/icons8-windows-10-start-active.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "visibility", /*activeVisibility*/ ctx[0]);
    			attr_dev(img1, "draggable", "false");
    			attr_dev(img1, "class", "svelte-jv6rbt");
    			add_location(img1, file$d, 44, 4, 1096);
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

    /* src/components/taskbar/panels/SystemTrayPanel.svelte generated by Svelte v3.38.2 */
    const file$c = "src/components/taskbar/panels/SystemTrayPanel.svelte";

    function create_fragment$c(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "system-tray-panel svelte-dips6g");
    			set_style(div, "--visibility", /*visibility*/ ctx[0]);
    			add_location(div, file$c, 11, 0, 255);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTrayPanel",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/taskbar/SystemTray.svelte generated by Svelte v3.38.2 */
    const file$b = "src/components/taskbar/SystemTray.svelte";

    function create_fragment$b(ctx) {
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
    			add_location(button, file$b, 10, 0, 288);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTray",
    			options,
    			id: create_fragment$b.name
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
    const file$a = "src/components/taskbar/panels/LanguagePickerPanel.svelte";

    function create_fragment$a(ctx) {
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
    			add_location(div0, file$a, 59, 8, 1590);
    			add_location(br0, file$a, 61, 35, 1727);
    			attr_dev(div1, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div1, file$a, 60, 8, 1649);
    			attr_dev(button0, "class", button0_class_value = "language-picker-option-EN " + /*engClass*/ ctx[1] + " svelte-134k3sl");
    			add_location(button0, file$a, 58, 4, 1506);
    			attr_dev(div2, "class", "language-picker-option-left svelte-134k3sl");
    			add_location(div2, file$a, 65, 8, 1862);
    			add_location(br1, file$a, 67, 21, 1985);
    			attr_dev(div3, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div3, file$a, 66, 8, 1921);
    			attr_dev(button1, "class", button1_class_value = "language-picker-option-MN " + /*monClass*/ ctx[2] + " svelte-134k3sl");
    			add_location(button1, file$a, 64, 4, 1778);
    			attr_dev(div4, "class", div4_class_value = "language-picker-panel " + /*className*/ ctx[0] + " svelte-134k3sl");
    			set_style(div4, "visibility", "hidden");
    			add_location(div4, file$a, 57, 0, 1426);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePickerPanel",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/taskbar/LanguagePicker.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/components/taskbar/LanguagePicker.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(p, file$9, 25, 4, 644);
    			attr_dev(button, "class", "svelte-12zm8z3");
    			add_location(button, file$9, 24, 0, 612);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePicker",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/taskbar/panels/CalendarPanel.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/components/taskbar/panels/CalendarPanel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (98:24) {:else}
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
    			add_location(button, file$8, 98, 28, 3533);
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
    		source: "(98:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}
    function create_if_block$1(ctx) {
    	let button;
    	let t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "color", "white");
    			attr_dev(button, "class", "svelte-6a8ex9");
    			add_location(button, file$8, 94, 28, 3345);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(94:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}",
    		ctx
    	});

    	return block;
    }

    // (93:20) {#each [...Array(6).keys()] as j}
    function create_each_block_1(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*dateGrid, now*/ 192) show_if = !!(/*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getMonth() == /*now*/ ctx[6].getMonth());
    		if (show_if) return create_if_block$1;
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
    		source: "(93:20) {#each [...Array(6).keys()] as j}",
    		ctx
    	});

    	return block;
    }

    // (91:12) {#each [...Array(7).keys()] as i}
    function create_each_block(ctx) {
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
    			add_location(div, file$8, 91, 16, 3183);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(91:12) {#each [...Array(7).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
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
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			add_location(div0, file$8, 67, 12, 2248);
    			attr_dev(div1, "class", "upper-time svelte-6a8ex9");
    			add_location(div1, file$8, 66, 8, 2211);
    			attr_dev(div2, "class", "svelte-6a8ex9");
    			add_location(div2, file$8, 70, 12, 2341);
    			attr_dev(div3, "class", "upper-hour-type svelte-6a8ex9");
    			add_location(div3, file$8, 69, 8, 2299);
    			attr_dev(div4, "class", "svelte-6a8ex9");
    			add_location(div4, file$8, 73, 12, 2432);
    			attr_dev(div5, "class", "upper-date svelte-6a8ex9");
    			add_location(div5, file$8, 72, 8, 2395);
    			attr_dev(div6, "class", "upper svelte-6a8ex9");
    			add_location(div6, file$8, 65, 4, 2183);
    			attr_dev(div7, "class", "svelte-6a8ex9");
    			add_location(div7, file$8, 78, 12, 2560);
    			attr_dev(div8, "class", "lower-month-year svelte-6a8ex9");
    			add_location(div8, file$8, 77, 8, 2517);
    			attr_dev(div9, "class", "svelte-6a8ex9");
    			add_location(div9, file$8, 81, 12, 2657);
    			attr_dev(div10, "class", "svelte-6a8ex9");
    			add_location(div10, file$8, 82, 12, 2717);
    			attr_dev(div11, "class", "svelte-6a8ex9");
    			add_location(div11, file$8, 83, 12, 2777);
    			attr_dev(div12, "class", "svelte-6a8ex9");
    			add_location(div12, file$8, 84, 12, 2838);
    			attr_dev(div13, "class", "svelte-6a8ex9");
    			add_location(div13, file$8, 85, 12, 2901);
    			attr_dev(div14, "class", "svelte-6a8ex9");
    			add_location(div14, file$8, 86, 12, 2963);
    			attr_dev(div15, "class", "svelte-6a8ex9");
    			add_location(div15, file$8, 87, 12, 3023);
    			attr_dev(div16, "class", "lower-week-days svelte-6a8ex9");
    			add_location(div16, file$8, 80, 8, 2615);
    			attr_dev(div17, "class", "lower-days svelte-6a8ex9");
    			add_location(div17, file$8, 89, 8, 3096);
    			attr_dev(div18, "class", "lower svelte-6a8ex9");
    			add_location(div18, file$8, 76, 4, 2489);
    			attr_dev(div19, "class", div19_class_value = "calendar " + /*className*/ ctx[0] + " svelte-6a8ex9");
    			set_style(div19, "visibility", "hidden");
    			add_location(div19, file$8, 64, 0, 2116);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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

    	setInterval(updateTexts, 100);
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CalendarPanel",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/taskbar/DateControl.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/components/taskbar/DateControl.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(div0, file$7, 29, 8, 934);
    			attr_dev(div1, "class", "date-control-date svelte-16px9y3");
    			add_location(div1, file$7, 30, 8, 990);
    			attr_dev(div2, "class", "date-control svelte-16px9y3");
    			add_location(div2, file$7, 28, 4, 899);
    			attr_dev(button, "class", "svelte-16px9y3");
    			add_location(button, file$7, 27, 0, 867);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateControl",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/taskbar/panels/NotificationPanel.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/taskbar/panels/NotificationPanel.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(div0, file$6, 20, 4, 610);
    			attr_dev(div1, "class", "location-icon svelte-148e0m4");
    			add_location(div1, file$6, 24, 8, 749);
    			attr_dev(div2, "class", "card-text svelte-148e0m4");
    			add_location(div2, file$6, 25, 8, 787);
    			attr_dev(button0, "class", "location svelte-148e0m4");
    			add_location(button0, file$6, 23, 4, 715);
    			attr_dev(div3, "class", "night-light-icon svelte-148e0m4");
    			add_location(div3, file$6, 28, 8, 914);
    			attr_dev(div4, "class", "card-text svelte-148e0m4");
    			add_location(div4, file$6, 29, 8, 955);
    			attr_dev(button1, "class", "night-light svelte-148e0m4");
    			add_location(button1, file$6, 27, 4, 877);
    			attr_dev(div5, "class", "screen-snip-icon svelte-148e0m4");
    			add_location(div5, file$6, 34, 8, 1106);
    			attr_dev(div6, "class", "card-text svelte-148e0m4");
    			add_location(div6, file$6, 35, 8, 1147);
    			attr_dev(button2, "class", "screen-snip svelte-148e0m4");
    			add_location(button2, file$6, 33, 4, 1069);
    			attr_dev(div7, "class", "network-icon svelte-148e0m4");
    			add_location(div7, file$6, 40, 8, 1294);
    			attr_dev(div8, "class", "card-text svelte-148e0m4");
    			add_location(div8, file$6, 41, 8, 1331);
    			attr_dev(button3, "class", "network svelte-148e0m4");
    			add_location(button3, file$6, 39, 4, 1261);
    			attr_dev(div9, "class", div9_class_value = "notification-panel " + /*className*/ ctx[0] + " svelte-148e0m4");
    			set_style(div9, "visibility", "hidden");
    			add_location(div9, file$6, 19, 0, 533);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationPanel",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/taskbar/NotificationCenter.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/taskbar/NotificationCenter.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(button, file$5, 10, 0, 296);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationCenter",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/taskbar/DesktopCorner.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/taskbar/DesktopCorner.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "svelte-1r9mxab");
    			add_location(button, file$4, 9, 0, 181);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DesktopCorner",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/taskbar/Taskbar.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/taskbar/Taskbar.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let startbutton;
    	let t0;
    	let systemtray;
    	let t1;
    	let languagepicker;
    	let t2;
    	let datecontrol;
    	let t3;
    	let notificationcenter;
    	let t4;
    	let desktopcorner;
    	let current;
    	startbutton = new StartButton({ $$inline: true });
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
    			create_component(systemtray.$$.fragment);
    			t1 = space();
    			create_component(languagepicker.$$.fragment);
    			t2 = space();
    			create_component(datecontrol.$$.fragment);
    			t3 = space();
    			create_component(notificationcenter.$$.fragment);
    			t4 = space();
    			create_component(desktopcorner.$$.fragment);
    			attr_dev(div, "class", "taskbar svelte-ahfudz");
    			add_location(div, file$3, 8, 0, 339);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(startbutton, div, null);
    			append_dev(div, t0);
    			mount_component(systemtray, div, null);
    			append_dev(div, t1);
    			mount_component(languagepicker, div, null);
    			append_dev(div, t2);
    			mount_component(datecontrol, div, null);
    			append_dev(div, t3);
    			mount_component(notificationcenter, div, null);
    			append_dev(div, t4);
    			mount_component(desktopcorner, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startbutton.$$.fragment, local);
    			transition_in(systemtray.$$.fragment, local);
    			transition_in(languagepicker.$$.fragment, local);
    			transition_in(datecontrol.$$.fragment, local);
    			transition_in(notificationcenter.$$.fragment, local);
    			transition_in(desktopcorner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startbutton.$$.fragment, local);
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
    			destroy_component(systemtray);
    			destroy_component(languagepicker);
    			destroy_component(datecontrol);
    			destroy_component(notificationcenter);
    			destroy_component(desktopcorner);
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
    	validate_slots("Taskbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Taskbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		StartButton,
    		SystemTray,
    		LanguagePicker,
    		DateControl,
    		NotificationCenter,
    		DesktopCorner
    	});

    	return [];
    }

    class Taskbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Taskbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    const TaskbarItemStates = {
        unopened: 1,
        opened: 2,
        focused: 3,
    };

    /* src/components/window/TaskbarItem.svelte generated by Svelte v3.38.2 */

    const file$2 = "src/components/window/TaskbarItem.svelte";

    function create_fragment$2(ctx) {
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
    			attr_dev(img, "class", "taskbar-icon svelte-1btagh");
    			add_location(img, file$2, 10, 4, 241);
    			attr_dev(div, "class", "svelte-1btagh");
    			add_location(div, file$2, 11, 4, 296);
    			attr_dev(button, "class", button_class_value = "taskbar-item " + /*className*/ ctx[2] + " svelte-1btagh");
    			set_style(button, "--item-position", /*itemPosition*/ ctx[0]);
    			add_location(button, file$2, 5, 0, 132);
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
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconPath*/ 2 && img.src !== (img_src_value = /*iconPath*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*className*/ 4 && button_class_value !== (button_class_value = "taskbar-item " + /*className*/ ctx[2] + " svelte-1btagh")) {
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TaskbarItem", slots, []);
    	let { itemPosition = 0 } = $$props;
    	let { iconPath = "" } = $$props;
    	let { className = "taskbar-item-unopened" } = $$props;
    	const writable_props = ["itemPosition", "iconPath", "className"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TaskbarItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("itemPosition" in $$props) $$invalidate(0, itemPosition = $$props.itemPosition);
    		if ("iconPath" in $$props) $$invalidate(1, iconPath = $$props.iconPath);
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    	};

    	$$self.$capture_state = () => ({ itemPosition, iconPath, className });

    	$$self.$inject_state = $$props => {
    		if ("itemPosition" in $$props) $$invalidate(0, itemPosition = $$props.itemPosition);
    		if ("iconPath" in $$props) $$invalidate(1, iconPath = $$props.iconPath);
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemPosition, iconPath, className, click_handler];
    }

    class TaskbarItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			itemPosition: 0,
    			iconPath: 1,
    			className: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskbarItem",
    			options,
    			id: create_fragment$2.name
    		});
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

    	get className() {
    		throw new Error("<TaskbarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<TaskbarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Windows = writable({});

    /* src/components/window/Base.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/components/window/Base.svelte";

    // (212:0) {#if visible}
    function create_if_block(ctx) {
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
    	let div1_class_value;
    	let t5;
    	let div2;
    	let div3_class_value;
    	let div3_transition;
    	let t6;
    	let div4;
    	let div4_class_value;
    	let t7;
    	let div5;
    	let div5_class_value;
    	let t8;
    	let div6;
    	let div6_class_value;
    	let t9;
    	let div7;
    	let div7_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[33], null);

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
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			div5 = element("div");
    			t8 = space();
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");
    			if (img.src !== (img_src_value = /*icon*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-mtpl92");
    			add_location(img, file$1, 224, 12, 6939);
    			attr_dev(p, "class", "svelte-mtpl92");
    			add_location(p, file$1, 226, 16, 7046);
    			attr_dev(div0, "class", "title-text-container svelte-mtpl92");
    			add_location(div0, file$1, 225, 12, 6995);
    			attr_dev(button0, "class", "btn-minimize svelte-mtpl92");
    			add_location(button0, file$1, 228, 12, 7092);
    			attr_dev(button1, "class", "btn-expand svelte-mtpl92");
    			add_location(button1, file$1, 229, 12, 7163);
    			attr_dev(button2, "class", "btn-close svelte-mtpl92");
    			add_location(button2, file$1, 230, 12, 7232);
    			attr_dev(div1, "class", div1_class_value = "title-bar " + /*titleBarClass*/ ctx[11] + " svelte-mtpl92");
    			add_location(div1, file$1, 219, 8, 6780);
    			attr_dev(div2, "class", "form-body svelte-mtpl92");
    			add_location(div2, file$1, 232, 8, 7308);
    			attr_dev(div3, "class", div3_class_value = "form " + /*formClass*/ ctx[9] + " svelte-mtpl92");
    			set_style(div3, "--top", /*topPx*/ ctx[8] + "px");
    			set_style(div3, "--left", /*leftPx*/ ctx[7] + "px");
    			set_style(div3, "--width", /*widthPx*/ ctx[5] + "px");
    			set_style(div3, "--height", /*heightPx*/ ctx[6] + "px");
    			set_style(div3, "--taskbar-index", /*itemPosition*/ ctx[2]);
    			set_style(div3, "z-index", /*zIndex*/ ctx[3]);
    			add_location(div3, file$1, 212, 4, 6477);
    			attr_dev(div4, "class", div4_class_value = "" + (/*borderClass*/ ctx[12] + " top-border" + " svelte-mtpl92"));
    			set_style(div4, "--top", /*topPx*/ ctx[8] + "px");
    			set_style(div4, "--left", /*leftPx*/ ctx[7] + "px");
    			set_style(div4, "--width", /*widthPx*/ ctx[5] + "px");
    			set_style(div4, "--height", /*heightPx*/ ctx[6] + "px");
    			set_style(div4, "z-index", /*zIndex*/ ctx[3]);
    			add_location(div4, file$1, 236, 4, 7383);
    			attr_dev(div5, "class", div5_class_value = "" + (/*borderClass*/ ctx[12] + " left-border" + " svelte-mtpl92"));
    			set_style(div5, "--top", /*topPx*/ ctx[8] + "px");
    			set_style(div5, "--left", /*leftPx*/ ctx[7] + "px");
    			set_style(div5, "--width", /*widthPx*/ ctx[5] + "px");
    			set_style(div5, "--height", /*heightPx*/ ctx[6] + "px");
    			set_style(div5, "z-index", /*zIndex*/ ctx[3]);
    			add_location(div5, file$1, 241, 4, 7593);
    			attr_dev(div6, "class", div6_class_value = "" + (/*borderClass*/ ctx[12] + " bottom-border" + " svelte-mtpl92"));
    			set_style(div6, "--top", /*topPx*/ ctx[8] + "px");
    			set_style(div6, "--left", /*leftPx*/ ctx[7] + "px");
    			set_style(div6, "--width", /*widthPx*/ ctx[5] + "px");
    			set_style(div6, "--height", /*heightPx*/ ctx[6] + "px");
    			set_style(div6, "z-index", /*zIndex*/ ctx[3]);
    			add_location(div6, file$1, 246, 4, 7805);
    			attr_dev(div7, "class", div7_class_value = "" + (/*borderClass*/ ctx[12] + " right-border" + " svelte-mtpl92"));
    			set_style(div7, "--top", /*topPx*/ ctx[8] + "px");
    			set_style(div7, "--left", /*leftPx*/ ctx[7] + "px");
    			set_style(div7, "--width", /*widthPx*/ ctx[5] + "px");
    			set_style(div7, "--height", /*heightPx*/ ctx[6] + "px");
    			set_style(div7, "z-index", /*zIndex*/ ctx[3]);
    			add_location(div7, file$1, 251, 4, 8021);
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

    			/*div3_binding*/ ctx[35](div3);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*onMinimizeClick*/ ctx[21], false, false, false),
    					listen_dev(button1, "click", /*onMaximizeClick*/ ctx[22], false, false, false),
    					listen_dev(button2, "click", /*onCloseClick*/ ctx[23], false, false, false),
    					listen_dev(div1, "mousedown", /*onTitleMouseDown*/ ctx[14], false, false, false),
    					listen_dev(div1, "dblclick", /*onMaximizeClick*/ ctx[22], false, false, false),
    					listen_dev(div3, "mousedown", /*takeFocus*/ ctx[24], false, false, false),
    					listen_dev(div4, "mousedown", /*onTopBorderDown*/ ctx[15], false, false, false),
    					listen_dev(div5, "mousedown", /*onLeftBorderDown*/ ctx[16], false, false, false),
    					listen_dev(div6, "mousedown", /*onBottomBorderDown*/ ctx[17], false, false, false),
    					listen_dev(div7, "mousedown", /*onRightBorderDown*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*icon*/ 1 && img.src !== (img_src_value = /*icon*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (!current || dirty[0] & /*titleBarClass*/ 2048 && div1_class_value !== (div1_class_value = "title-bar " + /*titleBarClass*/ ctx[11] + " svelte-mtpl92")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[33], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*formClass*/ 512 && div3_class_value !== (div3_class_value = "form " + /*formClass*/ ctx[9] + " svelte-mtpl92")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 256) {
    				set_style(div3, "--top", /*topPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 128) {
    				set_style(div3, "--left", /*leftPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 32) {
    				set_style(div3, "--width", /*widthPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 64) {
    				set_style(div3, "--height", /*heightPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*itemPosition*/ 4) {
    				set_style(div3, "--taskbar-index", /*itemPosition*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*zIndex*/ 8) {
    				set_style(div3, "z-index", /*zIndex*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*borderClass*/ 4096 && div4_class_value !== (div4_class_value = "" + (/*borderClass*/ ctx[12] + " top-border" + " svelte-mtpl92"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 256) {
    				set_style(div4, "--top", /*topPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 128) {
    				set_style(div4, "--left", /*leftPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 32) {
    				set_style(div4, "--width", /*widthPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 64) {
    				set_style(div4, "--height", /*heightPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 8) {
    				set_style(div4, "z-index", /*zIndex*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*borderClass*/ 4096 && div5_class_value !== (div5_class_value = "" + (/*borderClass*/ ctx[12] + " left-border" + " svelte-mtpl92"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 256) {
    				set_style(div5, "--top", /*topPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 128) {
    				set_style(div5, "--left", /*leftPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 32) {
    				set_style(div5, "--width", /*widthPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 64) {
    				set_style(div5, "--height", /*heightPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 8) {
    				set_style(div5, "z-index", /*zIndex*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*borderClass*/ 4096 && div6_class_value !== (div6_class_value = "" + (/*borderClass*/ ctx[12] + " bottom-border" + " svelte-mtpl92"))) {
    				attr_dev(div6, "class", div6_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 256) {
    				set_style(div6, "--top", /*topPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 128) {
    				set_style(div6, "--left", /*leftPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 32) {
    				set_style(div6, "--width", /*widthPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 64) {
    				set_style(div6, "--height", /*heightPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 8) {
    				set_style(div6, "z-index", /*zIndex*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*borderClass*/ 4096 && div7_class_value !== (div7_class_value = "" + (/*borderClass*/ ctx[12] + " right-border" + " svelte-mtpl92"))) {
    				attr_dev(div7, "class", div7_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 256) {
    				set_style(div7, "--top", /*topPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 128) {
    				set_style(div7, "--left", /*leftPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 32) {
    				set_style(div7, "--width", /*widthPx*/ ctx[5] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 64) {
    				set_style(div7, "--height", /*heightPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 8) {
    				set_style(div7, "z-index", /*zIndex*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			/*div3_binding*/ ctx[35](null);
    			if (detaching && div3_transition) div3_transition.end();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(212:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let taskbaritem;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*visible*/ ctx[10] && create_if_block(ctx);

    	taskbaritem = new TaskbarItem({
    			props: {
    				itemPosition: /*itemPosition*/ ctx[2],
    				iconPath: /*icon*/ ctx[0],
    				className: /*taskbarClass*/ ctx[13]
    			},
    			$$inline: true
    		});

    	taskbaritem.$on("click", /*onTaskbarItemClick*/ ctx[25]);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(taskbaritem.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(taskbaritem, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousemove", /*onMouseMove*/ ctx[20], false, false, false),
    					listen_dev(window, "mouseup", /*onMouseUp*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 1024) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const taskbaritem_changes = {};
    			if (dirty[0] & /*itemPosition*/ 4) taskbaritem_changes.itemPosition = /*itemPosition*/ ctx[2];
    			if (dirty[0] & /*icon*/ 1) taskbaritem_changes.iconPath = /*icon*/ ctx[0];
    			if (dirty[0] & /*taskbarClass*/ 8192) taskbaritem_changes.className = /*taskbarClass*/ ctx[13];
    			taskbaritem.$set(taskbaritem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(taskbaritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(taskbaritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(taskbaritem, detaching);
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
    	let { minWidth = "10vw" } = $$props;
    	let { minHeight = "15vh" } = $$props;
    	let { left = "25vw" } = $$props;
    	let { top = "10vh" } = $$props;
    	let { icon = "./vectors/email.svg" } = $$props;
    	let { title = "Title" } = $$props;
    	let { windowId = "" } = $$props;
    	let { itemPosition = 0 } = $$props;
    	let zIndex = 0;
    	let nodeRef;
    	let widthPx = +width.replace("vw", "") * document.documentElement.clientWidth / 100;
    	let heightPx = +height.replace("vh", "") * document.documentElement.clientHeight / 100;
    	let leftPx = +left.replace("vw", "") * document.documentElement.clientWidth / 100;
    	let topPx = +top.replace("vh", "") * document.documentElement.clientHeight / 100;
    	let minWidthPx = +minWidth.replace("vw", "") * document.documentElement.clientWidth / 100;
    	let minHeightPx = +minHeight.replace("vh", "") * document.documentElement.clientHeight / 100;
    	let moving = false;
    	let maximized = false;
    	let formClass = "";
    	let visible = false;
    	let titleBarClass = "title-bar-focused";
    	let borderClass = "title-bar-focused";
    	let taskbarItemState = TaskbarItemStates.unopened;
    	let taskbarClass = "taskbar-item-unopened";
    	const windowsStates = { minimized: 1, expanded: 2, maximized: 3 };
    	let state = windowsStates.expanded;

    	const pressPlaces = {
    		none: 0,
    		title: 1,
    		top: 2,
    		left: 3,
    		bottom: 4,
    		right: 5
    	};

    	let pressedPlace = pressPlaces.none;

    	function onTitleMouseDown() {
    		pressedPlace = pressPlaces.title;
    		moving = true;
    	}

    	function onTopBorderDown() {
    		pressedPlace = pressPlaces.top;
    		takeFocus();
    	}

    	function onLeftBorderDown() {
    		pressedPlace = pressPlaces.left;
    		takeFocus();
    	}

    	function onBottomBorderDown() {
    		pressedPlace = pressPlaces.bottom;
    		takeFocus();
    	}

    	function onRightBorderDown() {
    		pressedPlace = pressPlaces.right;
    		takeFocus();
    	}

    	function onMouseUp() {
    		pressedPlace = pressPlaces.none;
    		moving = false;
    	}

    	function onMouseMove(e) {
    		if (pressedPlace == pressPlaces.none) {
    			return;
    		} else if (pressedPlace == pressPlaces.title && moving && !maximized) {
    			$$invalidate(7, leftPx += e.movementX);
    			$$invalidate(8, topPx += e.movementY);
    			$$invalidate(7, leftPx = Math.max(leftPx, -widthPx * 0.95));
    			$$invalidate(7, leftPx = Math.min(leftPx, document.documentElement.clientWidth * 0.95));
    			$$invalidate(8, topPx = Math.max(topPx, 0));
    			$$invalidate(8, topPx = Math.min(topPx, document.documentElement.clientHeight * 0.95));
    		} else if (pressedPlace == pressPlaces.top) {
    			$$invalidate(6, heightPx -= e.movementY);
    			$$invalidate(6, heightPx = Math.max(minHeightPx, heightPx));
    			$$invalidate(8, topPx += heightPx == minHeightPx ? 0 : e.movementY);
    		} else if (pressedPlace == pressPlaces.left) {
    			$$invalidate(5, widthPx -= e.movementX);
    			$$invalidate(5, widthPx = Math.max(minWidthPx, widthPx));
    			$$invalidate(7, leftPx += widthPx == minWidthPx ? 0 : e.movementX);
    		} else if (pressedPlace == pressPlaces.bottom) {
    			$$invalidate(6, heightPx += e.movementY);
    			$$invalidate(6, heightPx = Math.max(minHeightPx, heightPx));
    		} else if (pressedPlace == pressPlaces.right) {
    			$$invalidate(5, widthPx += e.movementX);
    			$$invalidate(5, widthPx = Math.max(minWidthPx, widthPx));
    		}
    	}

    	function onMinimizeClick() {
    		$$invalidate(9, formClass = "form-minimize");
    		state = windowsStates.minimized;
    		taskbarItemState = TaskbarItemStates.opened;
    		$$invalidate(13, taskbarClass = "taskbar-item-opened");
    	}

    	function onMaximizeClick() {
    		$$invalidate(9, formClass = maximized ? "form-shrink" : "form-maximize");

    		state = maximized
    		? windowsStates.expanded
    		: windowsStates.maximized;

    		maximized = !maximized;
    	}

    	function onCloseClick() {
    		$$invalidate(10, visible = false);

    		setTimeout(
    			() => {
    				$$invalidate(9, formClass = "");
    				maximized = false;
    			},
    			100
    		);

    		Windows.update(windows => {
    			windows[windowId].taskbarItemState = TaskbarItemStates.unopened;
    			return windows;
    		});
    	}

    	function takeFocus() {
    		Windows.update(windows => {
    			let maxZ = -1;

    			for (let key in windows) {
    				maxZ = Math.max(maxZ, windows[key].zIndex);
    				windows[key].focused = false;

    				if (windows[key].taskbarItemState === TaskbarItemStates.focused) {
    					windows[key].taskbarItemState = TaskbarItemStates.opened;
    				}

    				if (zIndex < windows[key].zIndex) {
    					windows[key].zIndex--;
    				}
    			}

    			windows[windowId].focused = true;
    			windows[windowId].zIndex = maxZ;
    			windows[windowId].taskbarItemState = TaskbarItemStates.focused;
    			return windows;
    		});
    	}

    	function onTaskbarItemClick() {
    		switch (taskbarItemState) {
    			case TaskbarItemStates.unopened:
    				{
    					taskbarItemState = TaskbarItemStates.focused;
    					$$invalidate(13, taskbarClass = "taskbar-item-focused");
    					$$invalidate(10, visible = true);
    					takeFocus();
    					break;
    				}
    			case TaskbarItemStates.opened:
    				{
    					taskbarItemState = TaskbarItemStates.focused;
    					$$invalidate(13, taskbarClass = "taskbar-item-focused");

    					if (state == windowsStates.minimized) {
    						$$invalidate(9, formClass = "");
    					}

    					takeFocus();
    					break;
    				}
    			case TaskbarItemStates.focused:
    				{
    					onMinimizeClick();
    					break;
    				}
    		}
    	}

    	Windows.update(windows => {
    		for (let key in windows) {
    			if (key == windowId) continue;
    			windows[key].zIndex++;
    		}

    		windows[windowId] = {
    			focused: true,
    			zIndex: 0,
    			taskbarItemState: TaskbarItemStates.unopened
    		};

    		return windows;
    	});

    	Windows.subscribe(windows => {
    		if (!windows[windowId]) return;

    		$$invalidate(11, titleBarClass = windows[windowId].focused
    		? "title-bar-focused"
    		: "title-bar-unfocused");

    		$$invalidate(12, borderClass = windows[windowId].focused
    		? "window-border-focused"
    		: "window-border-unfocused");

    		$$invalidate(3, zIndex = windows[windowId].zIndex);
    		taskbarItemState = windows[windowId].taskbarItemState;

    		switch (taskbarItemState) {
    			case TaskbarItemStates.unopened:
    				{
    					$$invalidate(13, taskbarClass = "taskbar-item-unopened");
    					break;
    				}
    			case TaskbarItemStates.opened:
    				{
    					$$invalidate(13, taskbarClass = "taskbar-item-opened");
    					break;
    				}
    			case TaskbarItemStates.focused:
    				{
    					$$invalidate(13, taskbarClass = "taskbar-item-focused");
    					break;
    				}
    		}
    	});

    	const writable_props = [
    		"width",
    		"height",
    		"minWidth",
    		"minHeight",
    		"left",
    		"top",
    		"icon",
    		"title",
    		"windowId",
    		"itemPosition"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Base> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			nodeRef = $$value;
    			$$invalidate(4, nodeRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(26, width = $$props.width);
    		if ("height" in $$props) $$invalidate(27, height = $$props.height);
    		if ("minWidth" in $$props) $$invalidate(28, minWidth = $$props.minWidth);
    		if ("minHeight" in $$props) $$invalidate(29, minHeight = $$props.minHeight);
    		if ("left" in $$props) $$invalidate(30, left = $$props.left);
    		if ("top" in $$props) $$invalidate(31, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("windowId" in $$props) $$invalidate(32, windowId = $$props.windowId);
    		if ("itemPosition" in $$props) $$invalidate(2, itemPosition = $$props.itemPosition);
    		if ("$$scope" in $$props) $$invalidate(33, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		TaskbarItemStates,
    		TaskbarItem,
    		Windows,
    		width,
    		height,
    		minWidth,
    		minHeight,
    		left,
    		top,
    		icon,
    		title,
    		windowId,
    		itemPosition,
    		zIndex,
    		nodeRef,
    		widthPx,
    		heightPx,
    		leftPx,
    		topPx,
    		minWidthPx,
    		minHeightPx,
    		moving,
    		maximized,
    		formClass,
    		visible,
    		titleBarClass,
    		borderClass,
    		taskbarItemState,
    		taskbarClass,
    		windowsStates,
    		state,
    		pressPlaces,
    		pressedPlace,
    		onTitleMouseDown,
    		onTopBorderDown,
    		onLeftBorderDown,
    		onBottomBorderDown,
    		onRightBorderDown,
    		onMouseUp,
    		onMouseMove,
    		onMinimizeClick,
    		onMaximizeClick,
    		onCloseClick,
    		takeFocus,
    		onTaskbarItemClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(26, width = $$props.width);
    		if ("height" in $$props) $$invalidate(27, height = $$props.height);
    		if ("minWidth" in $$props) $$invalidate(28, minWidth = $$props.minWidth);
    		if ("minHeight" in $$props) $$invalidate(29, minHeight = $$props.minHeight);
    		if ("left" in $$props) $$invalidate(30, left = $$props.left);
    		if ("top" in $$props) $$invalidate(31, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("windowId" in $$props) $$invalidate(32, windowId = $$props.windowId);
    		if ("itemPosition" in $$props) $$invalidate(2, itemPosition = $$props.itemPosition);
    		if ("zIndex" in $$props) $$invalidate(3, zIndex = $$props.zIndex);
    		if ("nodeRef" in $$props) $$invalidate(4, nodeRef = $$props.nodeRef);
    		if ("widthPx" in $$props) $$invalidate(5, widthPx = $$props.widthPx);
    		if ("heightPx" in $$props) $$invalidate(6, heightPx = $$props.heightPx);
    		if ("leftPx" in $$props) $$invalidate(7, leftPx = $$props.leftPx);
    		if ("topPx" in $$props) $$invalidate(8, topPx = $$props.topPx);
    		if ("minWidthPx" in $$props) minWidthPx = $$props.minWidthPx;
    		if ("minHeightPx" in $$props) minHeightPx = $$props.minHeightPx;
    		if ("moving" in $$props) moving = $$props.moving;
    		if ("maximized" in $$props) maximized = $$props.maximized;
    		if ("formClass" in $$props) $$invalidate(9, formClass = $$props.formClass);
    		if ("visible" in $$props) $$invalidate(10, visible = $$props.visible);
    		if ("titleBarClass" in $$props) $$invalidate(11, titleBarClass = $$props.titleBarClass);
    		if ("borderClass" in $$props) $$invalidate(12, borderClass = $$props.borderClass);
    		if ("taskbarItemState" in $$props) taskbarItemState = $$props.taskbarItemState;
    		if ("taskbarClass" in $$props) $$invalidate(13, taskbarClass = $$props.taskbarClass);
    		if ("state" in $$props) state = $$props.state;
    		if ("pressedPlace" in $$props) pressedPlace = $$props.pressedPlace;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		icon,
    		title,
    		itemPosition,
    		zIndex,
    		nodeRef,
    		widthPx,
    		heightPx,
    		leftPx,
    		topPx,
    		formClass,
    		visible,
    		titleBarClass,
    		borderClass,
    		taskbarClass,
    		onTitleMouseDown,
    		onTopBorderDown,
    		onLeftBorderDown,
    		onBottomBorderDown,
    		onRightBorderDown,
    		onMouseUp,
    		onMouseMove,
    		onMinimizeClick,
    		onMaximizeClick,
    		onCloseClick,
    		takeFocus,
    		onTaskbarItemClick,
    		width,
    		height,
    		minWidth,
    		minHeight,
    		left,
    		top,
    		windowId,
    		$$scope,
    		slots,
    		div3_binding
    	];
    }

    class Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				width: 26,
    				height: 27,
    				minWidth: 28,
    				minHeight: 29,
    				left: 30,
    				top: 31,
    				icon: 0,
    				title: 1,
    				windowId: 32,
    				itemPosition: 2
    			},
    			[-1, -1]
    		);

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

    	get minWidth() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minHeight() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minHeight(value) {
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

    	get windowId() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set windowId(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemPosition() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemPosition(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let taskbar;
    	let t1;
    	let window0;
    	let t2;
    	let window1;
    	let t3;
    	let window2;
    	let current;
    	let mounted;
    	let dispose;
    	taskbar = new Taskbar({ $$inline: true });

    	window0 = new Base({
    			props: {
    				windowId: "id1",
    				left: "0vw",
    				top: "0vh",
    				width: "20vw",
    				height: "20vh",
    				itemPosition: 0
    			},
    			$$inline: true
    		});

    	window1 = new Base({
    			props: {
    				windowId: "id2",
    				left: "0vw",
    				top: "25vh",
    				width: "20vw",
    				height: "20vh",
    				itemPosition: 1
    			},
    			$$inline: true
    		});

    	window2 = new Base({
    			props: {
    				windowId: "id3",
    				left: "0vw",
    				top: "50vh",
    				width: "20vw",
    				height: "20vh",
    				itemPosition: 2
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			create_component(taskbar.$$.fragment);
    			t1 = space();
    			create_component(window0.$$.fragment);
    			t2 = space();
    			create_component(window1.$$.fragment);
    			t3 = space();
    			create_component(window2.$$.fragment);
    			if (img.src !== (img_src_value = "./vectors/Flat-Mountains.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-111ne1a");
    			add_location(img, file, 25, 8, 823);
    			attr_dev(div, "class", "svelte-111ne1a");
    			add_location(div, file, 24, 4, 780);
    			add_location(main, file, 23, 0, 769);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, img);
    			append_dev(main, t0);
    			mount_component(taskbar, main, null);
    			append_dev(main, t1);
    			mount_component(window0, main, null);
    			append_dev(main, t2);
    			mount_component(window1, main, null);
    			append_dev(main, t3);
    			mount_component(window2, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onBackgroundClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(taskbar.$$.fragment, local);
    			transition_in(window0.$$.fragment, local);
    			transition_in(window1.$$.fragment, local);
    			transition_in(window2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(taskbar.$$.fragment, local);
    			transition_out(window0.$$.fragment, local);
    			transition_out(window1.$$.fragment, local);
    			transition_out(window2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(taskbar);
    			destroy_component(window0);
    			destroy_component(window1);
    			destroy_component(window2);
    			mounted = false;
    			dispose();
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
    	

    	function onBackgroundClick() {
    		Windows.update(windows => {
    			for (let key in windows) {
    				windows[key].focused = false;

    				if (windows[key].taskbarItemState == TaskbarItemStates.focused) {
    					windows[key].taskbarItemState = TaskbarItemStates.opened;
    				}
    			}

    			return windows;
    		});

    		ChosenPanel.update(data => {
    			data.name = "";
    			return data;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Taskbar,
    		Window: Base,
    		Windows,
    		TaskbarItemStates,
    		ChosenPanel,
    		onBackgroundClick
    	});

    	return [onBackgroundClick];
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
