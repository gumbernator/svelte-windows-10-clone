
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    const file$j = "src/components/taskbar/panels/StartPanel.svelte";

    function create_fragment$j(ctx) {
    	let div1;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let t2;
    	let div0;
    	let p0;
    	let t4;
    	let button3;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let button4;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let p3;
    	let t12;
    	let button5;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let p4;
    	let t15;
    	let p5;
    	let t17;
    	let button6;
    	let img3;
    	let img3_src_value;
    	let t18;
    	let p6;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			button2 = element("button");
    			t2 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "C";
    			t4 = space();
    			button3 = element("button");
    			img0 = element("img");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Calculator";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "M";
    			t9 = space();
    			button4 = element("button");
    			img1 = element("img");
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Mail";
    			t12 = space();
    			button5 = element("button");
    			img2 = element("img");
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "Minesweeper";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "P";
    			t17 = space();
    			button6 = element("button");
    			img3 = element("img");
    			t18 = space();
    			p6 = element("p");
    			p6.textContent = "Paint";
    			attr_dev(button0, "class", "btn-power svelte-5zp68i");
    			add_location(button0, file$j, 23, 4, 651);
    			attr_dev(button1, "class", "btn-settings svelte-5zp68i");
    			add_location(button1, file$j, 24, 4, 684);
    			attr_dev(button2, "class", "btn-profile svelte-5zp68i");
    			add_location(button2, file$j, 25, 4, 720);
    			attr_dev(p0, "class", "svelte-5zp68i");
    			add_location(p0, file$j, 27, 8, 787);
    			if (img0.src !== (img0_src_value = "./vectors/calculator.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "calculator");
    			attr_dev(img0, "class", "svelte-5zp68i");
    			add_location(img0, file$j, 33, 12, 926);
    			attr_dev(p1, "class", "svelte-5zp68i");
    			add_location(p1, file$j, 34, 12, 994);
    			attr_dev(button3, "class", "svelte-5zp68i");
    			add_location(button3, file$j, 28, 8, 804);
    			attr_dev(p2, "class", "svelte-5zp68i");
    			add_location(p2, file$j, 36, 8, 1038);
    			if (img1.src !== (img1_src_value = "./vectors/email.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "email");
    			attr_dev(img1, "class", "svelte-5zp68i");
    			add_location(img1, file$j, 42, 12, 1171);
    			attr_dev(p3, "class", "svelte-5zp68i");
    			add_location(p3, file$j, 43, 12, 1229);
    			attr_dev(button4, "class", "svelte-5zp68i");
    			add_location(button4, file$j, 37, 8, 1055);
    			if (img2.src !== (img2_src_value = "./vectors/bomb.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "minesweeper");
    			attr_dev(img2, "class", "svelte-5zp68i");
    			add_location(img2, file$j, 50, 12, 1390);
    			attr_dev(p4, "class", "svelte-5zp68i");
    			add_location(p4, file$j, 51, 12, 1453);
    			attr_dev(button5, "class", "svelte-5zp68i");
    			add_location(button5, file$j, 45, 8, 1267);
    			attr_dev(p5, "class", "svelte-5zp68i");
    			add_location(p5, file$j, 53, 8, 1498);
    			if (img3.src !== (img3_src_value = "./vectors/microsoft-paint.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "paint");
    			attr_dev(img3, "class", "svelte-5zp68i");
    			add_location(img3, file$j, 59, 12, 1632);
    			attr_dev(p6, "class", "svelte-5zp68i");
    			add_location(p6, file$j, 60, 12, 1700);
    			attr_dev(button6, "class", "svelte-5zp68i");
    			add_location(button6, file$j, 54, 8, 1515);
    			attr_dev(div0, "class", "shortcuts svelte-5zp68i");
    			add_location(div0, file$j, 26, 4, 755);
    			attr_dev(div1, "class", div1_class_value = "panel " + /*className*/ ctx[0] + " svelte-5zp68i");
    			set_style(div1, "visibility", "hidden");
    			add_location(div1, file$j, 22, 0, 588);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t0);
    			append_dev(div1, button1);
    			append_dev(div1, t1);
    			append_dev(div1, button2);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, button3);
    			append_dev(button3, img0);
    			append_dev(button3, t5);
    			append_dev(button3, p1);
    			append_dev(div0, t7);
    			append_dev(div0, p2);
    			append_dev(div0, t9);
    			append_dev(div0, button4);
    			append_dev(button4, img1);
    			append_dev(button4, t10);
    			append_dev(button4, p3);
    			append_dev(div0, t12);
    			append_dev(div0, button5);
    			append_dev(button5, img2);
    			append_dev(button5, t13);
    			append_dev(button5, p4);
    			append_dev(div0, t15);
    			append_dev(div0, p5);
    			append_dev(div0, t17);
    			append_dev(div0, button6);
    			append_dev(button6, img3);
    			append_dev(button6, t18);
    			append_dev(button6, p6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button3, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button4, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(button5, "click", /*click_handler_2*/ ctx[4], false, false, false),
    					listen_dev(button6, "click", /*click_handler_3*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*className*/ 1 && div1_class_value !== (div1_class_value = "panel " + /*className*/ ctx[0] + " svelte-5zp68i")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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

    	function onProgramClick(windowId) {
    		if (document.getElementById(windowId) != null) {
    			document.getElementById(windowId).click();

    			ChosenPanel.update(data => {
    				data.name = "";
    				return data;
    			});
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StartPanel> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		onProgramClick("_calculator");
    	};

    	const click_handler_1 = () => {
    		onProgramClick("_mail");
    	};

    	const click_handler_2 = () => {
    		onProgramClick("_minesweeper");
    	};

    	const click_handler_3 = () => {
    		onProgramClick("_paint");
    	};

    	$$self.$capture_state = () => ({
    		ChosenPanel,
    		className,
    		previouslyOpened,
    		onProgramClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("previouslyOpened" in $$props) previouslyOpened = $$props.previouslyOpened;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		className,
    		onProgramClick,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class StartPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartPanel",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/taskbar/StartButton.svelte generated by Svelte v3.38.2 */
    const file$i = "src/components/taskbar/StartButton.svelte";

    function create_fragment$i(ctx) {
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
    			add_location(img0, file$i, 38, 4, 938);
    			if (img1.src !== (img1_src_value = "./vectors/icons8-windows-10-start-active.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "visibility", /*activeVisibility*/ ctx[0]);
    			attr_dev(img1, "draggable", "false");
    			attr_dev(img1, "class", "svelte-jv6rbt");
    			add_location(img1, file$i, 44, 4, 1096);
    			attr_dev(button, "class", "svelte-jv6rbt");
    			add_location(button, file$i, 33, 0, 835);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartButton",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/taskbar/panels/SystemTrayPanel.svelte generated by Svelte v3.38.2 */
    const file$h = "src/components/taskbar/panels/SystemTrayPanel.svelte";

    function create_fragment$h(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "system-tray-panel svelte-dips6g");
    			set_style(div, "--visibility", /*visibility*/ ctx[0]);
    			add_location(div, file$h, 11, 0, 255);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTrayPanel",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/taskbar/SystemTray.svelte generated by Svelte v3.38.2 */
    const file$g = "src/components/taskbar/SystemTray.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(button, file$g, 10, 0, 288);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SystemTray",
    			options,
    			id: create_fragment$g.name
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
        calculatorTitle: "Calculator",
        minesweeperTitle: "Minesweeper",
        mailTitle: "Mail",
        mail: {
            accounts: "Accounts",
            folders: "Folders",
            focused: "Focused",
            other: "Other",
            search: "Search",
        },
        paintTitle: "Paint",
        paint: {
            size: "Size",
            clear: "clear",
            save: "save",
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
        calculatorTitle: "Тооны машин",
        minesweeperTitle: "Мин шүүрдэгч",
        mailTitle: "Цахим шуудан",
        mail: {
            accounts: "Хаягууд",
            folders: "Хавтсууд",
            focused: "Үндсэн",
            other: "Бусад",
            search: "Хайх",
        },
        paintTitle: "Будаг",
        paint: {
            size: "Хэмжээ",
            clear: "Арилгах",
            save: "Хадгалах",
        },
    };

    /* src/components/taskbar/panels/LanguagePickerPanel.svelte generated by Svelte v3.38.2 */
    const file$f = "src/components/taskbar/panels/LanguagePickerPanel.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(div0, file$f, 59, 8, 1590);
    			add_location(br0, file$f, 61, 35, 1727);
    			attr_dev(div1, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div1, file$f, 60, 8, 1649);
    			attr_dev(button0, "class", button0_class_value = "language-picker-option-EN " + /*engClass*/ ctx[1] + " svelte-134k3sl");
    			add_location(button0, file$f, 58, 4, 1506);
    			attr_dev(div2, "class", "language-picker-option-left svelte-134k3sl");
    			add_location(div2, file$f, 65, 8, 1862);
    			add_location(br1, file$f, 67, 21, 1985);
    			attr_dev(div3, "class", "language-picker-option-right svelte-134k3sl");
    			add_location(div3, file$f, 66, 8, 1921);
    			attr_dev(button1, "class", button1_class_value = "language-picker-option-MN " + /*monClass*/ ctx[2] + " svelte-134k3sl");
    			add_location(button1, file$f, 64, 4, 1778);
    			attr_dev(div4, "class", div4_class_value = "language-picker-panel " + /*className*/ ctx[0] + " svelte-134k3sl");
    			set_style(div4, "visibility", "hidden");
    			add_location(div4, file$f, 57, 0, 1426);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePickerPanel",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/taskbar/LanguagePicker.svelte generated by Svelte v3.38.2 */
    const file$e = "src/components/taskbar/LanguagePicker.svelte";

    function create_fragment$e(ctx) {
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
    			add_location(p, file$e, 25, 4, 644);
    			attr_dev(button, "class", "svelte-12zm8z3");
    			add_location(button, file$e, 24, 0, 612);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguagePicker",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/taskbar/panels/CalendarPanel.svelte generated by Svelte v3.38.2 */
    const file$d = "src/components/taskbar/panels/CalendarPanel.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (98:24) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "color", "grey");
    			attr_dev(button, "class", "svelte-6a8ex9");
    			add_location(button, file$d, 98, 28, 3533);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(98:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}
    function create_if_block$3(ctx) {
    	let button;
    	let t_value = /*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getDate() + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			set_style(button, "color", "white");
    			attr_dev(button, "class", "svelte-6a8ex9");
    			add_location(button, file$d, 94, 28, 3345);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(94:24) {#if dateGrid[j][i].getMonth() == now.getMonth()}",
    		ctx
    	});

    	return block;
    }

    // (93:20) {#each [...Array(6).keys()] as j}
    function create_each_block_1$2(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*dateGrid, now*/ 192) show_if = !!(/*dateGrid*/ ctx[7][/*j*/ ctx[14]][/*i*/ ctx[11]].getMonth() == /*now*/ ctx[6].getMonth());
    		if (show_if) return create_if_block$3;
    		return create_else_block$1;
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(93:20) {#each [...Array(6).keys()] as j}",
    		ctx
    	});

    	return block;
    }

    // (91:12) {#each [...Array(7).keys()] as i}
    function create_each_block$3(ctx) {
    	let div;
    	let t;
    	let each_value_1 = [...Array(6).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "svelte-6a8ex9");
    			add_location(div, file$d, 91, 16, 3183);
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
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(91:12) {#each [...Array(7).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
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
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    			add_location(div0, file$d, 67, 12, 2248);
    			attr_dev(div1, "class", "upper-time svelte-6a8ex9");
    			add_location(div1, file$d, 66, 8, 2211);
    			attr_dev(div2, "class", "svelte-6a8ex9");
    			add_location(div2, file$d, 70, 12, 2341);
    			attr_dev(div3, "class", "upper-hour-type svelte-6a8ex9");
    			add_location(div3, file$d, 69, 8, 2299);
    			attr_dev(div4, "class", "svelte-6a8ex9");
    			add_location(div4, file$d, 73, 12, 2432);
    			attr_dev(div5, "class", "upper-date svelte-6a8ex9");
    			add_location(div5, file$d, 72, 8, 2395);
    			attr_dev(div6, "class", "upper svelte-6a8ex9");
    			add_location(div6, file$d, 65, 4, 2183);
    			attr_dev(div7, "class", "svelte-6a8ex9");
    			add_location(div7, file$d, 78, 12, 2560);
    			attr_dev(div8, "class", "lower-month-year svelte-6a8ex9");
    			add_location(div8, file$d, 77, 8, 2517);
    			attr_dev(div9, "class", "svelte-6a8ex9");
    			add_location(div9, file$d, 81, 12, 2657);
    			attr_dev(div10, "class", "svelte-6a8ex9");
    			add_location(div10, file$d, 82, 12, 2717);
    			attr_dev(div11, "class", "svelte-6a8ex9");
    			add_location(div11, file$d, 83, 12, 2777);
    			attr_dev(div12, "class", "svelte-6a8ex9");
    			add_location(div12, file$d, 84, 12, 2838);
    			attr_dev(div13, "class", "svelte-6a8ex9");
    			add_location(div13, file$d, 85, 12, 2901);
    			attr_dev(div14, "class", "svelte-6a8ex9");
    			add_location(div14, file$d, 86, 12, 2963);
    			attr_dev(div15, "class", "svelte-6a8ex9");
    			add_location(div15, file$d, 87, 12, 3023);
    			attr_dev(div16, "class", "lower-week-days svelte-6a8ex9");
    			add_location(div16, file$d, 80, 8, 2615);
    			attr_dev(div17, "class", "lower-days svelte-6a8ex9");
    			add_location(div17, file$d, 89, 8, 3096);
    			attr_dev(div18, "class", "lower svelte-6a8ex9");
    			add_location(div18, file$d, 76, 4, 2489);
    			attr_dev(div19, "class", div19_class_value = "calendar " + /*className*/ ctx[0] + " svelte-6a8ex9");
    			set_style(div19, "visibility", "hidden");
    			add_location(div19, file$d, 64, 0, 2116);
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CalendarPanel",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/taskbar/DateControl.svelte generated by Svelte v3.38.2 */
    const file$c = "src/components/taskbar/DateControl.svelte";

    function create_fragment$c(ctx) {
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
    			add_location(div0, file$c, 29, 8, 934);
    			attr_dev(div1, "class", "date-control-date svelte-16px9y3");
    			add_location(div1, file$c, 30, 8, 990);
    			attr_dev(div2, "class", "date-control svelte-16px9y3");
    			add_location(div2, file$c, 28, 4, 899);
    			attr_dev(button, "class", "svelte-16px9y3");
    			add_location(button, file$c, 27, 0, 867);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateControl",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/taskbar/panels/NotificationPanel.svelte generated by Svelte v3.38.2 */
    const file$b = "src/components/taskbar/panels/NotificationPanel.svelte";

    function create_fragment$b(ctx) {
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
    			add_location(div0, file$b, 20, 4, 610);
    			attr_dev(div1, "class", "location-icon svelte-148e0m4");
    			add_location(div1, file$b, 24, 8, 749);
    			attr_dev(div2, "class", "card-text svelte-148e0m4");
    			add_location(div2, file$b, 25, 8, 787);
    			attr_dev(button0, "class", "location svelte-148e0m4");
    			add_location(button0, file$b, 23, 4, 715);
    			attr_dev(div3, "class", "night-light-icon svelte-148e0m4");
    			add_location(div3, file$b, 28, 8, 914);
    			attr_dev(div4, "class", "card-text svelte-148e0m4");
    			add_location(div4, file$b, 29, 8, 955);
    			attr_dev(button1, "class", "night-light svelte-148e0m4");
    			add_location(button1, file$b, 27, 4, 877);
    			attr_dev(div5, "class", "screen-snip-icon svelte-148e0m4");
    			add_location(div5, file$b, 34, 8, 1106);
    			attr_dev(div6, "class", "card-text svelte-148e0m4");
    			add_location(div6, file$b, 35, 8, 1147);
    			attr_dev(button2, "class", "screen-snip svelte-148e0m4");
    			add_location(button2, file$b, 33, 4, 1069);
    			attr_dev(div7, "class", "network-icon svelte-148e0m4");
    			add_location(div7, file$b, 40, 8, 1294);
    			attr_dev(div8, "class", "card-text svelte-148e0m4");
    			add_location(div8, file$b, 41, 8, 1331);
    			attr_dev(button3, "class", "network svelte-148e0m4");
    			add_location(button3, file$b, 39, 4, 1261);
    			attr_dev(div9, "class", div9_class_value = "notification-panel " + /*className*/ ctx[0] + " svelte-148e0m4");
    			set_style(div9, "visibility", "hidden");
    			add_location(div9, file$b, 19, 0, 533);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationPanel",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/taskbar/NotificationCenter.svelte generated by Svelte v3.38.2 */
    const file$a = "src/components/taskbar/NotificationCenter.svelte";

    function create_fragment$a(ctx) {
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
    			add_location(button, file$a, 10, 0, 296);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationCenter",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/taskbar/DesktopCorner.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/components/taskbar/DesktopCorner.svelte";

    function create_fragment$9(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "svelte-1r9mxab");
    			add_location(button, file$9, 9, 0, 181);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DesktopCorner",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/taskbar/Taskbar.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/components/taskbar/Taskbar.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(div, file$8, 8, 0, 339);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Taskbar",
    			options,
    			id: create_fragment$8.name
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

    const file$7 = "src/components/window/TaskbarItem.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(img, file$7, 12, 4, 265);
    			attr_dev(div, "class", "svelte-1btagh");
    			add_location(div, file$7, 13, 4, 320);
    			attr_dev(button, "id", /*id*/ ctx[3]);
    			attr_dev(button, "class", button_class_value = "taskbar-item " + /*className*/ ctx[2] + " svelte-1btagh");
    			set_style(button, "--item-position", /*itemPosition*/ ctx[0]);
    			add_location(button, file$7, 6, 0, 147);
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
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconPath*/ 2 && img.src !== (img_src_value = /*iconPath*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(button, "id", /*id*/ ctx[3]);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TaskbarItem", slots, []);
    	let { itemPosition = 0 } = $$props;
    	let { iconPath = "" } = $$props;
    	let { className = "taskbar-item-unopened" } = $$props;
    	let { id } = $$props;
    	const writable_props = ["itemPosition", "iconPath", "className", "id"];

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
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ itemPosition, iconPath, className, id });

    	$$self.$inject_state = $$props => {
    		if ("itemPosition" in $$props) $$invalidate(0, itemPosition = $$props.itemPosition);
    		if ("iconPath" in $$props) $$invalidate(1, iconPath = $$props.iconPath);
    		if ("className" in $$props) $$invalidate(2, className = $$props.className);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemPosition, iconPath, className, id, click_handler];
    }

    class TaskbarItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			itemPosition: 0,
    			iconPath: 1,
    			className: 2,
    			id: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskbarItem",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<TaskbarItem> was created without expected prop 'id'");
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

    	get className() {
    		throw new Error("<TaskbarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<TaskbarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TaskbarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TaskbarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Windows = writable({});

    /* src/components/window/Window.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/window/Window.svelte";

    // (243:0) {#if visible}
    function create_if_block$2(ctx) {
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
    	let t7;
    	let div5;
    	let t8;
    	let div6;
    	let t9;
    	let div7;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[35].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

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
    			attr_dev(img, "class", "svelte-1fpk6oa");
    			add_location(img, file$6, 255, 12, 7779);
    			attr_dev(p, "class", "svelte-1fpk6oa");
    			add_location(p, file$6, 257, 16, 7886);
    			attr_dev(div0, "class", "title-text-container svelte-1fpk6oa");
    			add_location(div0, file$6, 256, 12, 7835);
    			attr_dev(button0, "class", "btn-minimize svelte-1fpk6oa");
    			add_location(button0, file$6, 259, 12, 7932);
    			attr_dev(button1, "class", "btn-expand svelte-1fpk6oa");
    			add_location(button1, file$6, 260, 12, 8003);
    			attr_dev(button2, "class", "btn-close svelte-1fpk6oa");
    			add_location(button2, file$6, 261, 12, 8072);
    			attr_dev(div1, "class", div1_class_value = "title-bar " + /*titleBarClass*/ ctx[13] + " svelte-1fpk6oa");
    			add_location(div1, file$6, 250, 8, 7620);
    			attr_dev(div2, "class", "form-body svelte-1fpk6oa");
    			add_location(div2, file$6, 263, 8, 8148);
    			attr_dev(div3, "class", div3_class_value = "form " + /*formClass*/ ctx[10] + " svelte-1fpk6oa");
    			set_style(div3, "--top", /*topPx*/ ctx[9] + "px");
    			set_style(div3, "--left", /*leftPx*/ ctx[8] + "px");
    			set_style(div3, "--width", /*widthPx*/ ctx[6] + "px");
    			set_style(div3, "--height", /*heightPx*/ ctx[7] + "px");
    			set_style(div3, "--taskbar-index", /*itemPosition*/ ctx[3]);
    			set_style(div3, "z-index", /*zIndex*/ ctx[4]);
    			set_style(div3, "transition", /*formTransition*/ ctx[11]);
    			add_location(div3, file$6, 243, 4, 7285);
    			attr_dev(div4, "class", "top-border svelte-1fpk6oa");
    			set_style(div4, "--top", /*topPx*/ ctx[9] + "px");
    			set_style(div4, "--left", /*leftPx*/ ctx[8] + "px");
    			set_style(div4, "--width", /*widthPx*/ ctx[6] + "px");
    			set_style(div4, "--height", /*heightPx*/ ctx[7] + "px");
    			set_style(div4, "z-index", /*zIndex*/ ctx[4]);
    			set_style(div4, "visibility", /*borderVisibility*/ ctx[14]);
    			add_location(div4, file$6, 267, 4, 8223);
    			attr_dev(div5, "class", "left-border svelte-1fpk6oa");
    			set_style(div5, "--top", /*topPx*/ ctx[9] + "px");
    			set_style(div5, "--left", /*leftPx*/ ctx[8] + "px");
    			set_style(div5, "--width", /*widthPx*/ ctx[6] + "px");
    			set_style(div5, "--height", /*heightPx*/ ctx[7] + "px");
    			set_style(div5, "z-index", /*zIndex*/ ctx[4]);
    			set_style(div5, "visibility", /*borderVisibility*/ ctx[14]);
    			add_location(div5, file$6, 272, 4, 8452);
    			attr_dev(div6, "class", "bottom-border svelte-1fpk6oa");
    			set_style(div6, "--top", /*topPx*/ ctx[9] + "px");
    			set_style(div6, "--left", /*leftPx*/ ctx[8] + "px");
    			set_style(div6, "--width", /*widthPx*/ ctx[6] + "px");
    			set_style(div6, "--height", /*heightPx*/ ctx[7] + "px");
    			set_style(div6, "z-index", /*zIndex*/ ctx[4]);
    			set_style(div6, "visibility", /*borderVisibility*/ ctx[14]);
    			add_location(div6, file$6, 277, 4, 8683);
    			attr_dev(div7, "class", "right-border svelte-1fpk6oa");
    			set_style(div7, "--top", /*topPx*/ ctx[9] + "px");
    			set_style(div7, "--left", /*leftPx*/ ctx[8] + "px");
    			set_style(div7, "--width", /*widthPx*/ ctx[6] + "px");
    			set_style(div7, "--height", /*heightPx*/ ctx[7] + "px");
    			set_style(div7, "z-index", /*zIndex*/ ctx[4]);
    			set_style(div7, "visibility", /*borderVisibility*/ ctx[14]);
    			add_location(div7, file$6, 282, 4, 8918);
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

    			/*div3_binding*/ ctx[36](div3);
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
    					listen_dev(button0, "click", /*onMinimizeClick*/ ctx[23], false, false, false),
    					listen_dev(button1, "click", /*onMaximizeClick*/ ctx[24], false, false, false),
    					listen_dev(button2, "click", /*onCloseClick*/ ctx[25], false, false, false),
    					listen_dev(div1, "mousedown", /*onTitleMouseDown*/ ctx[16], false, false, false),
    					listen_dev(div1, "dblclick", /*onMaximizeClick*/ ctx[24], false, false, false),
    					listen_dev(div3, "mousedown", /*takeFocus*/ ctx[26], false, false, false),
    					listen_dev(div4, "mousedown", /*onTopBorderDown*/ ctx[17], false, false, false),
    					listen_dev(div5, "mousedown", /*onLeftBorderDown*/ ctx[18], false, false, false),
    					listen_dev(div6, "mousedown", /*onBottomBorderDown*/ ctx[19], false, false, false),
    					listen_dev(div7, "mousedown", /*onRightBorderDown*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*icon*/ 1 && img.src !== (img_src_value = /*icon*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (!current || dirty[0] & /*titleBarClass*/ 8192 && div1_class_value !== (div1_class_value = "title-bar " + /*titleBarClass*/ ctx[13] + " svelte-1fpk6oa")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[34], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*formClass*/ 1024 && div3_class_value !== (div3_class_value = "form " + /*formClass*/ ctx[10] + " svelte-1fpk6oa")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty[0] & /*topPx*/ 512) {
    				set_style(div3, "--top", /*topPx*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 256) {
    				set_style(div3, "--left", /*leftPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 64) {
    				set_style(div3, "--width", /*widthPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 128) {
    				set_style(div3, "--height", /*heightPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*itemPosition*/ 8) {
    				set_style(div3, "--taskbar-index", /*itemPosition*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*zIndex*/ 16) {
    				set_style(div3, "z-index", /*zIndex*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*formTransition*/ 2048) {
    				set_style(div3, "transition", /*formTransition*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*topPx*/ 512) {
    				set_style(div4, "--top", /*topPx*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 256) {
    				set_style(div4, "--left", /*leftPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 64) {
    				set_style(div4, "--width", /*widthPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 128) {
    				set_style(div4, "--height", /*heightPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 16) {
    				set_style(div4, "z-index", /*zIndex*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*borderVisibility*/ 16384) {
    				set_style(div4, "visibility", /*borderVisibility*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*topPx*/ 512) {
    				set_style(div5, "--top", /*topPx*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 256) {
    				set_style(div5, "--left", /*leftPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 64) {
    				set_style(div5, "--width", /*widthPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 128) {
    				set_style(div5, "--height", /*heightPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 16) {
    				set_style(div5, "z-index", /*zIndex*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*borderVisibility*/ 16384) {
    				set_style(div5, "visibility", /*borderVisibility*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*topPx*/ 512) {
    				set_style(div6, "--top", /*topPx*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 256) {
    				set_style(div6, "--left", /*leftPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 64) {
    				set_style(div6, "--width", /*widthPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 128) {
    				set_style(div6, "--height", /*heightPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 16) {
    				set_style(div6, "z-index", /*zIndex*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*borderVisibility*/ 16384) {
    				set_style(div6, "visibility", /*borderVisibility*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*topPx*/ 512) {
    				set_style(div7, "--top", /*topPx*/ ctx[9] + "px");
    			}

    			if (!current || dirty[0] & /*leftPx*/ 256) {
    				set_style(div7, "--left", /*leftPx*/ ctx[8] + "px");
    			}

    			if (!current || dirty[0] & /*widthPx*/ 64) {
    				set_style(div7, "--width", /*widthPx*/ ctx[6] + "px");
    			}

    			if (!current || dirty[0] & /*heightPx*/ 128) {
    				set_style(div7, "--height", /*heightPx*/ ctx[7] + "px");
    			}

    			if (!current || dirty[0] & /*zIndex*/ 16) {
    				set_style(div7, "z-index", /*zIndex*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*borderVisibility*/ 16384) {
    				set_style(div7, "visibility", /*borderVisibility*/ ctx[14]);
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
    			/*div3_binding*/ ctx[36](null);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(243:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t;
    	let taskbaritem;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*visible*/ ctx[12] && create_if_block$2(ctx);

    	taskbaritem = new TaskbarItem({
    			props: {
    				id: /*windowId*/ ctx[2],
    				itemPosition: /*itemPosition*/ ctx[3],
    				iconPath: /*icon*/ ctx[0],
    				className: /*taskbarClass*/ ctx[15]
    			},
    			$$inline: true
    		});

    	taskbaritem.$on("click", /*onTaskbarItemClick*/ ctx[27]);

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
    					listen_dev(window, "mousemove", /*onMouseMove*/ ctx[22], false, false, false),
    					listen_dev(window, "mouseup", /*onMouseUp*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 4096) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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
    			if (dirty[0] & /*windowId*/ 4) taskbaritem_changes.id = /*windowId*/ ctx[2];
    			if (dirty[0] & /*itemPosition*/ 8) taskbaritem_changes.itemPosition = /*itemPosition*/ ctx[3];
    			if (dirty[0] & /*icon*/ 1) taskbaritem_changes.iconPath = /*icon*/ ctx[0];
    			if (dirty[0] & /*taskbarClass*/ 32768) taskbaritem_changes.className = /*taskbarClass*/ ctx[15];
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	
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
    	let pLeftPx = leftPx;
    	let pTopPx = topPx;
    	let pWidthPx = widthPx;
    	let pHeightPx = heightPx;
    	let moving = false;
    	let maximized = false;
    	let formClass = "";
    	let formTransition = "none";
    	let visible = false;
    	let titleBarClass = "title-bar-focused";
    	let borderVisibility = "visible";
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
    			$$invalidate(8, leftPx += e.movementX);
    			$$invalidate(9, topPx += e.movementY);
    			$$invalidate(8, leftPx = Math.max(leftPx, -widthPx * 0.95));
    			$$invalidate(8, leftPx = Math.min(leftPx, document.documentElement.clientWidth * 0.95));
    			$$invalidate(9, topPx = Math.max(topPx, 0));
    			$$invalidate(9, topPx = Math.min(topPx, document.documentElement.clientHeight * 0.95));
    		} else if (pressedPlace == pressPlaces.top) {
    			$$invalidate(7, heightPx -= e.movementY);
    			$$invalidate(7, heightPx = Math.max(minHeightPx, heightPx));
    			$$invalidate(9, topPx += heightPx == minHeightPx ? 0 : e.movementY);
    		} else if (pressedPlace == pressPlaces.left) {
    			$$invalidate(6, widthPx -= e.movementX);
    			$$invalidate(6, widthPx = Math.max(minWidthPx, widthPx));
    			$$invalidate(8, leftPx += widthPx == minWidthPx ? 0 : e.movementX);
    		} else if (pressedPlace == pressPlaces.bottom) {
    			$$invalidate(7, heightPx += e.movementY);
    			$$invalidate(7, heightPx = Math.max(minHeightPx, heightPx));
    		} else if (pressedPlace == pressPlaces.right) {
    			$$invalidate(6, widthPx += e.movementX);
    			$$invalidate(6, widthPx = Math.max(minWidthPx, widthPx));
    		}
    	}

    	function onMinimizeClick() {
    		$$invalidate(10, formClass = "form-minimize");
    		state = windowsStates.minimized;
    		taskbarItemState = TaskbarItemStates.opened;
    		$$invalidate(15, taskbarClass = "taskbar-item-opened");
    		$$invalidate(14, borderVisibility = "hidden");
    	}

    	function onMaximizeClick() {
    		$$invalidate(11, formTransition = "100ms");

    		setTimeout(
    			() => {
    				$$invalidate(11, formTransition = "none");
    			},
    			100
    		);

    		state = maximized
    		? windowsStates.expanded
    		: windowsStates.maximized;

    		if (maximized) {
    			setTimeout(
    				() => {
    					takeFocus();
    				},
    				100
    			);

    			$$invalidate(8, leftPx = pLeftPx);
    			$$invalidate(9, topPx = pTopPx);
    			$$invalidate(6, widthPx = pWidthPx);
    			$$invalidate(7, heightPx = pHeightPx);
    			state = windowsStates.expanded;
    		} else {
    			pLeftPx = leftPx;
    			pTopPx = topPx;
    			pWidthPx = widthPx;
    			pHeightPx = heightPx;
    			$$invalidate(8, leftPx = 0);
    			$$invalidate(9, topPx = 0);
    			$$invalidate(6, widthPx = document.documentElement.clientWidth);
    			$$invalidate(7, heightPx = document.documentElement.clientHeight - Math.max(0.04 * document.documentElement.clientHeight, 30));
    			state = windowsStates.maximized;
    		}

    		maximized = !maximized;
    	}

    	function onCloseClick() {
    		$$invalidate(12, visible = false);

    		setTimeout(
    			() => {
    				$$invalidate(10, formClass = "");
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
    					$$invalidate(15, taskbarClass = "taskbar-item-focused");
    					$$invalidate(12, visible = true);
    					$$invalidate(14, borderVisibility = "visible");
    					takeFocus();
    					break;
    				}
    			case TaskbarItemStates.opened:
    				{
    					taskbarItemState = TaskbarItemStates.focused;
    					$$invalidate(15, taskbarClass = "taskbar-item-focused");

    					if (state == windowsStates.minimized) {
    						$$invalidate(10, formClass = "");
    					}

    					$$invalidate(14, borderVisibility = "visible");
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

    		$$invalidate(13, titleBarClass = windows[windowId].focused
    		? "title-bar-focused"
    		: "title-bar-unfocused");

    		$$invalidate(4, zIndex = windows[windowId].zIndex);
    		taskbarItemState = windows[windowId].taskbarItemState;

    		switch (taskbarItemState) {
    			case TaskbarItemStates.unopened:
    				{
    					$$invalidate(15, taskbarClass = "taskbar-item-unopened");
    					break;
    				}
    			case TaskbarItemStates.opened:
    				{
    					$$invalidate(15, taskbarClass = "taskbar-item-opened");
    					break;
    				}
    			case TaskbarItemStates.focused:
    				{
    					$$invalidate(15, taskbarClass = "taskbar-item-focused");
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			nodeRef = $$value;
    			$$invalidate(5, nodeRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(28, width = $$props.width);
    		if ("height" in $$props) $$invalidate(29, height = $$props.height);
    		if ("minWidth" in $$props) $$invalidate(30, minWidth = $$props.minWidth);
    		if ("minHeight" in $$props) $$invalidate(31, minHeight = $$props.minHeight);
    		if ("left" in $$props) $$invalidate(32, left = $$props.left);
    		if ("top" in $$props) $$invalidate(33, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("windowId" in $$props) $$invalidate(2, windowId = $$props.windowId);
    		if ("itemPosition" in $$props) $$invalidate(3, itemPosition = $$props.itemPosition);
    		if ("$$scope" in $$props) $$invalidate(34, $$scope = $$props.$$scope);
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
    		pLeftPx,
    		pTopPx,
    		pWidthPx,
    		pHeightPx,
    		moving,
    		maximized,
    		formClass,
    		formTransition,
    		visible,
    		titleBarClass,
    		borderVisibility,
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
    		if ("width" in $$props) $$invalidate(28, width = $$props.width);
    		if ("height" in $$props) $$invalidate(29, height = $$props.height);
    		if ("minWidth" in $$props) $$invalidate(30, minWidth = $$props.minWidth);
    		if ("minHeight" in $$props) $$invalidate(31, minHeight = $$props.minHeight);
    		if ("left" in $$props) $$invalidate(32, left = $$props.left);
    		if ("top" in $$props) $$invalidate(33, top = $$props.top);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("windowId" in $$props) $$invalidate(2, windowId = $$props.windowId);
    		if ("itemPosition" in $$props) $$invalidate(3, itemPosition = $$props.itemPosition);
    		if ("zIndex" in $$props) $$invalidate(4, zIndex = $$props.zIndex);
    		if ("nodeRef" in $$props) $$invalidate(5, nodeRef = $$props.nodeRef);
    		if ("widthPx" in $$props) $$invalidate(6, widthPx = $$props.widthPx);
    		if ("heightPx" in $$props) $$invalidate(7, heightPx = $$props.heightPx);
    		if ("leftPx" in $$props) $$invalidate(8, leftPx = $$props.leftPx);
    		if ("topPx" in $$props) $$invalidate(9, topPx = $$props.topPx);
    		if ("minWidthPx" in $$props) minWidthPx = $$props.minWidthPx;
    		if ("minHeightPx" in $$props) minHeightPx = $$props.minHeightPx;
    		if ("pLeftPx" in $$props) pLeftPx = $$props.pLeftPx;
    		if ("pTopPx" in $$props) pTopPx = $$props.pTopPx;
    		if ("pWidthPx" in $$props) pWidthPx = $$props.pWidthPx;
    		if ("pHeightPx" in $$props) pHeightPx = $$props.pHeightPx;
    		if ("moving" in $$props) moving = $$props.moving;
    		if ("maximized" in $$props) maximized = $$props.maximized;
    		if ("formClass" in $$props) $$invalidate(10, formClass = $$props.formClass);
    		if ("formTransition" in $$props) $$invalidate(11, formTransition = $$props.formTransition);
    		if ("visible" in $$props) $$invalidate(12, visible = $$props.visible);
    		if ("titleBarClass" in $$props) $$invalidate(13, titleBarClass = $$props.titleBarClass);
    		if ("borderVisibility" in $$props) $$invalidate(14, borderVisibility = $$props.borderVisibility);
    		if ("taskbarItemState" in $$props) taskbarItemState = $$props.taskbarItemState;
    		if ("taskbarClass" in $$props) $$invalidate(15, taskbarClass = $$props.taskbarClass);
    		if ("state" in $$props) state = $$props.state;
    		if ("pressedPlace" in $$props) pressedPlace = $$props.pressedPlace;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
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
    		formClass,
    		formTransition,
    		visible,
    		titleBarClass,
    		borderVisibility,
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
    		$$scope,
    		slots,
    		div3_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				width: 28,
    				height: 29,
    				minWidth: 30,
    				minHeight: 31,
    				left: 32,
    				top: 33,
    				icon: 0,
    				title: 1,
    				windowId: 2,
    				itemPosition: 3
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get width() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minHeight() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minHeight(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get windowId() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set windowId(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemPosition() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemPosition(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/window/forms/Calculator.svelte generated by Svelte v3.38.2 */

    const file$5 = "src/components/window/forms/Calculator.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let ul;
    	let li0;
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let li1;
    	let p1;
    	let t3;
    	let t4;
    	let div0;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let t10;
    	let button3;
    	let t12;
    	let button4;
    	let t14;
    	let button5;
    	let t16;
    	let button6;
    	let t18;
    	let button7;
    	let t20;
    	let button8;
    	let t22;
    	let button9;
    	let t24;
    	let button10;
    	let t26;
    	let button11;
    	let t28;
    	let button12;
    	let t30;
    	let button13;
    	let t32;
    	let button14;
    	let t34;
    	let button15;
    	let t36;
    	let button16;
    	let t38;
    	let button17;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			p0 = element("p");
    			t0 = text(/*topText*/ ctx[0]);
    			t1 = text(/*operand*/ ctx[2]);
    			t2 = space();
    			li1 = element("li");
    			p1 = element("p");
    			t3 = text(/*bottomText*/ ctx[1]);
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "C";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "/";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "*";
    			t10 = space();
    			button3 = element("button");
    			button3.textContent = "7";
    			t12 = space();
    			button4 = element("button");
    			button4.textContent = "8";
    			t14 = space();
    			button5 = element("button");
    			button5.textContent = "9";
    			t16 = space();
    			button6 = element("button");
    			button6.textContent = "-";
    			t18 = space();
    			button7 = element("button");
    			button7.textContent = "4";
    			t20 = space();
    			button8 = element("button");
    			button8.textContent = "5";
    			t22 = space();
    			button9 = element("button");
    			button9.textContent = "6";
    			t24 = space();
    			button10 = element("button");
    			button10.textContent = "+";
    			t26 = space();
    			button11 = element("button");
    			button11.textContent = "1";
    			t28 = space();
    			button12 = element("button");
    			button12.textContent = "2";
    			t30 = space();
    			button13 = element("button");
    			button13.textContent = "3";
    			t32 = space();
    			button14 = element("button");
    			button14.textContent = "0";
    			t34 = space();
    			button15 = element("button");
    			button15.textContent = "00";
    			t36 = space();
    			button16 = element("button");
    			button16.textContent = ".";
    			t38 = space();
    			button17 = element("button");
    			button17.textContent = "=";
    			set_style(p0, "font-size", "1.5rem");
    			attr_dev(p0, "class", "svelte-1thc41z");
    			add_location(p0, file$5, 65, 12, 1588);
    			attr_dev(li0, "class", "svelte-1thc41z");
    			add_location(li0, file$5, 65, 8, 1584);
    			set_style(p1, "font-size", "3rem");
    			attr_dev(p1, "class", "svelte-1thc41z");
    			add_location(p1, file$5, 66, 12, 1658);
    			attr_dev(li1, "class", "svelte-1thc41z");
    			add_location(li1, file$5, 66, 8, 1654);
    			attr_dev(ul, "class", "top-section svelte-1thc41z");
    			add_location(ul, file$5, 64, 4, 1551);
    			set_style(button0, "grid-column", "span 2");
    			set_style(button0, "background-color", "rgba(60, 60, 60)");
    			attr_dev(button0, "class", "svelte-1thc41z");
    			add_location(button0, file$5, 70, 8, 1760);
    			attr_dev(button1, "class", "svelte-1thc41z");
    			add_location(button1, file$5, 74, 8, 1902);
    			attr_dev(button2, "class", "svelte-1thc41z");
    			add_location(button2, file$5, 75, 8, 1964);
    			attr_dev(button3, "class", "svelte-1thc41z");
    			add_location(button3, file$5, 76, 8, 2026);
    			attr_dev(button4, "class", "svelte-1thc41z");
    			add_location(button4, file$5, 77, 8, 2088);
    			attr_dev(button5, "class", "svelte-1thc41z");
    			add_location(button5, file$5, 78, 8, 2150);
    			attr_dev(button6, "class", "svelte-1thc41z");
    			add_location(button6, file$5, 79, 8, 2212);
    			attr_dev(button7, "class", "svelte-1thc41z");
    			add_location(button7, file$5, 80, 8, 2274);
    			attr_dev(button8, "class", "svelte-1thc41z");
    			add_location(button8, file$5, 81, 8, 2336);
    			attr_dev(button9, "class", "svelte-1thc41z");
    			add_location(button9, file$5, 82, 8, 2398);
    			set_style(button10, "grid-row", "span 2");
    			attr_dev(button10, "class", "svelte-1thc41z");
    			add_location(button10, file$5, 83, 8, 2460);
    			attr_dev(button11, "class", "svelte-1thc41z");
    			add_location(button11, file$5, 86, 8, 2570);
    			attr_dev(button12, "class", "svelte-1thc41z");
    			add_location(button12, file$5, 87, 8, 2632);
    			attr_dev(button13, "class", "svelte-1thc41z");
    			add_location(button13, file$5, 88, 8, 2694);
    			attr_dev(button14, "class", "svelte-1thc41z");
    			add_location(button14, file$5, 89, 8, 2756);
    			attr_dev(button15, "class", "svelte-1thc41z");
    			add_location(button15, file$5, 90, 8, 2818);
    			attr_dev(button16, "class", "svelte-1thc41z");
    			add_location(button16, file$5, 91, 8, 2882);
    			set_style(button17, "background-color", "rgba(60, 60, 60)");
    			attr_dev(button17, "class", "svelte-1thc41z");
    			add_location(button17, file$5, 92, 8, 2944);
    			attr_dev(div0, "class", "bottom-section svelte-1thc41z");
    			add_location(div0, file$5, 69, 4, 1723);
    			attr_dev(div1, "class", "calculator svelte-1thc41z");
    			attr_dev(div1, "draggable", "false");
    			add_location(div1, file$5, 63, 0, 1504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, p1);
    			append_dev(p1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(div0, t8);
    			append_dev(div0, button2);
    			append_dev(div0, t10);
    			append_dev(div0, button3);
    			append_dev(div0, t12);
    			append_dev(div0, button4);
    			append_dev(div0, t14);
    			append_dev(div0, button5);
    			append_dev(div0, t16);
    			append_dev(div0, button6);
    			append_dev(div0, t18);
    			append_dev(div0, button7);
    			append_dev(div0, t20);
    			append_dev(div0, button8);
    			append_dev(div0, t22);
    			append_dev(div0, button9);
    			append_dev(div0, t24);
    			append_dev(div0, button10);
    			append_dev(div0, t26);
    			append_dev(div0, button11);
    			append_dev(div0, t28);
    			append_dev(div0, button12);
    			append_dev(div0, t30);
    			append_dev(div0, button13);
    			append_dev(div0, t32);
    			append_dev(div0, button14);
    			append_dev(div0, t34);
    			append_dev(div0, button15);
    			append_dev(div0, t36);
    			append_dev(div0, button16);
    			append_dev(div0, t38);
    			append_dev(div0, button17);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*clear*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*click_handler_2*/ ctx[8], false, false, false),
    					listen_dev(button4, "click", /*click_handler_3*/ ctx[9], false, false, false),
    					listen_dev(button5, "click", /*click_handler_4*/ ctx[10], false, false, false),
    					listen_dev(button6, "click", /*click_handler_5*/ ctx[11], false, false, false),
    					listen_dev(button7, "click", /*click_handler_6*/ ctx[12], false, false, false),
    					listen_dev(button8, "click", /*click_handler_7*/ ctx[13], false, false, false),
    					listen_dev(button9, "click", /*click_handler_8*/ ctx[14], false, false, false),
    					listen_dev(button10, "click", /*click_handler_9*/ ctx[15], false, false, false),
    					listen_dev(button11, "click", /*click_handler_10*/ ctx[16], false, false, false),
    					listen_dev(button12, "click", /*click_handler_11*/ ctx[17], false, false, false),
    					listen_dev(button13, "click", /*click_handler_12*/ ctx[18], false, false, false),
    					listen_dev(button14, "click", /*click_handler_13*/ ctx[19], false, false, false),
    					listen_dev(button15, "click", /*click_handler_14*/ ctx[20], false, false, false),
    					listen_dev(button16, "click", /*click_handler_15*/ ctx[21], false, false, false),
    					listen_dev(button17, "click", /*equals*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*topText*/ 1) set_data_dev(t0, /*topText*/ ctx[0]);
    			if (dirty & /*operand*/ 4) set_data_dev(t1, /*operand*/ ctx[2]);
    			if (dirty & /*bottomText*/ 2) set_data_dev(t3, /*bottomText*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
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

    const operands = /\+|-|\*|\//;

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Calculator", slots, []);
    	let topText = "";
    	let bottomText = "0";
    	let operand = "";

    	function clear() {
    		$$invalidate(0, topText = "");
    		$$invalidate(1, bottomText = "0");
    		$$invalidate(2, operand = "");
    	}

    	function addCharacter(char) {
    		if (char === ".") {
    			if (!bottomText.includes(".")) {
    				$$invalidate(1, bottomText += char);
    			}

    			return;
    		}

    		if (char.match(operands) && topText !== "") {
    			$$invalidate(2, operand = char);
    			return;
    		}

    		if (char.match(operands)) {
    			$$invalidate(2, operand = char);
    			$$invalidate(0, topText = bottomText);
    			$$invalidate(1, bottomText = "0");
    			return;
    		}

    		if (bottomText === "0" && (char === "0" || char === "00")) {
    			return;
    		}

    		if (bottomText === "0") {
    			$$invalidate(1, bottomText = char);
    			return;
    		}

    		$$invalidate(1, bottomText += char);
    	}

    	function equals() {
    		switch (operand) {
    			case "":
    				{
    					return;
    				}
    			case "/":
    				{
    					$$invalidate(1, bottomText = Number((Number(topText) / Number(bottomText)).toFixed(6)).toString());
    					break;
    				}
    			case "*":
    				{
    					$$invalidate(1, bottomText = Number((Number(topText) * Number(bottomText)).toFixed(6)).toString());
    					break;
    				}
    			case "+":
    				{
    					$$invalidate(1, bottomText = Number((Number(topText) + Number(bottomText)).toFixed(6)).toString());
    					break;
    				}
    			case "-":
    				{
    					$$invalidate(1, bottomText = Number((Number(topText) - Number(bottomText)).toFixed(6)).toString());
    					break;
    				}
    		}

    		$$invalidate(0, topText = "");
    		$$invalidate(2, operand = "");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Calculator> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => addCharacter("/");
    	const click_handler_1 = () => addCharacter("*");
    	const click_handler_2 = () => addCharacter("7");
    	const click_handler_3 = () => addCharacter("8");
    	const click_handler_4 = () => addCharacter("9");
    	const click_handler_5 = () => addCharacter("-");
    	const click_handler_6 = () => addCharacter("4");
    	const click_handler_7 = () => addCharacter("5");
    	const click_handler_8 = () => addCharacter("6");
    	const click_handler_9 = () => addCharacter("+");
    	const click_handler_10 = () => addCharacter("1");
    	const click_handler_11 = () => addCharacter("2");
    	const click_handler_12 = () => addCharacter("3");
    	const click_handler_13 = () => addCharacter("0");
    	const click_handler_14 = () => addCharacter("00");
    	const click_handler_15 = () => addCharacter(".");

    	$$self.$capture_state = () => ({
    		topText,
    		bottomText,
    		operand,
    		operands,
    		clear,
    		addCharacter,
    		equals
    	});

    	$$self.$inject_state = $$props => {
    		if ("topText" in $$props) $$invalidate(0, topText = $$props.topText);
    		if ("bottomText" in $$props) $$invalidate(1, bottomText = $$props.bottomText);
    		if ("operand" in $$props) $$invalidate(2, operand = $$props.operand);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		topText,
    		bottomText,
    		operand,
    		clear,
    		addCharacter,
    		equals,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15
    	];
    }

    class Calculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculator",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/window/forms/Minesweeper.svelte generated by Svelte v3.38.2 */

    const file$4 = "src/components/window/forms/Minesweeper.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (164:24) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t_value = /*fields*/ ctx[0][/*i*/ ctx[15]][/*j*/ ctx[18]] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function mousedown_handler_3(...args) {
    		return /*mousedown_handler_3*/ ctx[11](/*i*/ ctx[15], /*j*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "btn btn-active svelte-7ofadi");
    			add_location(button, file$4, 164, 28, 4674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "mousedown", mousedown_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*fields*/ 1 && t_value !== (t_value = /*fields*/ ctx[0][/*i*/ ctx[15]][/*j*/ ctx[18]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(164:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (159:52) 
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function mousedown_handler_2(...args) {
    		return /*mousedown_handler_2*/ ctx[10](/*i*/ ctx[15], /*j*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "btn btn-active svelte-7ofadi");
    			add_location(button, file$4, 159, 28, 4446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "mousedown", mousedown_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(159:52) ",
    		ctx
    	});

    	return block;
    }

    // (154:57) 
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function mousedown_handler_1(...args) {
    		return /*mousedown_handler_1*/ ctx[9](/*i*/ ctx[15], /*j*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "btn btn-marked svelte-7ofadi");
    			add_location(button, file$4, 154, 28, 4197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "mousedown", mousedown_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(154:57) ",
    		ctx
    	});

    	return block;
    }

    // (149:24) {#if fieldStates[i][j] == 0}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[8](/*i*/ ctx[15], /*j*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "btn btn-inactive svelte-7ofadi");
    			add_location(button, file$4, 149, 28, 3941);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "mousedown", mousedown_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(149:24) {#if fieldStates[i][j] == 0}",
    		ctx
    	});

    	return block;
    }

    // (148:20) {#each [...Array(cols).keys()] as j}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*fieldStates*/ ctx[1][/*i*/ ctx[15]][/*j*/ ctx[18]] == 0) return create_if_block$1;
    		if (/*fieldStates*/ ctx[1][/*i*/ ctx[15]][/*j*/ ctx[18]] == 2) return create_if_block_1;
    		if (/*fields*/ ctx[0][/*i*/ ctx[15]][/*j*/ ctx[18]] == 0) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(148:20) {#each [...Array(cols).keys()] as j}",
    		ctx
    	});

    	return block;
    }

    // (146:12) {#each [...Array(rows).keys()] as i}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let each_value_1 = [...Array(/*cols*/ ctx[5]).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "svelte-7ofadi");
    			add_location(div, file$4, 146, 16, 3797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*onBtnClick, Array, rows, cols, fieldStates, fields*/ 115) {
    				each_value_1 = [...Array(/*cols*/ ctx[5]).keys()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(146:12) {#each [...Array(rows).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div4;
    	let div1;
    	let button;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let p;
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let mounted;
    	let dispose;
    	let each_value = [...Array(/*rows*/ ctx[4]).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			button = element("button");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			t2 = text(/*elapsedTime*/ ctx[2]);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "refresher svelte-7ofadi");
    			add_location(button, file$4, 137, 8, 3479);
    			if (img.src !== (img_src_value = /*imagePath*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-7ofadi");
    			add_location(img, file$4, 138, 8, 3542);
    			attr_dev(p, "class", "svelte-7ofadi");
    			add_location(p, file$4, 140, 12, 3623);
    			attr_dev(div0, "class", "timer-container svelte-7ofadi");
    			add_location(div0, file$4, 139, 8, 3581);
    			attr_dev(div1, "class", "top-section svelte-7ofadi");
    			add_location(div1, file$4, 136, 4, 3445);
    			attr_dev(div2, "class", "fields svelte-7ofadi");
    			add_location(div2, file$4, 144, 8, 3711);
    			attr_dev(div3, "class", "bottom-section svelte-7ofadi");
    			add_location(div3, file$4, 143, 4, 3674);
    			set_style(div4, "background", "#7f7f7f");
    			set_style(div4, "width", "100%");
    			set_style(div4, "height", "100%");
    			set_style(div4, "user-select", "none");
    			attr_dev(div4, "draggable", "false");
    			add_location(div4, file$4, 129, 0, 3260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, button);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*onRefreshClick*/ ctx[7], false, false, false),
    					listen_dev(div4, "contextmenu", prevent_default(contextmenu_handler), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*imagePath*/ 8 && img.src !== (img_src_value = /*imagePath*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*elapsedTime*/ 4) set_data_dev(t2, /*elapsedTime*/ ctx[2]);

    			if (dirty & /*Array, cols, onBtnClick, rows, fieldStates, fields*/ 115) {
    				each_value = [...Array(/*rows*/ ctx[4]).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    const contextmenu_handler = e => {
    	return false;
    };

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Minesweeper", slots, []);
    	let rows = 18;
    	let cols = 18;
    	let fields = [];
    	let fieldStates = [];
    	let elapsedTime = 0;
    	let imagePath = "./vectors/smile.svg";
    	let lost = false;
    	let timer;

    	function onBtnClick(i, j, event) {
    		if (lost) {
    			return;
    		}

    		if (fieldStates[i][j] == 1) {
    			return;
    		}

    		if (event.button == 2) {
    			$$invalidate(1, fieldStates[i][j] = fieldStates[i][j] == 2 ? 0 : 2, fieldStates);

    			if (checkIfWon()) {
    				$$invalidate(3, imagePath = "./vectors/heart.svg");
    				clearInterval(timer);
    				lost = true;
    			}

    			return;
    		}

    		if (fieldStates[i][j] == 2) {
    			$$invalidate(1, fieldStates[i][j] = 0, fieldStates);
    			return;
    		}

    		if (fields[i][j] > 0) {
    			$$invalidate(1, fieldStates[i][j] = 1, fieldStates);
    			return;
    		}

    		if (fields[i][j] == 0) {
    			$$invalidate(1, fieldStates[i][j] = 1, fieldStates);

    			let locs = [
    				[i - 1, j - 1],
    				[i - 1, j],
    				[i - 1, j + 1],
    				[i, j - 1],
    				[i, j + 1],
    				[i + 1, j - 1],
    				[i + 1, j],
    				[i + 1, j + 1]
    			];

    			locs = locs.filter(e => {
    				return e[0] >= 0 && e[1] >= 0 && e[0] < rows && e[1] < cols;
    			});

    			locs.forEach(e => {
    				onBtnClick(e[0], e[1], event);
    			});

    			return;
    		}

    		$$invalidate(3, imagePath = "./vectors/sad.svg");
    		clearInterval(timer);
    		lost = true;
    	}

    	function onRefreshClick() {
    		$$invalidate(0, fields = []);
    		$$invalidate(1, fieldStates = []);
    		$$invalidate(2, elapsedTime = 0);
    		$$invalidate(3, imagePath = "./vectors/smile.svg");
    		lost = false;
    		clearInterval(timer);

    		timer = setInterval(
    			() => {
    				$$invalidate(2, elapsedTime++, elapsedTime);
    			},
    			1000
    		);

    		for (let i = 0; i < rows; i++) {
    			let rowField = [];
    			let rowFieldState = [];

    			for (let j = 0; j < cols; j++) {
    				rowField.push(0);
    				rowFieldState.push(0);
    			}

    			fields.push(rowField);
    			fieldStates.push(rowFieldState);
    		}

    		for (let i = 0; i < fields.length; i++) {
    			if ((i + 1) % 3 == 0) {
    				continue;
    			}

    			for (let j = 0; j < fields[i].length; j++) {
    				let r = Math.random();

    				if (r < 0.2) {
    					$$invalidate(0, fields[i][j] = -1, fields);
    				}
    			}
    		}

    		for (let i = 0; i < fields.length; i++) {
    			for (let j = 0; j < fields[i].length; j++) {
    				if (fields[i][j] == -1) {
    					continue;
    				}

    				let count = 0;

    				let locs = [
    					[i - 1, j - 1],
    					[i - 1, j],
    					[i - 1, j + 1],
    					[i, j - 1],
    					[i, j + 1],
    					[i + 1, j - 1],
    					[i + 1, j],
    					[i + 1, j + 1]
    				];

    				locs = locs.filter(e => {
    					return e[0] >= 0 && e[1] >= 0 && e[0] < rows && e[1] < cols;
    				});

    				locs.forEach(e => {
    					if (fields[e[0]][e[1]] == -1) {
    						count++;
    					}
    				});

    				$$invalidate(0, fields[i][j] = count, fields);
    			}
    		}
    	}

    	function checkIfWon() {
    		for (let i = 0; i < rows; i++) {
    			for (let j = 0; j < cols; j++) {
    				if (fields[i][j] == -1 && fieldStates[i][j] != 2) {
    					return false;
    				}
    			}
    		}

    		return true;
    	}

    	onRefreshClick();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Minesweeper> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = (i, j, e) => onBtnClick(i, j, e);
    	const mousedown_handler_1 = (i, j, e) => onBtnClick(i, j, e);
    	const mousedown_handler_2 = (i, j, e) => onBtnClick(i, j, e);
    	const mousedown_handler_3 = (i, j, e) => onBtnClick(i, j, e);

    	$$self.$capture_state = () => ({
    		rows,
    		cols,
    		fields,
    		fieldStates,
    		elapsedTime,
    		imagePath,
    		lost,
    		timer,
    		onBtnClick,
    		onRefreshClick,
    		checkIfWon
    	});

    	$$self.$inject_state = $$props => {
    		if ("rows" in $$props) $$invalidate(4, rows = $$props.rows);
    		if ("cols" in $$props) $$invalidate(5, cols = $$props.cols);
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("fieldStates" in $$props) $$invalidate(1, fieldStates = $$props.fieldStates);
    		if ("elapsedTime" in $$props) $$invalidate(2, elapsedTime = $$props.elapsedTime);
    		if ("imagePath" in $$props) $$invalidate(3, imagePath = $$props.imagePath);
    		if ("lost" in $$props) lost = $$props.lost;
    		if ("timer" in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		fieldStates,
    		elapsedTime,
    		imagePath,
    		rows,
    		cols,
    		onBtnClick,
    		onRefreshClick,
    		mousedown_handler,
    		mousedown_handler_1,
    		mousedown_handler_2,
    		mousedown_handler_3
    	];
    }

    class Minesweeper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Minesweeper",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/window/forms/Mail.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/window/forms/Mail.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (92:12) {#each mails as mail, i}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t0_value = /*mail*/ ctx[5].initials + "";
    	let t0;
    	let t1;
    	let div1;
    	let p1;
    	let t2_value = /*mail*/ ctx[5].sender + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*mail*/ ctx[5].title + "";
    	let t4;
    	let t5;
    	let p3;
    	let t6_value = /*mail*/ ctx[5].preview + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p3 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			set_style(p0, "background-color", /*mail*/ ctx[5].initialsColor);
    			attr_dev(p0, "class", "svelte-70lcao");
    			add_location(p0, file$3, 94, 24, 3223);
    			attr_dev(div0, "class", "mail-initials svelte-70lcao");
    			add_location(div0, file$3, 93, 20, 3171);
    			attr_dev(p1, "class", "svelte-70lcao");
    			add_location(p1, file$3, 99, 24, 3443);
    			attr_dev(p2, "class", "svelte-70lcao");
    			add_location(p2, file$3, 100, 24, 3488);
    			set_style(p3, "color", "hsl(0, 0%, 70%)");
    			attr_dev(p3, "class", "svelte-70lcao");
    			add_location(p3, file$3, 101, 24, 3532);
    			attr_dev(div1, "class", "mail-info svelte-70lcao");
    			add_location(div1, file$3, 98, 20, 3395);
    			attr_dev(div2, "class", "mail-section svelte-70lcao");
    			add_location(div2, file$3, 92, 16, 3092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p2);
    			append_dev(p2, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p3);
    			append_dev(p3, t6);
    			append_dev(div2, t7);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(92:12) {#each mails as mail, i}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#if mailImgPath != null}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*mailImgPath*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "mail");
    			attr_dev(img, "class", "svelte-70lcao");
    			add_location(img, file$3, 111, 12, 3810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mailImgPath*/ 2 && img.src !== (img_src_value = /*mailImgPath*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(111:8) {#if mailImgPath != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div24;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div14;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let p0;
    	let t2_value = /*language*/ ctx[0].text.mail.accounts + "";
    	let t2;
    	let t3;
    	let div1;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let div13;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let p3;
    	let t9_value = /*language*/ ctx[0].text.mail.folders + "";
    	let t9;
    	let t10;
    	let div4;
    	let p4;
    	let t12;
    	let div5;
    	let p5;
    	let t14;
    	let div6;
    	let p6;
    	let t16;
    	let div7;
    	let p7;
    	let t18;
    	let div8;
    	let p8;
    	let t20;
    	let div9;
    	let p9;
    	let t22;
    	let div10;
    	let p10;
    	let t24;
    	let div11;
    	let p11;
    	let t26;
    	let div12;
    	let p12;
    	let t28;
    	let div22;
    	let div20;
    	let div16;
    	let div15;
    	let input;
    	let input_placeholder_value;
    	let t29;
    	let button;
    	let t30;
    	let div19;
    	let div17;
    	let p13;
    	let t31_value = /*language*/ ctx[0].text.mail.focused + "";
    	let t31;
    	let t32;
    	let div18;
    	let p14;
    	let t33_value = /*language*/ ctx[0].text.mail.other + "";
    	let t33;
    	let t34;
    	let div21;
    	let t35;
    	let div23;
    	let each_value = /*mails*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*mailImgPath*/ ctx[1] != null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div24 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div14 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Hotmail";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "guyugmonkh@hotmail.com";
    			t7 = space();
    			div13 = element("div");
    			div3 = element("div");
    			img2 = element("img");
    			t8 = space();
    			p3 = element("p");
    			t9 = text(t9_value);
    			t10 = space();
    			div4 = element("div");
    			p4 = element("p");
    			p4.textContent = "Inbox";
    			t12 = space();
    			div5 = element("div");
    			p5 = element("p");
    			p5.textContent = "Drafts";
    			t14 = space();
    			div6 = element("div");
    			p6 = element("p");
    			p6.textContent = "Sent";
    			t16 = space();
    			div7 = element("div");
    			p7 = element("p");
    			p7.textContent = "Archive";
    			t18 = space();
    			div8 = element("div");
    			p8 = element("p");
    			p8.textContent = "Deleted";
    			t20 = space();
    			div9 = element("div");
    			p9 = element("p");
    			p9.textContent = "Outbox";
    			t22 = space();
    			div10 = element("div");
    			p10 = element("p");
    			p10.textContent = "Conversation History";
    			t24 = space();
    			div11 = element("div");
    			p11 = element("p");
    			p11.textContent = "Junk";
    			t26 = space();
    			div12 = element("div");
    			p12 = element("p");
    			p12.textContent = "RSS Feeds";
    			t28 = space();
    			div22 = element("div");
    			div20 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			input = element("input");
    			t29 = space();
    			button = element("button");
    			t30 = space();
    			div19 = element("div");
    			div17 = element("div");
    			p13 = element("p");
    			t31 = text(t31_value);
    			t32 = space();
    			div18 = element("div");
    			p14 = element("p");
    			t33 = text(t33_value);
    			t34 = space();
    			div21 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t35 = space();
    			div23 = element("div");
    			if (if_block) if_block.c();
    			if (img0.src !== (img0_src_value = "./images/mail-background.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "mountain");
    			attr_dev(img0, "draggable", "false");
    			attr_dev(img0, "class", "svelte-70lcao");
    			add_location(img0, file$3, 32, 4, 874);
    			if (img1.src !== (img1_src_value = "./vectors/user.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "user");
    			attr_dev(img1, "height", "20vh");
    			attr_dev(img1, "class", "svelte-70lcao");
    			add_location(img1, file$3, 36, 16, 1064);
    			attr_dev(p0, "class", "svelte-70lcao");
    			add_location(p0, file$3, 37, 16, 1138);
    			attr_dev(div0, "class", "account-text svelte-70lcao");
    			add_location(div0, file$3, 35, 12, 1021);
    			set_style(p1, "font-family", "SegoeUISemiBold");
    			attr_dev(p1, "class", "svelte-70lcao");
    			add_location(p1, file$3, 41, 16, 1253);
    			set_style(p2, "font-family", "SegoeUILight");
    			attr_dev(p2, "class", "svelte-70lcao");
    			add_location(p2, file$3, 42, 16, 1322);
    			attr_dev(div1, "class", "account-section svelte-70lcao");
    			add_location(div1, file$3, 40, 12, 1207);
    			attr_dev(div2, "class", "accounts svelte-70lcao");
    			add_location(div2, file$3, 34, 8, 986);
    			if (img2.src !== (img2_src_value = "./vectors/folder.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "folder");
    			attr_dev(img2, "height", "20vh");
    			attr_dev(img2, "class", "svelte-70lcao");
    			add_location(img2, file$3, 48, 16, 1507);
    			attr_dev(p3, "class", "svelte-70lcao");
    			add_location(p3, file$3, 49, 16, 1585);
    			attr_dev(div3, "class", "folders-text svelte-70lcao");
    			add_location(div3, file$3, 47, 12, 1464);
    			set_style(p4, "color", "rgb(185, 216, 255)");
    			attr_dev(p4, "class", "svelte-70lcao");
    			add_location(p4, file$3, 55, 16, 1777);
    			set_style(div4, "border-left", "0.25rem solid rgb(185, 216, 255)");
    			set_style(div4, "margin-top", "1rem");
    			attr_dev(div4, "class", "svelte-70lcao");
    			add_location(div4, file$3, 52, 12, 1653);
    			attr_dev(p5, "class", "svelte-70lcao");
    			add_location(p5, file$3, 57, 17, 1861);
    			attr_dev(div5, "class", "svelte-70lcao");
    			add_location(div5, file$3, 57, 12, 1856);
    			attr_dev(p6, "class", "svelte-70lcao");
    			add_location(p6, file$3, 58, 17, 1898);
    			attr_dev(div6, "class", "svelte-70lcao");
    			add_location(div6, file$3, 58, 12, 1893);
    			attr_dev(p7, "class", "svelte-70lcao");
    			add_location(p7, file$3, 59, 17, 1933);
    			attr_dev(div7, "class", "svelte-70lcao");
    			add_location(div7, file$3, 59, 12, 1928);
    			attr_dev(p8, "class", "svelte-70lcao");
    			add_location(p8, file$3, 60, 17, 1971);
    			attr_dev(div8, "class", "svelte-70lcao");
    			add_location(div8, file$3, 60, 12, 1966);
    			attr_dev(p9, "class", "svelte-70lcao");
    			add_location(p9, file$3, 61, 17, 2009);
    			attr_dev(div9, "class", "svelte-70lcao");
    			add_location(div9, file$3, 61, 12, 2004);
    			attr_dev(p10, "class", "svelte-70lcao");
    			add_location(p10, file$3, 62, 17, 2046);
    			attr_dev(div10, "class", "svelte-70lcao");
    			add_location(div10, file$3, 62, 12, 2041);
    			attr_dev(p11, "class", "svelte-70lcao");
    			add_location(p11, file$3, 63, 17, 2097);
    			attr_dev(div11, "class", "svelte-70lcao");
    			add_location(div11, file$3, 63, 12, 2092);
    			attr_dev(p12, "class", "svelte-70lcao");
    			add_location(p12, file$3, 64, 17, 2132);
    			attr_dev(div12, "class", "svelte-70lcao");
    			add_location(div12, file$3, 64, 12, 2127);
    			attr_dev(div13, "class", "folders svelte-70lcao");
    			add_location(div13, file$3, 46, 8, 1430);
    			attr_dev(div14, "class", "dashboard svelte-70lcao");
    			add_location(div14, file$3, 33, 4, 954);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*language*/ ctx[0].text.mail.search);
    			attr_dev(input, "class", "svelte-70lcao");
    			add_location(input, file$3, 72, 20, 2357);
    			attr_dev(button, "class", "svelte-70lcao");
    			add_location(button, file$3, 76, 20, 2507);
    			attr_dev(div15, "class", "search-bar svelte-70lcao");
    			add_location(div15, file$3, 71, 16, 2312);
    			attr_dev(div16, "class", "mail-list-header-top svelte-70lcao");
    			add_location(div16, file$3, 70, 12, 2261);
    			set_style(p13, "color", "rgb(185, 216, 255)");
    			attr_dev(p13, "class", "svelte-70lcao");
    			add_location(p13, file$3, 83, 20, 2766);
    			set_style(div17, "margin-left", "1rem");
    			set_style(div17, "border-bottom", "0.125rem solid rgb(185, 216, 255)");
    			attr_dev(div17, "class", "svelte-70lcao");
    			add_location(div17, file$3, 80, 16, 2626);
    			attr_dev(p14, "class", "svelte-70lcao");
    			add_location(p14, file$3, 87, 21, 2927);
    			attr_dev(div18, "class", "svelte-70lcao");
    			add_location(div18, file$3, 87, 16, 2922);
    			attr_dev(div19, "class", "mail-list-header-bottom svelte-70lcao");
    			add_location(div19, file$3, 79, 12, 2572);
    			attr_dev(div20, "class", "mail-list-header svelte-70lcao");
    			add_location(div20, file$3, 69, 8, 2218);
    			attr_dev(div21, "class", "mail-list-mails svelte-70lcao");
    			add_location(div21, file$3, 90, 8, 3009);
    			attr_dev(div22, "class", "mail-list svelte-70lcao");
    			add_location(div22, file$3, 68, 4, 2186);
    			attr_dev(div23, "class", "mail-view svelte-70lcao");
    			add_location(div23, file$3, 109, 4, 3740);
    			attr_dev(div24, "class", "main svelte-70lcao");
    			attr_dev(div24, "draggable", "false");
    			add_location(div24, file$3, 31, 0, 833);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
    			append_dev(div24, img0);
    			append_dev(div24, t0);
    			append_dev(div24, div14);
    			append_dev(div14, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(div14, t7);
    			append_dev(div14, div13);
    			append_dev(div13, div3);
    			append_dev(div3, img2);
    			append_dev(div3, t8);
    			append_dev(div3, p3);
    			append_dev(p3, t9);
    			append_dev(div13, t10);
    			append_dev(div13, div4);
    			append_dev(div4, p4);
    			append_dev(div13, t12);
    			append_dev(div13, div5);
    			append_dev(div5, p5);
    			append_dev(div13, t14);
    			append_dev(div13, div6);
    			append_dev(div6, p6);
    			append_dev(div13, t16);
    			append_dev(div13, div7);
    			append_dev(div7, p7);
    			append_dev(div13, t18);
    			append_dev(div13, div8);
    			append_dev(div8, p8);
    			append_dev(div13, t20);
    			append_dev(div13, div9);
    			append_dev(div9, p9);
    			append_dev(div13, t22);
    			append_dev(div13, div10);
    			append_dev(div10, p10);
    			append_dev(div13, t24);
    			append_dev(div13, div11);
    			append_dev(div11, p11);
    			append_dev(div13, t26);
    			append_dev(div13, div12);
    			append_dev(div12, p12);
    			append_dev(div24, t28);
    			append_dev(div24, div22);
    			append_dev(div22, div20);
    			append_dev(div20, div16);
    			append_dev(div16, div15);
    			append_dev(div15, input);
    			append_dev(div15, t29);
    			append_dev(div15, button);
    			append_dev(div20, t30);
    			append_dev(div20, div19);
    			append_dev(div19, div17);
    			append_dev(div17, p13);
    			append_dev(p13, t31);
    			append_dev(div19, t32);
    			append_dev(div19, div18);
    			append_dev(div18, p14);
    			append_dev(p14, t33);
    			append_dev(div22, t34);
    			append_dev(div22, div21);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div21, null);
    			}

    			append_dev(div24, t35);
    			append_dev(div24, div23);
    			if (if_block) if_block.m(div23, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*language*/ 1 && t2_value !== (t2_value = /*language*/ ctx[0].text.mail.accounts + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*language*/ 1 && t9_value !== (t9_value = /*language*/ ctx[0].text.mail.folders + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*language*/ 1 && input_placeholder_value !== (input_placeholder_value = /*language*/ ctx[0].text.mail.search)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*language*/ 1 && t31_value !== (t31_value = /*language*/ ctx[0].text.mail.focused + "")) set_data_dev(t31, t31_value);
    			if (dirty & /*language*/ 1 && t33_value !== (t33_value = /*language*/ ctx[0].text.mail.other + "")) set_data_dev(t33, t33_value);

    			if (dirty & /*onMailClick, mails*/ 12) {
    				each_value = /*mails*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div21, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*mailImgPath*/ ctx[1] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div23, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div24);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
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
    	validate_slots("Mail", slots, []);
    	let language = get_store_value(Language);

    	Language.subscribe(data => {
    		$$invalidate(0, language = data);
    	});

    	let mails = new Array();

    	mails.push({
    		initials: "N",
    		initialsColor: "#e75e78",
    		sender: "Netflix",
    		title: "What's playing next, Gumbee?",
    		preview: "Watch one of our top picks for you.",
    		sentDate: new Date(),
    		mailImgPath: "./images/netflix-mail1.jpg"
    	});

    	mails.push({
    		initials: "N",
    		initialsColor: "#e75e78",
    		sender: "Netflix",
    		title: "Top suggestions for Guyug",
    		preview: "Watch one of our top picks for you.",
    		sentDate: new Date(),
    		mailImgPath: "./images/netflix-mail2.jpg"
    	});

    	let mailImgPath = null;

    	function onMailClick(idx) {
    		$$invalidate(1, mailImgPath = mails[idx].mailImgPath);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => onMailClick(i);

    	$$self.$capture_state = () => ({
    		Language,
    		get: get_store_value,
    		language,
    		mails,
    		mailImgPath,
    		onMailClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("mails" in $$props) $$invalidate(2, mails = $$props.mails);
    		if ("mailImgPath" in $$props) $$invalidate(1, mailImgPath = $$props.mailImgPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [language, mailImgPath, mails, onMailClick, click_handler];
    }

    class Mail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mail",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/window/forms/Paint.svelte generated by Svelte v3.38.2 */

    const { window: window_1 } = globals;
    const file$2 = "src/components/window/forms/Paint.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (167:16) {#each topPresets as preset}
    function create_each_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*preset*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			set_style(button, "background-color", /*preset*/ ctx[27]);
    			attr_dev(button, "class", "svelte-esda6r");
    			add_location(button, file$2, 167, 20, 4602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(167:16) {#each topPresets as preset}",
    		ctx
    	});

    	return block;
    }

    // (177:16) {#each bottomPresets as preset}
    function create_each_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*preset*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			set_style(button, "background-color", /*preset*/ ctx[27]);
    			attr_dev(button, "class", "svelte-esda6r");
    			add_location(button, file$2, 177, 20, 4935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(177:16) {#each bottomPresets as preset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let label;
    	let t0_value = /*language*/ ctx[0].text.paint.size + "";
    	let t0;
    	let t1;
    	let t2;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t8;
    	let input;
    	let t9;
    	let div3;
    	let div1;
    	let t10;
    	let div2;
    	let t11;
    	let button0;
    	let t12_value = /*language*/ ctx[0].text.paint.clear + "";
    	let t12;
    	let t13;
    	let button1;
    	let t14_value = /*language*/ ctx[0].text.paint.save + "";
    	let t14;
    	let t15;
    	let canvas;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*topPresets*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*bottomPresets*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "1px";
    			option1 = element("option");
    			option1.textContent = "2px";
    			option2 = element("option");
    			option2.textContent = "4px";
    			option3 = element("option");
    			option3.textContent = "8px";
    			option4 = element("option");
    			option4.textContent = "16px";
    			t8 = space();
    			input = element("input");
    			t9 = space();
    			div3 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			button0 = element("button");
    			t12 = text(t12_value);
    			t13 = space();
    			button1 = element("button");
    			t14 = text(t14_value);
    			t15 = space();
    			canvas = element("canvas");
    			attr_dev(label, "for", "sizes");
    			attr_dev(label, "class", "svelte-esda6r");
    			add_location(label, file$2, 149, 12, 3925);
    			option0.__value = "1";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 151, 16, 4064);
    			option1.__value = "2";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 152, 16, 4111);
    			option2.__value = "4";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 153, 16, 4158);
    			option3.__value = "8";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 154, 16, 4205);
    			option4.__value = "16";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 155, 16, 4252);
    			attr_dev(select, "name", "sizes");
    			attr_dev(select, "id", "sizes");
    			if (/*burshSize*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$2, 150, 12, 3992);
    			attr_dev(div0, "class", "size-picker svelte-esda6r");
    			add_location(div0, file$2, 148, 8, 3887);
    			attr_dev(input, "type", "color");
    			set_style(input, "margin", ".4rem");
    			set_style(input, "height", "2rem");
    			attr_dev(input, "id", "color-picker");
    			add_location(input, file$2, 158, 8, 4330);
    			attr_dev(div1, "class", "svelte-esda6r");
    			add_location(div1, file$2, 165, 12, 4531);
    			attr_dev(div2, "class", "svelte-esda6r");
    			add_location(div2, file$2, 175, 12, 4861);
    			attr_dev(div3, "class", "color-presets svelte-esda6r");
    			add_location(div3, file$2, 164, 8, 4491);
    			attr_dev(button0, "class", "svelte-esda6r");
    			add_location(button0, file$2, 186, 8, 5205);
    			attr_dev(button1, "class", "svelte-esda6r");
    			add_location(button1, file$2, 187, 8, 5277);
    			attr_dev(div4, "class", "top-section svelte-esda6r");
    			attr_dev(div4, "draggable", "false");
    			add_location(div4, file$2, 147, 4, 3835);
    			attr_dev(canvas, "id", "_canvas");
    			attr_dev(canvas, "width", /*cnvW*/ ctx[10]);
    			attr_dev(canvas, "height", /*cnvH*/ ctx[11]);
    			attr_dev(canvas, "class", "svelte-esda6r");
    			add_location(canvas, file$2, 189, 4, 5354);
    			attr_dev(div5, "class", "main svelte-esda6r");
    			add_location(div5, file$2, 146, 0, 3812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div0, t2);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			select_option(select, /*burshSize*/ ctx[2]);
    			append_dev(div4, t8);
    			append_dev(div4, input);
    			set_input_value(input, /*color*/ ctx[1]);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t10);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div4, t11);
    			append_dev(div4, button0);
    			append_dev(button0, t12);
    			append_dev(div4, t13);
    			append_dev(div4, button1);
    			append_dev(button1, t14);
    			append_dev(div5, t15);
    			append_dev(div5, canvas);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "mouseup", /*onmouseup*/ ctx[7], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
    					listen_dev(button0, "click", /*onclear*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*onsave*/ ctx[9], false, false, false),
    					listen_dev(canvas, "mousedown", /*onmousedown*/ ctx[6], false, false, false),
    					listen_dev(canvas, "mousemove", /*onmousemove*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*language*/ 1 && t0_value !== (t0_value = /*language*/ ctx[0].text.paint.size + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*burshSize*/ 4) {
    				select_option(select, /*burshSize*/ ctx[2]);
    			}

    			if (dirty[0] & /*color*/ 2) {
    				set_input_value(input, /*color*/ ctx[1]);
    			}

    			if (dirty[0] & /*topPresets, color*/ 10) {
    				each_value_1 = /*topPresets*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*bottomPresets, color*/ 18) {
    				each_value = /*bottomPresets*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*language*/ 1 && t12_value !== (t12_value = /*language*/ ctx[0].text.paint.clear + "")) set_data_dev(t12, t12_value);
    			if (dirty[0] & /*language*/ 1 && t14_value !== (t14_value = /*language*/ ctx[0].text.paint.save + "")) set_data_dev(t14, t14_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function download(canvas, filename) {
    	/// create an "off-screen" anchor tag
    	let lnk = document.createElement("a"), e;

    	/// the key here is to set the download attribute of the a tag
    	lnk.download = filename;

    	/// convert canvas content to data-uri for link. When download
    	/// attribute is set the content pointed to by link will be
    	/// pushed as "download" in HTML5 capable browsers
    	lnk.href = canvas.toDataURL("image/png");

    	/// create a "fake" click-event to trigger the download
    	if (document.createEvent) {
    		e = document.createEvent("MouseEvents");
    		e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    		lnk.dispatchEvent(e);
    	} else if (lnk.fireEvent) {
    		lnk.fireEvent("onclick");
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Paint", slots, []);
    	let language = get_store_value(Language);

    	Language.subscribe(data => {
    		$$invalidate(0, language = data);
    	});

    	let topPresets = [
    		"#000000",
    		"#7F7F7F",
    		"#880015",
    		"#ED1C24",
    		"#FF7F27",
    		"#FFF200",
    		"#22B14C",
    		"#00A2E8",
    		"#3F48CC",
    		"#A349A4"
    	];

    	let bottomPresets = [
    		"#FFFFFF",
    		"#C3C3C3",
    		"#B97A57",
    		"#FFAEC9",
    		"#FFC90E",
    		"#EFE4B0",
    		"#B5E61D",
    		"#99D9EA",
    		"#7092BE",
    		"#C8BFE7"
    	];

    	let color = "#000";
    	let mouseDown = false;
    	let prevX, prevY, currX, currY;
    	let burshSize = 1;
    	let ctx = null;
    	let cnv = null;

    	function onmousemove(e) {
    		if (mouseDown) {
    			const boundRect = cnv.getBoundingClientRect();
    			prevX = currX;
    			prevY = currY;
    			currX = e.clientX - boundRect.left;
    			currY = e.clientY - boundRect.top;
    			line(prevX, prevY, currX, currY, burshSize, color);
    		}
    	}

    	function onmousedown(e) {
    		mouseDown = true;

    		if (!cnv) {
    			cnv = document.getElementById("_canvas");
    		}

    		const boundRect = cnv.getBoundingClientRect();
    		prevX = e.clientX - boundRect.left;
    		prevY = e.clientY - boundRect.top;
    		currX = prevX;
    		currY = prevY;
    	}

    	function onmouseup() {
    		mouseDown = false;
    	}

    	function line(px, py, x, y, w, c) {
    		if (!ctx || !cnv) {
    			cnv = document.getElementById("_canvas");
    			ctx = cnv.getContext("2d");
    		}

    		ctx.beginPath();
    		ctx.moveTo(px, py);
    		ctx.lineTo(x, y);
    		ctx.strokeStyle = c;
    		ctx.lineWidth = w;
    		ctx.stroke();
    		ctx.closePath();
    	}

    	function onclear() {
    		if (!ctx || !cnv) {
    			cnv = document.getElementById("_canvas");
    			ctx = cnv.getContext("2d");
    		}

    		ctx.clearRect(0, 0, cnv.width, cnv.height);
    	}

    	function onsave() {
    		if (!ctx || !cnv) {
    			cnv = document.getElementById("_canvas");
    			ctx = cnv.getContext("2d");
    		}

    		download(cnv, "paintimage.png");
    	}

    	let root = document.querySelector(":root"),
    		style = window.getComputedStyle(root, null).getPropertyValue("font-size"),
    		fontSize = parseFloat(style);

    	let cnvW = document.documentElement.clientWidth * 0.55;
    	let cnvH = document.documentElement.clientHeight * 0.6 - fontSize * 4;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Paint> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		burshSize = select_value(this);
    		$$invalidate(2, burshSize);
    	}

    	function input_input_handler() {
    		color = this.value;
    		$$invalidate(1, color);
    	}

    	const click_handler = preset => {
    		$$invalidate(1, color = preset);
    	};

    	const click_handler_1 = preset => {
    		$$invalidate(1, color = preset);
    	};

    	$$self.$capture_state = () => ({
    		Language,
    		get: get_store_value,
    		language,
    		topPresets,
    		bottomPresets,
    		color,
    		mouseDown,
    		prevX,
    		prevY,
    		currX,
    		currY,
    		burshSize,
    		ctx,
    		cnv,
    		onmousemove,
    		onmousedown,
    		onmouseup,
    		line,
    		onclear,
    		onsave,
    		download,
    		root,
    		style,
    		fontSize,
    		cnvW,
    		cnvH
    	});

    	$$self.$inject_state = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("topPresets" in $$props) $$invalidate(3, topPresets = $$props.topPresets);
    		if ("bottomPresets" in $$props) $$invalidate(4, bottomPresets = $$props.bottomPresets);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("mouseDown" in $$props) mouseDown = $$props.mouseDown;
    		if ("prevX" in $$props) prevX = $$props.prevX;
    		if ("prevY" in $$props) prevY = $$props.prevY;
    		if ("currX" in $$props) currX = $$props.currX;
    		if ("currY" in $$props) currY = $$props.currY;
    		if ("burshSize" in $$props) $$invalidate(2, burshSize = $$props.burshSize);
    		if ("ctx" in $$props) ctx = $$props.ctx;
    		if ("cnv" in $$props) cnv = $$props.cnv;
    		if ("root" in $$props) root = $$props.root;
    		if ("style" in $$props) style = $$props.style;
    		if ("fontSize" in $$props) fontSize = $$props.fontSize;
    		if ("cnvW" in $$props) $$invalidate(10, cnvW = $$props.cnvW);
    		if ("cnvH" in $$props) $$invalidate(11, cnvH = $$props.cnvH);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		language,
    		color,
    		burshSize,
    		topPresets,
    		bottomPresets,
    		onmousemove,
    		onmousedown,
    		onmouseup,
    		onclear,
    		onsave,
    		cnvW,
    		cnvH,
    		select_change_handler,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Paint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Paint",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Icon.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/components/Icon.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let p;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			p = element("p");
    			t = text(/*text*/ ctx[3]);
    			attr_dev(p, "class", "svelte-1w8gfde");
    			add_location(p, file$1, 27, 4, 663);
    			set_style(button, "top", /*top*/ ctx[0]);
    			set_style(button, "left", /*left*/ ctx[1]);
    			set_style(button, "background-image", "url(" + /*imgPath*/ ctx[2] + ")");
    			set_style(button, "background-color", /*backgroundColor*/ ctx[4]);
    			attr_dev(button, "class", "svelte-1w8gfde");
    			add_location(button, file$1, 20, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, p);
    			append_dev(p, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "mouseenter", /*onmouseenter*/ ctx[5], false, false, false),
    					listen_dev(button, "mouseleave", /*onmouseleave*/ ctx[6], false, false, false),
    					listen_dev(button, "mousedown", /*onmousedown*/ ctx[7], false, false, false),
    					listen_dev(button, "dblclick", /*dblclick_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 8) set_data_dev(t, /*text*/ ctx[3]);

    			if (dirty & /*top*/ 1) {
    				set_style(button, "top", /*top*/ ctx[0]);
    			}

    			if (dirty & /*left*/ 2) {
    				set_style(button, "left", /*left*/ ctx[1]);
    			}

    			if (dirty & /*imgPath*/ 4) {
    				set_style(button, "background-image", "url(" + /*imgPath*/ ctx[2] + ")");
    			}

    			if (dirty & /*backgroundColor*/ 16) {
    				set_style(button, "background-color", /*backgroundColor*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
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
    	validate_slots("Icon", slots, []);
    	let { top } = $$props;
    	let { left } = $$props;
    	let { imgPath } = $$props;
    	let { text = "sdasdasdasdasdasd" } = $$props;
    	let backgroundColor = "transparent";

    	function onmouseenter() {
    		$$invalidate(4, backgroundColor = "rgba(130, 170, 200, 0.5)");
    	}

    	function onmouseleave() {
    		$$invalidate(4, backgroundColor = "transparent");
    	}

    	function onmousedown() {
    		$$invalidate(4, backgroundColor = "rgba(68, 121, 200, 0.6)");
    	}

    	const writable_props = ["top", "left", "imgPath", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("top" in $$props) $$invalidate(0, top = $$props.top);
    		if ("left" in $$props) $$invalidate(1, left = $$props.left);
    		if ("imgPath" in $$props) $$invalidate(2, imgPath = $$props.imgPath);
    		if ("text" in $$props) $$invalidate(3, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		top,
    		left,
    		imgPath,
    		text,
    		backgroundColor,
    		onmouseenter,
    		onmouseleave,
    		onmousedown
    	});

    	$$self.$inject_state = $$props => {
    		if ("top" in $$props) $$invalidate(0, top = $$props.top);
    		if ("left" in $$props) $$invalidate(1, left = $$props.left);
    		if ("imgPath" in $$props) $$invalidate(2, imgPath = $$props.imgPath);
    		if ("text" in $$props) $$invalidate(3, text = $$props.text);
    		if ("backgroundColor" in $$props) $$invalidate(4, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		top,
    		left,
    		imgPath,
    		text,
    		backgroundColor,
    		onmouseenter,
    		onmouseleave,
    		onmousedown,
    		dblclick_handler
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { top: 0, left: 1, imgPath: 2, text: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*top*/ ctx[0] === undefined && !("top" in props)) {
    			console.warn("<Icon> was created without expected prop 'top'");
    		}

    		if (/*left*/ ctx[1] === undefined && !("left" in props)) {
    			console.warn("<Icon> was created without expected prop 'left'");
    		}

    		if (/*imgPath*/ ctx[2] === undefined && !("imgPath" in props)) {
    			console.warn("<Icon> was created without expected prop 'imgPath'");
    		}
    	}

    	get top() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgPath() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgPath(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    // (73:4) <Window         windowId="_mail"         left="10vw"         top="20vh"         width="60vw"         minWidth="50vw"         height="65vh"         minHeight="40vh"         icon="./vectors/email.svg"         title={language.text.mailTitle}         itemPosition={0}     >
    function create_default_slot_3(ctx) {
    	let mail;
    	let current;
    	mail = new Mail({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mail, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(73:4) <Window         windowId=\\\"_mail\\\"         left=\\\"10vw\\\"         top=\\\"20vh\\\"         width=\\\"60vw\\\"         minWidth=\\\"50vw\\\"         height=\\\"65vh\\\"         minHeight=\\\"40vh\\\"         icon=\\\"./vectors/email.svg\\\"         title={language.text.mailTitle}         itemPosition={0}     >",
    		ctx
    	});

    	return block;
    }

    // (87:4) <Window         windowId="_paint"         left="20vw"         top="10vh"         width="60vw"         height="70vh"         minWidth="30vw"         minHeight="20vh"         icon="./vectors/microsoft-paint.svg"         title={language.text.paintTitle}         itemPosition={1}     >
    function create_default_slot_2(ctx) {
    	let paint;
    	let current;
    	paint = new Paint({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(paint.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paint, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paint.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paint.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paint, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(87:4) <Window         windowId=\\\"_paint\\\"         left=\\\"20vw\\\"         top=\\\"10vh\\\"         width=\\\"60vw\\\"         height=\\\"70vh\\\"         minWidth=\\\"30vw\\\"         minHeight=\\\"20vh\\\"         icon=\\\"./vectors/microsoft-paint.svg\\\"         title={language.text.paintTitle}         itemPosition={1}     >",
    		ctx
    	});

    	return block;
    }

    // (101:4) <Window         windowId="_calculator"         left="25vw"         top="15vh"         width="20vw"         height="60vh"         minWidth="15vw"         minHeight="40vh"         icon="./vectors/calculator.svg"         title={language.text.calculatorTitle}         itemPosition={2}     >
    function create_default_slot_1(ctx) {
    	let calculator;
    	let current;
    	calculator = new Calculator({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(calculator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(calculator, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calculator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calculator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(calculator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(101:4) <Window         windowId=\\\"_calculator\\\"         left=\\\"25vw\\\"         top=\\\"15vh\\\"         width=\\\"20vw\\\"         height=\\\"60vh\\\"         minWidth=\\\"15vw\\\"         minHeight=\\\"40vh\\\"         icon=\\\"./vectors/calculator.svg\\\"         title={language.text.calculatorTitle}         itemPosition={2}     >",
    		ctx
    	});

    	return block;
    }

    // (115:4) <Window         windowId="_minesweeper"         left="40vw"         top="10vh"         width="40vw"         height="60vh"         minWidth="40vw"         minHeight="60vh"         icon="./vectors/bomb.svg"         title={language.text.minesweeperTitle}         itemPosition={3}     >
    function create_default_slot(ctx) {
    	let minesweeper;
    	let current;
    	minesweeper = new Minesweeper({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(minesweeper.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(minesweeper, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minesweeper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minesweeper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(minesweeper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(115:4) <Window         windowId=\\\"_minesweeper\\\"         left=\\\"40vw\\\"         top=\\\"10vh\\\"         width=\\\"40vw\\\"         height=\\\"60vh\\\"         minWidth=\\\"40vw\\\"         minHeight=\\\"60vh\\\"         icon=\\\"./vectors/bomb.svg\\\"         title={language.text.minesweeperTitle}         itemPosition={3}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let icon0;
    	let t1;
    	let icon1;
    	let t2;
    	let icon2;
    	let t3;
    	let taskbar;
    	let t4;
    	let window0;
    	let t5;
    	let window1;
    	let t6;
    	let window2;
    	let t7;
    	let window3;
    	let current;
    	let mounted;
    	let dispose;

    	icon0 = new Icon({
    			props: {
    				top: "0",
    				left: "0",
    				imgPath: "../images/github-icon.png",
    				text: "Github"
    			},
    			$$inline: true
    		});

    	icon0.$on("dblclick", /*dblclick_handler*/ ctx[3]);

    	icon1 = new Icon({
    			props: {
    				top: "5rem",
    				left: "0",
    				imgPath: "../vectors/email-send.svg",
    				text: "Mail me"
    			},
    			$$inline: true
    		});

    	icon1.$on("dblclick", /*dblclick_handler_1*/ ctx[4]);

    	icon2 = new Icon({
    			props: {
    				top: "10rem",
    				left: "0",
    				imgPath: "../images/linkedin-icon.png",
    				text: "Linkedin"
    			},
    			$$inline: true
    		});

    	icon2.$on("dblclick", /*dblclick_handler_2*/ ctx[5]);
    	taskbar = new Taskbar({ $$inline: true });

    	window0 = new Window({
    			props: {
    				windowId: "_mail",
    				left: "10vw",
    				top: "20vh",
    				width: "60vw",
    				minWidth: "50vw",
    				height: "65vh",
    				minHeight: "40vh",
    				icon: "./vectors/email.svg",
    				title: /*language*/ ctx[0].text.mailTitle,
    				itemPosition: 0,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window1 = new Window({
    			props: {
    				windowId: "_paint",
    				left: "20vw",
    				top: "10vh",
    				width: "60vw",
    				height: "70vh",
    				minWidth: "30vw",
    				minHeight: "20vh",
    				icon: "./vectors/microsoft-paint.svg",
    				title: /*language*/ ctx[0].text.paintTitle,
    				itemPosition: 1,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window2 = new Window({
    			props: {
    				windowId: "_calculator",
    				left: "25vw",
    				top: "15vh",
    				width: "20vw",
    				height: "60vh",
    				minWidth: "15vw",
    				minHeight: "40vh",
    				icon: "./vectors/calculator.svg",
    				title: /*language*/ ctx[0].text.calculatorTitle,
    				itemPosition: 2,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window3 = new Window({
    			props: {
    				windowId: "_minesweeper",
    				left: "40vw",
    				top: "10vh",
    				width: "40vw",
    				height: "60vh",
    				minWidth: "40vw",
    				minHeight: "60vh",
    				icon: "./vectors/bomb.svg",
    				title: /*language*/ ctx[0].text.minesweeperTitle,
    				itemPosition: 3,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			create_component(icon0.$$.fragment);
    			t1 = space();
    			create_component(icon1.$$.fragment);
    			t2 = space();
    			create_component(icon2.$$.fragment);
    			t3 = space();
    			create_component(taskbar.$$.fragment);
    			t4 = space();
    			create_component(window0.$$.fragment);
    			t5 = space();
    			create_component(window1.$$.fragment);
    			t6 = space();
    			create_component(window2.$$.fragment);
    			t7 = space();
    			create_component(window3.$$.fragment);
    			if (img.src !== (img_src_value = "./vectors/Flat-Mountains.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-1058rx3");
    			add_location(img, file, 36, 8, 1362);
    			attr_dev(div, "class", "background svelte-1058rx3");
    			add_location(div, file, 35, 4, 1300);
    			attr_dev(main, "draggable", "false");
    			add_location(main, file, 34, 0, 1243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, img);
    			append_dev(main, t0);
    			mount_component(icon0, main, null);
    			append_dev(main, t1);
    			mount_component(icon1, main, null);
    			append_dev(main, t2);
    			mount_component(icon2, main, null);
    			append_dev(main, t3);
    			mount_component(taskbar, main, null);
    			append_dev(main, t4);
    			mount_component(window0, main, null);
    			append_dev(main, t5);
    			mount_component(window1, main, null);
    			append_dev(main, t6);
    			mount_component(window2, main, null);
    			append_dev(main, t7);
    			mount_component(window3, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*onBackgroundClick*/ ctx[1], false, false, false),
    					listen_dev(main, "dragstart", prevent_default(/*dragstart_handler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const window0_changes = {};
    			if (dirty & /*language*/ 1) window0_changes.title = /*language*/ ctx[0].text.mailTitle;

    			if (dirty & /*$$scope*/ 64) {
    				window0_changes.$$scope = { dirty, ctx };
    			}

    			window0.$set(window0_changes);
    			const window1_changes = {};
    			if (dirty & /*language*/ 1) window1_changes.title = /*language*/ ctx[0].text.paintTitle;

    			if (dirty & /*$$scope*/ 64) {
    				window1_changes.$$scope = { dirty, ctx };
    			}

    			window1.$set(window1_changes);
    			const window2_changes = {};
    			if (dirty & /*language*/ 1) window2_changes.title = /*language*/ ctx[0].text.calculatorTitle;

    			if (dirty & /*$$scope*/ 64) {
    				window2_changes.$$scope = { dirty, ctx };
    			}

    			window2.$set(window2_changes);
    			const window3_changes = {};
    			if (dirty & /*language*/ 1) window3_changes.title = /*language*/ ctx[0].text.minesweeperTitle;

    			if (dirty & /*$$scope*/ 64) {
    				window3_changes.$$scope = { dirty, ctx };
    			}

    			window3.$set(window3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(taskbar.$$.fragment, local);
    			transition_in(window0.$$.fragment, local);
    			transition_in(window1.$$.fragment, local);
    			transition_in(window2.$$.fragment, local);
    			transition_in(window3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(taskbar.$$.fragment, local);
    			transition_out(window0.$$.fragment, local);
    			transition_out(window1.$$.fragment, local);
    			transition_out(window2.$$.fragment, local);
    			transition_out(window3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(taskbar);
    			destroy_component(window0);
    			destroy_component(window1);
    			destroy_component(window2);
    			destroy_component(window3);
    			mounted = false;
    			run_all(dispose);
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
    	
    	let language = get_store_value(Language);

    	Language.subscribe(data => {
    		$$invalidate(0, language = data);
    	});

    	let onBackgroundClick = () => {
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
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function dragstart_handler(event) {
    		bubble($$self, event);
    	}

    	const dblclick_handler = () => {
    		window.open("https://github.com/gumbernator", "_blank");
    	};

    	const dblclick_handler_1 = () => {
    		window.location.href = "mailto:guyugmonkh@hotmail.com";
    	};

    	const dblclick_handler_2 = () => {
    		window.open("https://mn.linkedin.com/in/guyugmonkh-lkhagvachuluun-022833182", "_blank");
    	};

    	$$self.$capture_state = () => ({
    		Taskbar,
    		Window,
    		Windows,
    		TaskbarItemStates,
    		ChosenPanel,
    		Calculator,
    		Minesweeper,
    		Language,
    		get: get_store_value,
    		Mail,
    		Paint,
    		Icon,
    		language,
    		onBackgroundClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("onBackgroundClick" in $$props) $$invalidate(1, onBackgroundClick = $$props.onBackgroundClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		language,
    		onBackgroundClick,
    		dragstart_handler,
    		dblclick_handler,
    		dblclick_handler_1,
    		dblclick_handler_2
    	];
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
